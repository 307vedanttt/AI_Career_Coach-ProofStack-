import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

export const ThreeMerkleMesh = ({ className = 'absolute inset-0 pointer-events-none' }) => {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId;
    let renderer;

    try {
      // 1. Scene, Camera, Renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 85;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // 2. Cryptographic Merkle Nodes in 3D Space
      const nodeCount = 48;
      const positions = new Float32Array(nodeCount * 3);
      const colors = new Float32Array(nodeCount * 3);
      const velocities = [];

      const colorPalette = [
        new THREE.Color('#10B981'), // Emerald
        new THREE.Color('#38BDF8'), // Celestial Cyan
        new THREE.Color('#818CF8'), // Indigo Invariant
        new THREE.Color('#F1F5F9'), // Titanium White
      ];

      for (let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 110;
        const y = (Math.random() - 0.5) * 75;
        const z = (Math.random() - 0.5) * 60;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        velocities.push({
          vx: (Math.random() - 0.5) * 0.04,
          vy: (Math.random() - 0.5) * 0.04,
          vz: (Math.random() - 0.5) * 0.03,
        });

        const color = colorPalette[i % colorPalette.length];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      // Nodes Geometry & Material
      const nodesGeometry = new THREE.BufferGeometry();
      nodesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      nodesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Circular Point Shader Texture
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(52, 211, 153, 0.8)');
        gradient.addColorStop(0.7, 'rgba(56, 189, 248, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      const pointTexture = new THREE.CanvasTexture(canvas);

      const nodesMaterial = new THREE.PointsMaterial({
        size: 3.5,
        vertexColors: true,
        map: pointTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const nodesMesh = new THREE.Points(nodesGeometry, nodesMaterial);
      scene.add(nodesMesh);

      // Connecting Edges (DAG Lines)
      const maxLines = 75;
      const linePositions = new Float32Array(maxLines * 6);
      const lineColors = new Float32Array(maxLines * 6);

      const linesGeometry = new THREE.BufferGeometry();
      linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      linesGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

      const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
      });

      const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(linesMesh);

      // 3. Mouse Parallax Damping
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / container.clientWidth - 0.5) * 14;
        targetY = -((e.clientY - rect.top) / container.clientHeight - 0.5) * 10;
      };

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('resize', handleResize);

      // 4. Animation Loop
      let isVisible = true;
      const handleVisibilityChange = () => {
        isVisible = !document.hidden;
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const animate = () => {
        if (isVisible) {
          // Smooth camera lerp
          mouseX += (targetX - mouseX) * 0.05;
          mouseY += (targetY - mouseY) * 0.05;
          camera.position.x = mouseX;
          camera.position.y = mouseY;
          camera.lookAt(scene.position);

          // Update node positions with boundary rebound
          const posAttr = nodesGeometry.attributes.position;
          const posArray = posAttr.array;

          for (let i = 0; i < nodeCount; i++) {
            let px = posArray[i * 3] + velocities[i].vx;
            let py = posArray[i * 3 + 1] + velocities[i].vy;
            let pz = posArray[i * 3 + 2] + velocities[i].vz;

            if (Math.abs(px) > 55) velocities[i].vx *= -1;
            if (Math.abs(py) > 38) velocities[i].vy *= -1;
            if (Math.abs(pz) > 30) velocities[i].vz *= -1;

            posArray[i * 3] = px;
            posArray[i * 3 + 1] = py;
            posArray[i * 3 + 2] = pz;
          }
          posAttr.needsUpdate = true;

          // Connect nearby nodes with geodesic lines
          let lineIdx = 0;
          const connectionDist = 26;
          const linePosArray = linesGeometry.attributes.position.array;
          const lineColorArray = linesGeometry.attributes.color.array;

          for (let i = 0; i < nodeCount && lineIdx < maxLines; i++) {
            for (let j = i + 1; j < nodeCount && lineIdx < maxLines; j++) {
              const dx = posArray[i * 3] - posArray[j * 3];
              const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
              const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

              if (dist < connectionDist) {
                const alpha = (1 - dist / connectionDist) * 0.6;

                linePosArray[lineIdx * 6] = posArray[i * 3];
                linePosArray[lineIdx * 6 + 1] = posArray[i * 3 + 1];
                linePosArray[lineIdx * 6 + 2] = posArray[i * 3 + 2];

                linePosArray[lineIdx * 6 + 3] = posArray[j * 3];
                linePosArray[lineIdx * 6 + 4] = posArray[j * 3 + 1];
                linePosArray[lineIdx * 6 + 5] = posArray[j * 3 + 2];

                // Emerald to cyan gradient line
                lineColorArray[lineIdx * 6] = 0.06;
                lineColorArray[lineIdx * 6 + 1] = 0.72 * alpha;
                lineColorArray[lineIdx * 6 + 2] = 0.5 * alpha;

                lineColorArray[lineIdx * 6 + 3] = 0.22 * alpha;
                lineColorArray[lineIdx * 6 + 4] = 0.74 * alpha;
                lineColorArray[lineIdx * 6 + 5] = 0.97 * alpha;

                lineIdx++;
              }
            }
          }

          // Clear remaining lines
          for (let k = lineIdx; k < maxLines; k++) {
            linePosArray[k * 6] = 0;
            linePosArray[k * 6 + 1] = 0;
            linePosArray[k * 6 + 2] = 0;
            linePosArray[k * 6 + 3] = 0;
            linePosArray[k * 6 + 4] = 0;
            linePosArray[k * 6 + 5] = 0;
          }

          linesGeometry.attributes.position.needsUpdate = true;
          linesGeometry.attributes.color.needsUpdate = true;

          // Subtle overall scene rotation
          scene.rotation.y += 0.0008;

          renderer.render(scene, camera);
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch {
      // Graceful fallback for non-WebGL environments
      return () => {};
    }
  }, [shouldReduceMotion]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
};
