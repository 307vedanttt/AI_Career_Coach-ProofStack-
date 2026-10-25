import React, { useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
export const TiltCard = ({ children, className = '', maxTilt = 7, glareOpacity = 0.12, scale = 1.01, }) => {
    const cardRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();
    const [transformStyle, setTransformStyle] = useState('');
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseMove = (e) => {
        if (shouldReduceMotion || !cardRef.current)
            return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPct = (x / rect.width) * 100;
        const yPct = (y / rect.height) * 100;
        const rotateX = ((y / rect.height) - 0.5) * -maxTilt * 2;
        const rotateY = ((x / rect.width) - 0.5) * maxTilt * 2;
        setGlarePosition({ x: xPct, y: yPct });
        setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`);
    };
    const handleMouseEnter = () => {
        setIsHovered(true);
    };
    const handleMouseLeave = () => {
        setIsHovered(false);
        setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    };
    return (<div ref={cardRef} onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={`relative overflow-hidden transition-transform duration-200 ease-out will-change-transform ${className}`} style={{
            transform: shouldReduceMotion ? undefined : transformStyle,
            transformStyle: 'preserve-3d',
        }}>
      {/* Specular Glare Reflection */}
      {!shouldReduceMotion && (<div className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-20" style={{
                opacity: isHovered ? glareOpacity : 0,
                background: `radial-gradient(450px circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.4), transparent 60%)`,
            }} aria-hidden="true"/>)}
      {children}
    </div>);
};
