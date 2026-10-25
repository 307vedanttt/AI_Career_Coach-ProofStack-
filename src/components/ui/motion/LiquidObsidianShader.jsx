import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

/**
 * LiquidObsidianShader
 * 
 * Art-directed by Senior Graphic & Creative UI Designers.
 * Replaces generic tech meshes with a bespoke, organic Dark Caustic Liquid
 * Obsidian shader field. Features domain-warped fractional Brownian motion,
 * fluid cursor vortices, and scroll velocity refraction.
 * 
 * Pure WebGL fragment shader running on a single full-screen quad:
 * - 60+ FPS high performance, zero geometry overhead
 * - Deep, luxurious obsidian and emerald caustic ribbons
 * - Atmospheric depth without any text collision
 */
export const LiquidObsidianShader = ({ className = 'fixed inset-0 pointer-events-none z-0' }) => {
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
    let material;
    let quad;

    try {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      // Mouse & Scroll uniforms
      const mouse = new THREE.Vector2(0.5, 0.5);
      const targetMouse = new THREE.Vector2(0.5, 0.5);
      const scrollOffset = { value: 0 };
      let lastScrollY = window.scrollY;

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;
        uniform float u_scroll;
        varying vec2 vUv;

        // Simplex 2D noise helpers
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        // Domain-warped fractional Brownian motion
        float fbm(vec2 p) {
          float value = 0.0;
          float amp = 0.5;
          float freq = 1.0;
          for(int i = 0; i < 4; i++) {
            value += amp * snoise(p * freq);
            freq *= 2.05;
            amp *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;
          float aspect = u_resolution.x / u_resolution.y;
          vec2 uv = st;
          uv.x *= aspect;

          vec2 mouseUV = u_mouse;
          mouseUV.x *= aspect;

          // Distance and mouse vortex ripple
          float mouseDist = distance(uv, mouseUV);
          float mouseStrength = smoothstep(0.7, 0.0, mouseDist);
          vec2 mouseVortex = (uv - mouseUV) * mouseStrength * 0.25;

          // Liquid domain warping with time and scroll
          float t = u_time * 0.12;
          float scrollT = u_scroll * 0.0008;

          vec2 q = vec2(
            fbm(uv + vec2(0.0, t * 0.6) + mouseVortex),
            fbm(uv + vec2(t * 0.4, 0.0) - mouseVortex)
          );

          vec2 r = vec2(
            fbm(uv + 3.0 * q + vec2(1.7, 9.2) + t * 0.35 + scrollT),
            fbm(uv + 3.0 * q + vec2(8.3, 2.8) - t * 0.25 - scrollT)
          );

          float f = fbm(uv + 3.5 * r + mouseVortex * 1.5);

          // Color Palette - Studio Art Direction:
          // Deepest Obsidian Velvet Base
          vec3 baseObsidian = vec3(0.031, 0.035, 0.043); // #08090B
          // Dark Carbon Teal
          vec3 carbonTeal = vec3(0.04, 0.09, 0.08);
          // Luminous Emerald Caustic
          vec3 emeraldCaustic = vec3(0.06, 0.72, 0.51); // #10B981
          // Deep Celestial Blue Accent
          vec3 celestialBlue = vec3(0.08, 0.24, 0.45);

          // Complex blending based on domain warped field
          vec3 color = mix(baseObsidian, carbonTeal, clamp(f * f * 2.5, 0.0, 1.0));
          color = mix(color, emeraldCaustic, clamp(pow(r.x, 3.0) * 0.45, 0.0, 1.0));
          color = mix(color, celestialBlue, clamp(pow(q.y, 4.0) * 0.3, 0.0, 1.0));

          // Interactive cursor caustic pool (soft glowing ripple around mouse)
          color += emeraldCaustic * mouseStrength * 0.12;

          // Vignette edge shading
          float vignette = st.x * (1.0 - st.x) * st.y * (1.0 - st.y) * 15.0;
          color *= clamp(pow(vignette, 0.35), 0.0, 1.0);

          // Film micro-grain to eliminate 8-bit banding
          float noise = fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
          color += noise;

          gl_FragColor = vec4(color, 0.88);
        }
      `;

      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          u_resolution: { value: new THREE.Vector2(width, height) },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_time: { value: 0 },
          u_scroll: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
      });

      quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(quad);

      // Event handlers
      const onMouseMove = (e) => {
        targetMouse.x = e.clientX / window.innerWidth;
        targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
      };

      const onScroll = () => {
        const currentY = window.scrollY;
        scrollOffset.value += (currentY - lastScrollY);
        lastScrollY = currentY;
      };

      const onResize = () => {
        if (!container || !renderer || !material) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        renderer.setSize(w, h);
        material.uniforms.u_resolution.value.set(w, h);
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Smooth mouse damping
        mouse.x += (targetMouse.x - mouse.x) * 0.06;
        mouse.y += (targetMouse.y - mouse.y) * 0.06;

        material.uniforms.u_mouse.value.copy(mouse);
        material.uniforms.u_time.value = clock.getElapsedTime();
        material.uniforms.u_scroll.value = scrollOffset.value;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        material.dispose();
        quad.geometry.dispose();
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (e) {
      console.warn('LiquidObsidianShader WebGL init error:', e);
    }
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
    />
  );
};
