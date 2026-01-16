"use client"

import { ReactNode, lazy, Suspense } from "react"

// Lazy load the 3D robot only when needed
const InteractiveRobotSpline = lazy(() => 
  import("@/components/ui/interactive-3d-robot").then(module => ({ default: module.InteractiveRobotSpline }))
)

const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"

interface PageWrapperProps {
  children: ReactNode
  showRobot?: boolean
}

export function PageWrapper({ children, showRobot = false }: PageWrapperProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* 3D Robot Background - Only load when showRobot is true */}
      {showRobot && (
        <div className="fixed inset-0 z-0 opacity-20">
          <Suspense fallback={<div className="w-full h-full bg-black" />}>
            <InteractiveRobotSpline
              scene={ROBOT_SCENE_URL}
              className="w-full h-full"
            />
          </Suspense>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

