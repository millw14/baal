"use client"

import { useCallback } from "react"
import Particles from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { Engine } from "@tsparticles/engine"

export function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <Particles
      {...({
        id: "tsparticles",
        init: particlesInit,
        options: {
        particles: {
          number: {
            value: 30, // Reduced from 50 for better performance
            density: {
              enable: true,
            },
          },
          color: {
            value: "#6366f1",
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 0.3,
            random: true,
          },
          size: {
            value: 3,
            random: true,
          },
          line_linked: {
            enable: true,
            distance: 120, // Reduced distance for better performance
            color: "#6366f1",
            opacity: 0.15, // Slightly reduced opacity
            width: 1,
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab",
            },
            onclick: {
              enable: true,
              mode: "push",
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 0.5,
              },
            },
            push: {
              particles_nb: 4,
            },
          },
        },
          retina_detect: true,
        },
        className: "absolute inset-0 -z-10",
      } as any)}
    />
  )
}

export { ParticlesBackground as Particles }

