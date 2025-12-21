"use client"

import { ReactNode } from "react"
import { InteractiveRobotSpline } from "@/components/ui/interactive-3d-robot"

const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"

interface PageWrapperProps {
  children: ReactNode
  showRobot?: boolean
}

export function PageWrapper({ children, showRobot = true }: PageWrapperProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* 3D Robot Background */}
      {showRobot && (
        <div className="fixed inset-0 z-0 opacity-20">
          <InteractiveRobotSpline
            scene={ROBOT_SCENE_URL}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

