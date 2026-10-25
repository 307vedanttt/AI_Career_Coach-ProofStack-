import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

/**
 * ImmersiveCyberEngine
 * 
 * Production Three.js 3D spatial computing environment for ProofStack.
 * Features:
 * 1. Undulating 3D Perspective Wave Grid: A horizon plane with dynamic trigonometric waves
 *    and real-time cursor ripple displacement in emerald & cyber cyan.
 * 2. Floating 3D Merkle Commit Nodes: Rotating icosahedron proof nodes with dynamic fiber-optic DAG links.
 * 3. 3D Floating Particle Constellation: Ambient glowing code dust with deep parallax.
 * 4. Silky 60+ FPS Performance with adaptive DPR clamping and visibility throttling.
 */
export const ImmersiveCyberEngine = ({ 
  className = 'fixed inset-0 pointer-events-none z-0',
  showGrid = true,
  showNodes = true,
  opacity = 0.9
}) => {
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
    let planeMesh;
    let gridPoints;
    let planeGeo;
    let originalPositions;
    let nodeObjects = [];
    let linesMesh;
    let linesGeo;
    let dustMesh;

    try {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      // 1. Scene, Camera, Renderer with Atmospheric Fog
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x06080D, 0.014);

      camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);
      camera.position.set(0, 8, 55);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      // Helper: Soft Glow Circular Point Texture
      const createPointTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
          grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
          grad.addColorStop(0.25, 'rgba(52, 211, 153, 0.9)');
          grad.addColorStop(0.65, 'rgba(6, 182, 212, 0.3)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 64, 64);
        }
        return new THREE.CanvasTexture(canvas);
      };
      const pointTex = createPointTexture();

      // 2. Undulating Perspective Wave Grid (The "Evidence Horizon")
      if (showGrid) {
        const gridW = 160;
        const gridH = 140;
        const segX = 54;
        const segY = 46;
        planeGeo = new THREE.PlaneGeometry(gridW, gridH, segX, segY);
        planeGeo.rotateX(-Math.PI / 2 + 0.12);
        planeGeo.translate(0, -18, -15);

        originalPositions = Float32Array.from(planeGeo.attributes.position.array);

        // Wireframe grid lines
        const planeMat = new THREE.MeshBasicMaterial({
          color: 0x10B981,
          wireframe: true,
          transparent: true,
          opacity: 0.16 * opacity,
          blending: THREE.AdditiveBlending,
        });
        planeMesh = new THREE.Mesh(planeGeo, planeMat);
        scene.add(planeMesh);

        // Luminous Intersection Points
        const pointsMat = new THREE.PointsMaterial({
          size: 1.4,
          map: pointTex,
          transparent: true,
          opacity: 0.45 * opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        gridPoints = new THREE.Points(planeGeo, pointsMat);
        scene.add(gridPoints);
      }

      // 3. Floating 3D Merkle Commit Nodes (Icosahedrons)
      const nodeCount = 28;
      const nodeGeos = [
        new THREE.IcosahedronGeometry(1.2, 0),
        new THREE.OctahedronGeometry(1.0, 0),
      ];

      const nodeColors = [0x10B981, 0x06B6D4, 0x34D399, 0x38BDF8];

      if (showNodes) {
        for (let i = 0; i < nodeCount; i++) {
          const geo = nodeGeos[i % nodeGeos.length];
          const col = nodeColors[i % nodeColors.length];
          const mat = new THREE.MeshBasicMaterial({
            color: col,
            wireframe: true,
            transparent: true,
            opacity: (0.35 + (i % 3) * 0.15) * opacity,
            blending: THREE.AdditiveBlending,
          });
          const mesh = new THREE.Mesh(geo, mat);

          // Spatial distribution framing content
          const angle = (i / nodeCount) * Math.PI * 2;
          const radius = 28 + Math.random() * 32;
          const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 15;
          const y = (Math.random() - 0.5) * 38 + 6;
          const z = (Math.random() - 0.5) * 45 - 5;

          mesh.position.set(x, y, z);
          mesh.userData = {
            baseX: x,
            baseY: y,
            baseZ: z,
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.02,
            floatSpeed: 0.8 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
          };

          scene.add(mesh);
          nodeObjects.push(mesh);
        }

        // Connecting Fiber-Optic Merkle DAG Lines
        const maxLines = 50;
        const linePositions = new Float32Array(maxLines * 6);
        const lineColorsArr = new Float32Array(maxLines * 6);
        linesGeo = new THREE.BufferGeometry();
        linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        linesGeo.setAttribute('color', new THREE.BufferAttribute(lineColorsArr, 3));

        const linesMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.3 * opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        linesMesh = new THREE.LineSegments(linesGeo, linesMat);
        scene.add(linesMesh);
      }

      // 4. Ambient High-Tech Floating Code Dust
      const dustCount = 85;
      const dustPositions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * 130;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
      const dustMat = new THREE.PointsMaterial({
        size: 2.2,
        map: pointTex,
        transparent: true,
        opacity: 0.5 * opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      dustMesh = new THREE.Points(dustGeo, dustMat);
      scene.add(dustMesh);

      // Mouse & Scroll Parallax Tracking
      let mouseX = 0;
      let mouseY = 0;
      let targetMouseX = 0;
      let targetMouseY = 0;
      let scrollY = window.scrollY;

      const handleMouseMove = (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
      };

      const handleScroll = () => {
        scrollY = window.scrollY;
      };

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);

      // Page visibility throttling
      let isVisible = true;
      const handleVisibilityChange = () => {
        isVisible = !document.hidden;
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // 5. High-Performance Render Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!isVisible) return;

        const elapsedTime = clock.getElapsedTime();

        // Smooth camera mouse follow
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        camera.position.x = mouseX * 9;
        camera.position.y = 8 + mouseY * 6 - (scrollY * 0.015);
        camera.lookAt(0, -2, -10);

        // Undulate Perspective Grid
        if (planeGeo && originalPositions) {
          const posAttr = planeGeo.attributes.position;
          const pos = posAttr.array;
          const count = pos.length / 3;

          for (let i = 0; i < count; i++) {
            const ox = originalPositions[i * 3];
            const oy = originalPositions[i * 3 + 1];
            const oz = originalPositions[i * 3 + 2];

            // Trigonometric dual-wave matrix
            const wave1 = Math.sin(ox * 0.08 + elapsedTime * 1.4) * 2.2;
            const wave2 = Math.cos(oz * 0.09 + elapsedTime * 1.1) * 1.8;
            
            // Cursor proximity dip/pulse
            const dx = ox - (mouseX * 40);
            const dz = oz - 20;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const cursorInfluence = Math.max(0, 1 - dist / 35) * 4.0;

            pos[i * 3 + 1] = oy + wave1 + wave2 + cursorInfluence;
          }
          posAttr.needsUpdate = true;
        }

        // Animate Floating Merkle Nodes
        if (showNodes) {
          const linePos = linesGeo.attributes.position.array;
          const lineCols = linesGeo.attributes.color.array;
          let lineIdx = 0;

          for (let i = 0; i < nodeObjects.length; i++) {
            const node = nodeObjects[i];
            node.rotation.x += node.userData.rotSpeedX;
            node.rotation.y += node.userData.rotSpeedY;

            // Bobbing movement
            const floatOffset = Math.sin(elapsedTime * node.userData.floatSpeed + node.userData.phase) * 2.5;
            node.position.y = node.userData.baseY + floatOffset;
            node.position.x = node.userData.baseX + Math.cos(elapsedTime * 0.5 + node.userData.phase) * 1.5;

            // Connect nearby nodes
            for (let j = i + 1; j < nodeObjects.length && lineIdx < 50; j++) {
              const other = nodeObjects[j];
              const dist = node.position.distanceTo(other.position);
              if (dist < 22) {
                const alpha = (1 - dist / 22) * 0.6;
                const baseIdx = lineIdx * 6;

                linePos[baseIdx] = node.position.x;
                linePos[baseIdx + 1] = node.position.y;
                linePos[baseIdx + 2] = node.position.z;

                linePos[baseIdx + 3] = other.position.x;
                linePos[baseIdx + 4] = other.position.y;
                linePos[baseIdx + 5] = other.position.z;

                lineCols[baseIdx] = 0.06;
                lineCols[baseIdx + 1] = 0.72 * alpha;
                lineCols[baseIdx + 2] = 0.51 * alpha;

                lineCols[baseIdx + 3] = 0.02;
                lineCols[baseIdx + 4] = 0.71 * alpha;
                lineCols[baseIdx + 5] = 0.83 * alpha;

                lineIdx++;
              }
            }
          }

          // Clear unused lines
          for (let k = lineIdx; k < 50; k++) {
            const baseIdx = k * 6;
            linePos[baseIdx] = 0;
            linePos[baseIdx + 1] = 0;
            linePos[baseIdx + 2] = 0;
            linePos[baseIdx + 3] = 0;
            linePos[baseIdx + 4] = 0;
            linePos[baseIdx + 5] = 0;
          }
          linesGeo.attributes.position.needsUpdate = true;
          linesGeo.attributes.color.needsUpdate = true;
        }

        // Ambient Dust Rotation
        if (dustMesh) {
          dustMesh.rotation.y = elapsedTime * 0.02;
          dustMesh.rotation.x = Math.sin(elapsedTime * 0.015) * 0.1;
        }

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch {
      // Graceful fallback for environments without WebGL support
      return () => {};
    }
  }, [shouldReduceMotion, showGrid, showNodes, opacity]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      aria-hidden="true" 
      style={{ willChange: 'transform' }}
    />
  );
};
