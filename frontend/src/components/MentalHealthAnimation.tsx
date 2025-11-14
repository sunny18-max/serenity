import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

// Animated human figure with mental health symbolism
function HumanFigure() {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create particle system for "thoughts" around the head
  const particles = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 2 + Math.random() * 1;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 3;
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Gentle breathing animation
    if (groupRef.current) {
      groupRef.current.scale.y = 1 + Math.sin(time * 0.5) * 0.05;
    }
    
    // Rotate particles (thoughts)
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head with distortion for "mental state" */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere args={[1, 32, 32]} position={[0, 3, 0]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* Torso */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.8, 0.6, 2, 32]} />
        <meshStandardMaterial color="#6366f1" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Arms */}
      <mesh position={[-1.2, 1.5, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[1.2, 1.5, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, -0.5, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 2, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.3, -0.5, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 2, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Heart symbol (mental wellness) */}
      <Float speed={3} rotationIntensity={0.1} floatIntensity={0.8}>
        <mesh position={[0, 1.5, 0.8]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color="#ec4899" 
            emissive="#ec4899" 
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Float>

      {/* Particle system for thoughts/energy */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#a78bfa"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Aura rings for wellness */}
      {[1.5, 2, 2.5].map((radius, i) => (
        <mesh key={i} position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.3 - i * 0.1}
            emissive="#8b5cf6"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Ambient scene elements
function SceneElements() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#a78bfa"
      />
      
      {/* Floating orbs representing positive thoughts */}
      {[...Array(5)].map((_, i) => (
        <Float
          key={i}
          speed={2 + i * 0.5}
          rotationIntensity={0.5}
          floatIntensity={1}
        >
          <Sphere
            args={[0.2, 16, 16]}
            position={[
              Math.sin(i * 1.5) * 5,
              Math.cos(i * 1.2) * 3,
              Math.sin(i * 0.8) * 3
            ]}
          >
            <meshStandardMaterial
              color={i % 2 === 0 ? "#8b5cf6" : "#ec4899"}
              emissive={i % 2 === 0 ? "#8b5cf6" : "#ec4899"}
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
}

// Main component
export default function MentalHealthAnimation() {
  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/10">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <SceneElements />
        <HumanFigure />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
