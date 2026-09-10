import * as THREE from 'three';
import React, { useEffect } from 'react';

interface ThreeDSceneProps {
  containerRef: React.RefObject<HTMLCanvasElement | null>;
}

export const ThreeDScene: React.FC<ThreeDSceneProps> = ({
  containerRef,
}) => {
  // Initialize Three.js scene only on client
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    containerRef.current.style.width = '100%';
    containerRef.current.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);

    // Simple floating cubes
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    });

    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Rotate cubes
    const cubes: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      scene.add(cube);
      cubes.push(cube);
    }

    // Rotation loop
    const rotate = () => {
      cubes.forEach((cube) => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
      });
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(rotate);
    };
    const rotateId = requestAnimationFrame(rotate);

    return () => {
      cancelAnimationFrame(animationId);
      cancelAnimationFrame(rotateId);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [containerRef.current]);

  return (
    <canvas
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};