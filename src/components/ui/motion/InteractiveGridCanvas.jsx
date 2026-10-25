import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
export const InteractiveGridCanvas = () => {
    const canvasRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();
    useEffect(() => {
        if (shouldReduceMotion)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        let mouseX = -1000;
        let mouseY = -1000;
        let targetMouseX = -1000;
        let targetMouseY = -1000;
        let scrollY = window.scrollY;
        let lastScrollY = window.scrollY;
        let scrollVelocity = 0;
        const handleResize = () => {
            if (!canvas)
                return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        const handleMouseMove = (e) => {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        };
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            scrollVelocity = currentScroll - lastScrollY;
            lastScrollY = currentScroll;
            scrollY = currentScroll;
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });
        const spacing = 48; // Grid cell pitch
        const render = () => {
            // Smooth mouse follow
            mouseX += (targetMouseX - mouseX) * 0.1;
            mouseY += (targetMouseY - mouseY) * 0.1;
            // Decay scroll velocity
            scrollVelocity *= 0.92;
            ctx.clearRect(0, 0, width, height);
            const offsetX = 0;
            const offsetY = -(scrollY * 0.25) % spacing;
            const cols = Math.ceil(width / spacing) + 1;
            const rows = Math.ceil(height / spacing) + 2;
            // Draw interactive grid crosses
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * spacing + offsetX;
                    const y = j * spacing + offsetY;
                    const dx = x - mouseX;
                    const dy = y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 180;
                    if (dist < maxDist) {
                        // Proximity illumination
                        const factor = 1 - dist / maxDist;
                        const size = 3 + factor * 3;
                        // Connected laser hairline to cursor
                        if (dist < 100 && factor > 0.4) {
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.lineTo(mouseX, mouseY);
                            ctx.strokeStyle = `rgba(52, 211, 153, ${factor * 0.12})`;
                            ctx.lineWidth = 0.75;
                            ctx.stroke();
                        }
                        // Crosshair
                        ctx.strokeStyle = `rgba(52, 211, 153, ${0.15 + factor * 0.5})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(x - size, y);
                        ctx.lineTo(x + size, y);
                        ctx.moveTo(x, y - size);
                        ctx.lineTo(x, y + size);
                        ctx.stroke();
                    }
                    else {
                        // Ambient faint dot
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
                        ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(render);
        };
        animationFrameId = requestAnimationFrame(render);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, [shouldReduceMotion]);
    return (<canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: shouldReduceMotion ? 0 : 0.85 }} aria-hidden="true"/>);
};
