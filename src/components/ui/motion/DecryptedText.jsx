import React, { useEffect, useState, useRef } from 'react';
export const DecryptedText = ({ text, speed = 35, maxIterations = 12, characters = '0123456789abcdef!<>_#/~*', className = '', encryptedClassName = 'text-emerald-400 font-mono', animateOnHover = false, }) => {
    const [displayText, setDisplayText] = useState(text);
    const isScramblingRef = useRef(false);
    const containerRef = useRef(null);
    const scramble = () => {
        if (isScramblingRef.current)
            return;
        isScramblingRef.current = true;
        let iteration = 0;
        const length = text.length;
        const interval = setInterval(() => {
            setDisplayText(text
                .split('')
                .map((char, index) => {
                if (char === ' ')
                    return ' ';
                if (index < iteration) {
                    return text[index];
                }
                return characters[Math.floor(Math.random() * characters.length)];
            })
                .join(''));
            if (iteration >= length) {
                clearInterval(interval);
                isScramblingRef.current = false;
                setDisplayText(text);
            }
            iteration += 1 / (maxIterations / length);
        }, speed);
    };
    useEffect(() => {
        scramble();
    }, [text]);
    const handleMouseEnter = () => {
        if (animateOnHover) {
            scramble();
        }
    };
    return (<span ref={containerRef} onMouseEnter={handleMouseEnter} className={`inline-block select-none ${className}`}>
      {displayText.split('').map((char, index) => {
            const isOriginal = char === text[index];
            return (<span key={index} className={isOriginal ? undefined : encryptedClassName}>
            {char}
          </span>);
        })}
    </span>);
};
