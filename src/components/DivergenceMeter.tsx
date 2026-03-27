
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DivergenceMeterProps {
    isGlitching: boolean;
}

const DivergenceMeter: React.FC<DivergenceMeterProps> = ({ isGlitching }) => {
    const [divergence, setDivergence] = useState('1.048596');
    const timeoutRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    const generateNewDivergence = () => {
        const base = 1.048596;
        const randomOffset = (Math.random() - 0.5) * 0.0001;
        return (base + randomOffset).toFixed(6);
    };

    const scheduleUpdate = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        const randomDelay = Math.random() * (20000 - 5000) + 5000;
        timeoutRef.current = window.setTimeout(() => {
            setDivergence(generateNewDivergence());
            scheduleUpdate();
        }, randomDelay);
    }, []);

    useEffect(() => {
        if (isGlitching) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            const glitchDuration = 4000;
            intervalRef.current = window.setInterval(() => {
                const randomDivergence = `${Math.floor(Math.random() * 2)}.${Math.random().toString().substring(2, 8)}`;
                setDivergence(randomDivergence);
            }, 50);

            const timer = setTimeout(() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = null;
                setDivergence('1.048596');
                scheduleUpdate();
            }, glitchDuration);
            
            return () => clearTimeout(timer);
        }
    }, [isGlitching, scheduleUpdate]);

    useEffect(() => {
        if (!isGlitching) scheduleUpdate();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isGlitching, scheduleUpdate]);

    return (
        <div className="text-center">
            <span className="text-amber-500/80 uppercase font-orbitron tracking-[0.3em] text-[10px] font-bold">World Line Divergence</span>
            <div className="font-roboto-mono text-3xl tracking-[0.15em] mt-1 flex justify-center items-center" style={{ color: '#fbbf24', textShadow: '0 0 15px rgba(251,191,36,0.8)' }}>
                {divergence.split('').map((char, index) => (
                    <span key={index}>{char}</span>
                ))}
            </div>
        </div>
    );
};

export default DivergenceMeter;
