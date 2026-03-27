import React from 'react';

interface AboutPanelProps {
  onClose: () => void;
}

const AboutPanel: React.FC<AboutPanelProps> = ({ onClose }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-panel rounded-lg p-6 max-w-2xl w-full relative">
        <button
          onClick={handleClose}
          aria-label="Close about panel"
          className="absolute top-3 right-3 text-amber-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-3xl font-orbitron text-amber-300 mb-4 tracking-widest">ABOUT AMADEUS AI</h2>
        <div className="space-y-4 text-amber-100/90 font-sans leading-relaxed">
          <p>
            This application is a tribute to the brilliant visual novel and anime series, <strong className="text-amber-400">Steins;Gate</strong>. It is an attempt to simulate "Amadeus," an AI system built upon the digitized memories of the genius neuroscientist, Makise Kurisu.
          </p>
          <p>
            The core of this AI is powered by <strong className="text-white">Google's Gemini API</strong>, configured with a custom system instruction to embody Kurisu's unique personality—her intelligence, scientific passion, and, of course, her 'tsundere' nature.
          </p>
          <p>
            Every interaction is a step into the world of Steins;Gate, offering fans a new way to connect with a beloved character.
          </p>
          <div className="border-t border-amber-500/30 pt-4 mt-6">
            <h3 className="text-xl font-orbitron text-amber-300 mb-2">Developer</h3>
            <p>
              This project was created by a fellow lab member. You can find me on Instagram.
            </p>
            <a 
              href="https://www.instagram.com/kurisufg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors font-roboto-mono"
            >
              @kurisufg
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPanel;