import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
export const BlurText = ({ text, delay = 0.05, className = '', as = 'div', once = false, }) => {
    const shouldReduceMotion = useReducedMotion();
    const words = text.split(' ');
    const MotionComponent = motion[as];
    if (shouldReduceMotion) {
        const Component = as;
        return <Component className={className}>{text}</Component>;
    }
    return (<MotionComponent className={`inline-flex flex-wrap gap-x-[0.3em] ${className}`} initial="hidden" whileInView="visible" viewport={{ once, amount: 0.25 }}>
      {words.map((word, index) => (<motion.span key={`${word}-${index}`} className="inline-block" variants={{
                hidden: {
                    filter: 'blur(8px)',
                    opacity: 0,
                    y: 16,
                },
                visible: {
                    filter: 'blur(0px)',
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.45,
                        delay: index * delay,
                        ease: [0.22, 1, 0.36, 1],
                    },
                },
            }}>
          {word}
        </motion.span>))}
    </MotionComponent>);
};
