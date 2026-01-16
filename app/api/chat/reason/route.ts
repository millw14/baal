import { NextRequest, NextResponse } from "next/server"

// Detect if message is casual conversation vs actual inquiry
function isCasualConversation(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim()
  
  // Common casual greetings and small talk
  const casualPatterns = [
    /^(hi|hello|hey|sup|what's up|greetings|good morning|good afternoon|good evening)$/i,
    /^(how are you|how's it going|how do you do|what's up|how are things)$/i,
    /^(thanks|thank you|thx|ty)$/i,
    /^(bye|goodbye|see you|later)$/i,
    /^(yes|yeah|yep|no|nope|ok|okay|sure|cool|nice)$/i,
  ]
  
  // Check if message matches casual patterns
  if (casualPatterns.some(pattern => pattern.test(lowerMessage))) {
    return true
  }
  
  // Check if message is too short (likely casual)
  const words = lowerMessage.split(/\s+/)
  if (words.length <= 3 && lowerMessage.length < 20) {
    return true
  }
  
  // Check for inquiry indicators
  const inquiryIndicators = [
    'want to', 'need to', 'help me', 'create', 'build', 'start', 'set up', 'develop',
    'make', 'design', 'launch', 'project', 'company', 'business', 'app', 'website',
    'dapp', 'smart contract', 'nft', 'token', 'dao', 'defi', 'marketplace', 'platform'
  ]
  
  // If message contains inquiry indicators, it's not casual
  if (inquiryIndicators.some(indicator => lowerMessage.includes(indicator))) {
    return false
  }
  
  return false
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Check if it's casual conversation - return simple response
    if (isCasualConversation(message)) {
      return NextResponse.json({
        isCasual: true,
        response: "I'm here to help you build! What would you like to create or work on?"
      })
    }

    // Get Groq API key from environment
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      )
    }

    // Prepare prompt for Groq to analyze the user's request
    const prompt = `Analyze this user request and determine what information we need to collect to help them effectively:

User request: "${message}"

Please provide a JSON response with the following structure:
{
  "summary": "Brief summary of what the user wants to accomplish",
  "category": "Category of the request (e.g., 'Tech Startup', 'Web Development', 'Design Project', 'Marketing Campaign', etc.)",
  "complexity": "low|medium|high",
  "recommendedAgents": ["baal", "luna", "maki"],
  "questions": [
    {
      "key": "specific_question_identifier",
      "label": "Human-readable question label",
      "type": "text|textarea|select|number|date",
      "placeholder": "Optional placeholder text",
      "options": ["option1", "option2"] // Only if type is "select"
    }
  ],
  "reasoning": "Explain what additional information would help create a better solution"
}

Generate 3-5 specific questions that would help understand:
- The scope and scale of the project
- Specific requirements or features needed
- Timeline expectations
- Target audience or goals
- Any technical constraints or preferences

Be specific and actionable.`

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
            content: "You are a helpful AI assistant that analyzes user requests and generates relevant questions to collect detailed information. Always return valid JSON.",
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
      const errorText = await groqResponse.text()
      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = errorText
      }
      console.error("Groq API error:", {
        status: groqResponse.status,
        statusText: groqResponse.statusText,
        error: errorDetails
      })
      return NextResponse.json(
        { 
          error: "Failed to analyze request", 
          details: errorDetails,
          status: groqResponse.status 
        },
        { status: 500 }
      )
    }

    let groqData
    try {
      groqData = await groqResponse.json()
    } catch (parseError: any) {
      console.error("Failed to parse Groq response:", parseError)
      return NextResponse.json(
        { error: "Invalid response from Groq API", message: parseError.message },
        { status: 500 }
      )
    }

    const analysisContent = groqData.choices?.[0]?.message?.content

    if (!analysisContent) {
      console.error("No analysis content in Groq response:", JSON.stringify(groqData, null, 2))
      return NextResponse.json(
        { error: "No analysis received from Groq", response: groqData },
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

    return NextResponse.json({ analysis })
  } catch (error: any) {
    console.error("Error analyzing request:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error.message,
        type: error.name 
      },
      { status: 500 }
    )
  }
}

