import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';

interface ThreeDBackgroundProps {
  className?: string;
  intensity?: number; // 0.1 to 1.0, controls how "bright" the 3D is
}

export const ThreeDBackground: React.FC<ThreeDBackgroundProps> = ({
  className,
  intensity = 0.3,
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const container = divRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      70,
      width / height,
      0.1,
      100
    );
    camera.position.z = 5;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.appendChild(renderer.domElement);

    // Create floating geometric shapes
    const geometries: THREE.Mesh[] = [];
    const materials: THREE.MeshBasicMaterial[] = [];

    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.IcosahedronGeometry(0.1 + Math.random() * 0.3);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(
          Math.random(),
          0.5,
          0.5 + Math.random() * 0.3
        ),
        transparent: true,
        opacity: intensity * 0.3 + 0.1,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      mesh.userData.speed = 0.01 + Math.random() * 0.02;
      scene.add(mesh);
      geometries.push(mesh);
      materials.push(material);
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      geometries.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.speed;
        mesh.rotation.y += mesh.userData.speed * 0.5;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [intensity, divRef.current]);

  return (
    <div
      ref={divRef}
      className={className}
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};