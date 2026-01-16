"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function ParticleSphere() {
  const PARTICLE_COUNT = 1500 
  const PARTICLE_SIZE_MIN = 0.005
  const PARTICLE_SIZE_MAX = 0.010
  const SPHERE_RADIUS = 9
  const POSITION_RANDOMNESS = 4
  const ROTATION_SPEED_X = 0.0
  const ROTATION_SPEED_Y = 0.0005
  const PARTICLE_OPACITY = 1

  const IMAGE_COUNT = 12
  const IMAGE_SIZE = 1.5 

  const groupRef = useRef<THREE.Group>(null)
  const [textures, setTextures] = useState<THREE.Texture[]>([])

  // Use picsum.photos which is more reliable than Unsplash for programmatic access
  const imageUrls = useMemo(() => {
    const urls = []
    for (let i = 1; i <= IMAGE_COUNT; i++) {
      // Use picsum.photos with specific IDs for reliability
      urls.push(`https://picsum.photos/seed/baal${i}/600/600`)
    }
    return urls
  }, [IMAGE_COUNT])

  // Load textures with error handling
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const loadedTextures: THREE.Texture[] = []
    let loadedCount = 0

    const loadTexture = (url: string, index: number) => {
      loader.load(
        url,
        (texture) => {
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.flipY = false
          loadedTextures[index] = texture
          loadedCount++
          
          if (loadedCount === imageUrls.length) {
            setTextures([...loadedTextures])
          }
        },
        undefined,
        (error) => {
          console.warn(`Failed to load texture ${index}:`, error)
          // Create a fallback colored texture
          const canvas = document.createElement('canvas')
          canvas.width = 1
          canvas.height = 1
          const ctx = canvas.getContext('2d')!
          const hue = (index / imageUrls.length) * 360
          ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
          ctx.fillRect(0, 0, 1, 1)
          const fallbackTexture = new THREE.CanvasTexture(canvas)
          fallbackTexture.wrapS = THREE.ClampToEdgeWrapping
          fallbackTexture.wrapT = THREE.ClampToEdgeWrapping
          fallbackTexture.flipY = false
          loadedTextures[index] = fallbackTexture
          loadedCount++
          
          if (loadedCount === imageUrls.length) {
            setTextures([...loadedTextures])
          }
        }
      )
    }

    imageUrls.forEach((url, index) => {
      loadTexture(url, index)
    })

    // Cleanup function
    return () => {
      loadedTextures.forEach(texture => {
        if (texture) {
          texture.dispose()
        }
      })
    }
  }, [imageUrls])

  const particles = useMemo(() => {
    const particles = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT)
      const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi

      const radiusVariation = SPHERE_RADIUS + (Math.random() - 0.5) * POSITION_RANDOMNESS

      const x = radiusVariation * Math.cos(theta) * Math.sin(phi)
      const y = radiusVariation * Math.cos(phi)
      const z = radiusVariation * Math.sin(theta) * Math.sin(phi)

      particles.push({
        position: [x, y, z],
        scale: Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN,
        color: new THREE.Color().setHSL(
          Math.random() * 0.1 + 0.05, 
          0.8,
          0.6 + Math.random() * 0.3,
        ),
        rotationSpeed: (Math.random() - 0.5) * 0.01,
      })
    }

    return particles
  }, [])

  const orbitingImages = useMemo(() => {
    const images = []

    for (let i = 0; i < IMAGE_COUNT; i++) {
      const angle = (i / IMAGE_COUNT) * Math.PI * 2
      const x = SPHERE_RADIUS * Math.cos(angle)
      const y = 0 
      const z = SPHERE_RADIUS * Math.sin(angle)

      const position = new THREE.Vector3(x, y, z)
      const center = new THREE.Vector3(0, 0, 0)
      const outwardDirection = position.clone().sub(center).normalize()

      const euler = new THREE.Euler()
      const matrix = new THREE.Matrix4()
      matrix.lookAt(position, position.clone().add(outwardDirection), new THREE.Vector3(0, 1, 0))
      euler.setFromRotationMatrix(matrix)

      euler.z += Math.PI

      images.push({
        position: [x, y, z],
        rotation: [euler.x, euler.y, euler.z],
        textureIndex: i,
        color: new THREE.Color().setHSL(i / IMAGE_COUNT, 0.7, 0.6), 
      })
    }

    return images
  }, [IMAGE_COUNT, SPHERE_RADIUS])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED_Y
      groupRef.current.rotation.x += ROTATION_SPEED_X
    }
  })

  return (
    <group ref={groupRef}>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position as unknown as [number, number, number]} scale={particle.scale as unknown as [number, number, number]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color={particle.color} transparent opacity={PARTICLE_OPACITY} />
        </mesh>
      ))}

      {textures.length > 0 && orbitingImages.map((image, index) => {
        const texture = textures[image.textureIndex]
        
        return (
          <mesh key={`image-${index}`} position={image.position as unknown as [number, number, number]} rotation={image.rotation as unknown as [number, number, number]}>
            <planeGeometry args={[IMAGE_SIZE, IMAGE_SIZE]} />
            {texture ? (
              <meshBasicMaterial 
                map={texture} 
                opacity={1} 
                side={THREE.DoubleSide}
                transparent
              />
            ) : (
              <meshBasicMaterial 
                color={image.color} 
                opacity={1} 
                side={THREE.DoubleSide}
                transparent
              />
            )}
          </mesh>
        )
      })}
    </group>
  )
}
