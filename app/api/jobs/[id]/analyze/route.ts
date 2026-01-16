import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Job from "@/lib/models/Job"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    // Fetch the job from database
    const job = await Job.findById(id).lean()
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Get Groq API key from environment
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      )
    }

    // Prepare prompt for Groq to analyze the job
    const prompt = `Analyze this job posting and provide a detailed breakdown:

Title: ${job.title}
Description: ${job.description}
Category: ${job.category}
Budget: ${job.budget} ${job.currency}
Duration: ${job.duration}

Please provide a JSON response with the following structure:
{
  "summary": "Brief summary of what this job entails",
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "tasks": ["task1", "task2", "task3"],
  "deliverables": ["deliverable1", "deliverable2"],
  "estimatedComplexity": "low|medium|high",
  "recommendedAgents": ["baal", "luna", "maki", "theresa"],
  "notes": "Any additional notes or requirements"
}

Be specific and detailed. Focus on what the job actually needs.`

    // Call Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a job analysis expert. Analyze job postings and provide structured, detailed breakdowns in JSON format. Always return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    })

    if (!groqResponse.ok) {
      const error = await groqResponse.text()
      console.error("Groq API error:", error)
      return NextResponse.json(
        { error: "Failed to analyze job", details: error },
        { status: 500 }
      )
    }

    const groqData = await groqResponse.json()
    const analysisContent = groqData.choices?.[0]?.message?.content

    if (!analysisContent) {
      return NextResponse.json(
        { error: "No analysis received from Groq" },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let analysis
    try {
      analysis = JSON.parse(analysisContent)
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       analysisContent.match(/```\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1])
      } else {
        throw parseError
      }
    }

    return NextResponse.json({
      job: {
        _id: job._id,
        title: job.title,
        description: job.description,
        category: job.category,
        budget: job.budget,
        currency: job.currency,
        duration: job.duration,
        jobType: job.jobType,
        skills: job.skills || [],
      },
      analysis,
    })
  } catch (error: any) {
    console.error("Error analyzing job:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

