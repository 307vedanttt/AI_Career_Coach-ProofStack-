import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

/**
 * ThreeInteractiveTerrain
 * 
 * High-end creative developer Three.js interactive shader terrain.
 * Features an infinite perspective-warped cryptographic topography,
 * dynamic harmonic wave deformation, mouse-reactive gravity ripples,
 * and a cursor-tracking specular point light with horizon depth fog.
 * Inspired by award-winning ThreeUI and Awwwards interactive webgl environments.
 */
export const ThreeInteractiveTerrain = ({ className = 'fixed inset-0 pointer-events-none z-0' }) => {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId;
    let renderer;
    let scene;
    let camera;
    let terrainMesh;
    let wireMesh;
    let pointLight;
    let horizonLight;

    try {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      // 1. Scene & Atmospheric Horizon Fog
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2('#08090B', 0.016);

      // 2. Camera: Perspective looking down towards horizon
      camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
      camera.position.set(0, 14, 48);
      camera.lookAt(0, -2, -20);

      // 3. WebGL Renderer
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      // 4. Lights: Interactive Cursor Light & Horizon Accent
      const ambientLight = new THREE.AmbientLight('#0F172A', 1.2);
      scene.add(ambientLight);

      // Dynamic cursor point light
      pointLight = new THREE.PointLight('#10B981', 120, 80, 1.8);
      pointLight.position.set(0, 10, 20);
      scene.add(pointLight);

      // Horizon rim light (deep celestial cyan)
      horizonLight = new THREE.PointLight('#0284C7', 90, 120, 1.5);
      horizonLight.position.set(0, 4, -40);
      scene.add(horizonLight);

      // Subtle warm accent light
      const accentLight = new THREE.PointLight('#8B5CF6', 60, 90, 1.6);
      accentLight.position.set(-35, 8, -10);
      scene.add(accentLight);

      // 5. High-Density Terrain Geometry (140x140 with 85x85 segments)
      const planeWidth = 140;
      const planeHeight = 130;
      const segmentsX = 80;
      const segmentsY = 75;
      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);
      geometry.rotateX(-Math.PI / 2.2);
      geometry.translate(0, -14, -15);

      const count = geometry.attributes.position.count;
      // Store original base Y coordinates for non-destructive wave displacement
      const basePositions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        basePositions[i] = geometry.attributes.position.array[i];
      }

      // 6. Dual-Layer Materials: Dark Obsidian Solid + Neon Cyber Wireframe
      // Base Solid Mesh (Catches glossy specular reflections)
      const solidMaterial = new THREE.MeshStandardMaterial({
        color: '#080A0E',
        roughness: 0.25,
        metalness: 0.85,
        flatShading: true,
      });
      terrainMesh = new THREE.Mesh(geometry, solidMaterial);
      scene.add(terrainMesh);

      // Top Wireframe Mesh (Crisp hair-thin glowing lines)
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: '#10B981',
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      wireMesh = new THREE.Mesh(geometry, wireMaterial);
      scene.add(wireMesh);

      // 7. Laser Scanline Ring (Slow cryptographic sweep across terrain)
      const laserGeo = new THREE.BufferGeometry();
      const laserPoints = 120;
      const laserPos = new Float32Array(laserPoints * 3);
      for (let i = 0; i < laserPoints; i++) {
        const x = (i / (laserPoints - 1) - 0.5) * planeWidth;
        laserPos[i * 3] = x;
        laserPos[i * 3 + 1] = -12;
        laserPos[i * 3 + 2] = 0;
      }
      laserGeo.setAttribute('position', new THREE.BufferAttribute(laserPos, 3));
      const laserMat = new THREE.LineBasicMaterial({
        color: '#34D399',
        transparent: true,
        opacity: 0.45,
        linewidth: 2,
      });
      const laserLine = new THREE.Line(laserGeo, laserMat);
      scene.add(laserLine);

      // 8. Mouse & Interactive State Tracking
      let mouseX = 0;
      let mouseY = 0;
      let targetMouseX = 0;
      let targetMouseY = 0;
      let laserZ = -45;

      const onMouseMove = (e) => {
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        targetMouseX = normX * 35;
        targetMouseY = normY * 15;
      };

      const onResize = () => {
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('resize', onResize);

      // 9. 60+ FPS Wave & Physics Deformation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // Smooth mouse easing
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Position dynamic point light based on smoothed cursor
        pointLight.position.x = mouseX * 0.9;
        pointLight.position.y = 12 + mouseY * 0.4;
        pointLight.position.z = 15 - mouseY * 0.8;

        // Camera subtle sway
        camera.position.x = mouseX * 0.12;
        camera.position.y = 14 + mouseY * 0.08;
        camera.lookAt(0, -3, -20);

        // Update Laser Scanline sweep
        laserZ += 0.22;
        if (laserZ > 30) laserZ = -55;
        laserLine.position.z = laserZ;

        // Deform vertices with harmonic waves + cursor repulsion well
        const positionAttr = geometry.attributes.position;
        const posArray = positionAttr.array;

        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          const origX = basePositions[idx];
          const origZ = basePositions[idx + 2];

          // Harmonic terrain frequencies
          const wave1 = Math.sin(origX * 0.08 + time * 0.75) * Math.cos(origZ * 0.07 + time * 0.6) * 3.4;
          const wave2 = Math.sin((origX + origZ) * 0.045 + time * 0.45) * 2.2;
          const wave3 = Math.cos(origX * 0.03 - origZ * 0.04 + time * 0.3) * 1.5;

          // Distance to interactive mouse point light
          const dx = origX - pointLight.position.x;
          const dz = origZ - pointLight.position.z;
          const distSq = dx * dx + dz * dz;
          const mouseLift = Math.exp(-distSq * 0.0025) * 5.0;

          // Distance to laser scanline
          const laserDist = Math.abs(origZ - laserZ);
          const laserLift = Math.exp(-laserDist * laserDist * 0.08) * 1.8;

          // Compute final displaced height
          posArray[idx + 1] = basePositions[idx + 1] + wave1 + wave2 + wave3 + mouseLift + laserLift;
        }

        positionAttr.needsUpdate = true;
        geometry.computeVertexNormals();

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        // Clean GPU memory
        geometry.dispose();
        solidMaterial.dispose();
        wireMaterial.dispose();
        laserGeo.dispose();
        laserMat.dispose();
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (e) {
      console.warn('ThreeInteractiveTerrain WebGL init error:', e);
    }
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      style={{ opacity: 0.85 }}
    />
  );
};
