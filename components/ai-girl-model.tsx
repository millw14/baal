"use client"

import { Suspense, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { AnimationMixer } from "three"

function ScrollControlledModel({ url, scrollProgress }: { url: string; scrollProgress: number }) {
  const { scene, animations } = useGLTF(url)
  const mixerRef = useRef<AnimationMixer | null>(null)
  const actionsRef = useRef<THREE.AnimationAction[]>([])
  const groupRef = useRef<THREE.Group>(null)
  const clockRef = useRef(new THREE.Clock())
  const scrollProgressRef = useRef(scrollProgress)

  // Update scroll progress ref when prop changes
  useEffect(() => {
    scrollProgressRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  useEffect(() => {
    if (animations && animations.length > 0) {
      mixerRef.current = new AnimationMixer(scene)
      actionsRef.current = animations.map((clip) => {
        const action = mixerRef.current!.clipAction(clip)
        action.weight = 0
        action.play()
        return action
      })
    }
  }, [animations, scene])

  useFrame(() => {
    const currentScroll = scrollProgressRef.current
    
    if (mixerRef.current) {
      mixerRef.current.update(clockRef.current.getDelta())
      
      // Change animation based on scroll progress
      if (actionsRef.current.length > 0) {
        const animIndex = Math.floor((currentScroll % 1) * actionsRef.current.length) % actionsRef.current.length
        actionsRef.current.forEach((action, index) => {
          action.weight = index === animIndex ? 1 : 0
          action.timeScale = 0.5 + currentScroll * 0.5
        })
      }
    }

    // Rotate and move model based on scroll
    if (groupRef.current) {
      groupRef.current.rotation.y = currentScroll * Math.PI * 2 * 0.1
      groupRef.current.position.y = Math.sin(currentScroll * Math.PI * 2) * 0.3 - 1
      groupRef.current.position.x = Math.cos(currentScroll * Math.PI * 2) * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={[2, 2, 2]} />
    </group>
  )
}

export function AIGirlModel({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen pointer-events-none opacity-30">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} />
        <Suspense fallback={null}>
          <ScrollControlledModel url="/ai_girl.glb" scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  )
}
