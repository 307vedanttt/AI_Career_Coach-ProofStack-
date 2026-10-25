import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity, useAnimationFrame, useMotionValue, useReducedMotion, } from 'framer-motion';
const wrap = (min, max, v) => {
    const range = max - min;
    return ((((v - min) % range) + range) % range) + min;
};
const VelocityLine = ({ children, baseVelocity = 2, className = '', }) => {
    const shouldReduceMotion = useReducedMotion();
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400,
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false,
    });
    const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
    const directionFactor = useRef(baseVelocity >= 0 ? 1 : -1);
    useAnimationFrame((_, delta) => {
        if (shouldReduceMotion)
            return;
        const safeDelta = Math.min(delta, 32);
        let moveBy = directionFactor.current * Math.abs(baseVelocity) * (safeDelta / 1000) * 15;
        // React to user's scrolling velocity with bounded factor
        const factor = velocityFactor.get();
        moveBy += moveBy * Math.min(Math.abs(factor), 3);
        baseX.set(baseX.get() + (baseVelocity >= 0 ? moveBy : -moveBy));
    });
    return (<div className="overflow-hidden m-0 flex flex-nowrap whitespace-nowrap select-none pointer-events-none py-1">
      <motion.div className={`flex flex-nowrap whitespace-nowrap ${className}`} style={shouldReduceMotion ? undefined : { x }}>
        <span className="flex items-center space-x-6 pr-6">{children}</span>
        <span className="flex items-center space-x-6 pr-6">{children}</span>
        <span className="flex items-center space-x-6 pr-6">{children}</span>
        <span className="flex items-center space-x-6 pr-6">{children}</span>
      </motion.div>
    </div>);
};
export const ScrollVelocity = ({ texts, velocity = 1.5, className = '', itemClassName = '', }) => {
    return (<div className={`relative w-full overflow-hidden ${className}`}>
      {texts.map((text, index) => (<VelocityLine key={index} baseVelocity={index % 2 === 0 ? velocity : -velocity} className={itemClassName}>
          {text}
        </VelocityLine>))}
    </div>);
};
