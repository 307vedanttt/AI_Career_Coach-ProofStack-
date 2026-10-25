import React, { useRef, useState } from 'react';
export const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(52, 211, 153, 0.08)', borderColor = 'rgba(52, 211, 153, 0.35)', }) => {
    const cardRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const handleMouseMove = (e) => {
        if (!cardRef.current)
            return;
        const rect = cardRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };
    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);
    return (<div ref={cardRef} onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={`relative overflow-hidden ${className}`}>
      {/* Dynamic Border Illumination (ReactBits spec) */}
      <div className="pointer-events-none absolute -inset-[1px] rounded-[inherit] transition-opacity duration-300 z-0" style={{
            opacity,
            background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 70%)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
        }} aria-hidden="true"/>

      {/* Specular Mouse Spotlight Overlay */}
      <div className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-10" style={{
            opacity,
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }} aria-hidden="true"/>
      {children}
    </div>);
};
