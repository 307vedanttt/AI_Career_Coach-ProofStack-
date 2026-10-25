import React from 'react';
export const ShinyText = ({ text, disabled = false, speed = 4, className = '', color = 'white', }) => {
    const gradientMap = {
        white: 'linear-gradient(120deg, rgba(255, 255, 255, 0.65) 30%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.65) 70%)',
        emerald: 'linear-gradient(120deg, #10B981 25%, #34D399 45%, #FFFFFF 50%, #34D399 55%, #10B981 75%)',
        amber: 'linear-gradient(120deg, #D97706 25%, #F59E0B 45%, #FFFFFF 50%, #F59E0B 55%, #D97706 75%)',
        violet: 'linear-gradient(120deg, #7C3AED 25%, #A78BFA 45%, #FFFFFF 50%, #A78BFA 55%, #7C3AED 75%)',
    };
    return (<span className={`relative inline-block text-transparent bg-clip-text font-inherit ${disabled ? '' : 'animate-shine'} ${className}`} style={{
            backgroundImage: gradientMap[color],
            backgroundSize: '250% 100%',
            WebkitBackgroundClip: 'text',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ['--shine-duration']: `${speed}s`,
        }}>
      {text}
    </span>);
};
