import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
export const CyberBackground = () => {
    const canvasRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();
    useEffect(() => {
        if (shouldReduceMotion)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx)
            return;
        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        let mouseX = -1000;
        let mouseY = -1000;
        let targetMouseX = -1000;
        let targetMouseY = -1000;
        let mouseActive = false;
        let lastScrollY = window.scrollY;
        let scrollVelocity = 0;
        let isVisible = true;
        const handleResize = () => {
            if (!canvas)
                return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };
        const handleMouseMove = (e) => {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
            mouseActive = true;
        };
        const handleMouseLeave = () => {
            mouseActive = false;
            targetMouseX = -1000;
            targetMouseY = -1000;
        };
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            scrollVelocity = (currentScroll - lastScrollY) * 0.5;
            lastScrollY = currentScroll;
        };
        const handleVisibilityChange = () => {
            isVisible = !document.hidden;
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);
        // Refined, human-crafted starlight and mint stardust
        let particles = [];
        const colors = [
            '#F1F5F9', // titanium
            '#CBD5E1', // slate white
            '#10B981', // electric emerald
            '#38BDF8', // celestial cyan
        ];
        const initParticles = () => {
            particles = [];
            // Clean, lightweight particle budget (28 particles max: fast & ultra smooth)
            const count = Math.min(Math.floor((width * height) / 38000), 28);
            for (let i = 0; i < count; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                particles.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    size: Math.random() * 1.5 + 1.2,
                    color: colors[i % colors.length],
                });
            }
        };
        initParticles();
        // Technical grid cross spacing (optimized 96px pitch for silky 60+ FPS)
        const gridSpacing = 96;
        let lastFrameTime = performance.now();
        const render = (currentTime) => {
            animationFrameId = requestAnimationFrame(render);
            if (!isVisible)
                return;
            // Frame pacing: Cap update to 60fps (~16ms) to avoid CPU thrashing
            const elapsed = currentTime - lastFrameTime;
            if (elapsed < 15)
                return;
            lastFrameTime = currentTime - (elapsed % 15);
            // Smooth mouse easing
            mouseX += (targetMouseX - mouseX) * 0.15;
            mouseY += (targetMouseY - mouseY) * 0.15;
            // Decay scroll velocity
            scrollVelocity *= 0.88;
            ctx.clearRect(0, 0, width, height);
            // 1. BATCHED Technical Engineering Grid Crosses (single stroke call for all crosses!)
            const scrollOffsetY = -(window.scrollY * 0.15) % gridSpacing;
            const cols = Math.ceil(width / gridSpacing) + 1;
            const rows = Math.ceil(height / gridSpacing) + 2;
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const gx = i * gridSpacing;
                    const gy = j * gridSpacing + scrollOffsetY;
                    ctx.moveTo(gx - 2.5, gy);
                    ctx.lineTo(gx + 2.5, gy);
                    ctx.moveTo(gx, gy - 2.5);
                    ctx.lineTo(gx, gy + 2.5);
                }
            }
            ctx.stroke();
            // Highlight near mouse cursor
            if (mouseActive) {
                ctx.beginPath();
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
                for (let i = 0; i < cols; i++) {
                    for (let j = 0; j < rows; j++) {
                        const gx = i * gridSpacing;
                        const gy = j * gridSpacing + scrollOffsetY;
                        const dx = gx - mouseX;
                        const dy = gy - mouseY;
                        if (dx * dx + dy * dy < 16000) {
                            ctx.moveTo(gx - 5, gy);
                            ctx.lineTo(gx + 5, gy);
                            ctx.moveTo(gx, gy - 5);
                            ctx.lineTo(gx, gy + 5);
                        }
                    }
                }
                ctx.stroke();
            }
            // 2. BATCHED Connective Laser Filaments (single stroke call for all filaments!)
            const connectionDistSq = 135 * 135;
            ctx.beginPath();
            ctx.lineWidth = 0.75;
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < connectionDistSq) {
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                    }
                }
            }
            ctx.stroke();
            // 3. Update & Draw Particles (Pure GPU arc without expensive shadowBlur)
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                // Drift + scroll parallax
                p.x += p.vx;
                p.y += p.vy - scrollVelocity * 0.05;
                // Wrap boundaries
                if (p.x < 0)
                    p.x = width;
                if (p.x > width)
                    p.x = 0;
                if (p.y < 0)
                    p.y = height;
                if (p.y > height)
                    p.y = 0;
                // Soft outer ambient halo
                ctx.beginPath();
                ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
                ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                ctx.fill();
                // Crisp solid star core
                ctx.beginPath();
                ctx.fillStyle = p.color;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        };
        animationFrameId = requestAnimationFrame(render);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            cancelAnimationFrame(animationFrameId);
        };
    }, [shouldReduceMotion]);
    return (<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Refined Volumetric Ambient Atmosphere Pools */}
      <div className="absolute -top-[15%] left-[20%] w-[900px] h-[550px] bg-gradient-to-b from-emerald-500/[0.06] via-teal-500/[0.03] to-transparent rounded-full blur-[140px]"/>
      <div className="absolute top-[40%] -right-[10%] w-[800px] h-[600px] bg-gradient-to-b from-sky-500/[0.04] via-indigo-500/[0.02] to-transparent rounded-full blur-[150px]"/>
      <div className="absolute top-[70%] left-[5%] w-[800px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[150px]"/>

      {/* High-Performance Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block"/>
    </div>);
};
