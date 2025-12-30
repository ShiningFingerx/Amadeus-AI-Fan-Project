
import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { login, register } from '../logic/authService';
import { dbService } from '../logic/dbService';

interface AuthScreenProps {
  onLoginSuccess: (userProfile: UserProfile, apiKey: string) => void;
  onInitializeStart?: () => void;
}

const AuthInput: React.FC<{
    label: string;
    type: string;
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    disabled?: boolean;
    isKey?: boolean;
}> = ({ label, type, value, onChange, placeholder, disabled, isKey }) => (
    <div className="group relative flex flex-col gap-1.5 w-full mb-6">
        <div className="flex justify-between items-center px-1">
            <label className={`text-[10px] font-orbitron tracking-[0.3em] uppercase transition-colors ${isKey ? 'text-red-500/80 group-focus-within:text-red-400' : 'text-amber-500/60 group-focus-within:text-amber-400'}`}>
                {label}
            </label>
            {isKey && <span className="text-[8px] text-red-500/40 font-roboto-mono uppercase animate-pulse">Required for Sync</span>}
        </div>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full bg-slate-950/40 border border-white/5 border-l-2 py-4 px-5 font-roboto-mono text-sm outline-none transition-all backdrop-blur-sm
                    ${isKey 
                        ? 'border-l-red-600/50 focus:border-l-red-500 focus:bg-red-500/5' 
                        : 'border-l-amber-600/50 focus:border-l-amber-500 focus:bg-amber-500/5'
                    } text-white placeholder-white/10`}
            />
            <div className={`absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 ${isKey ? 'text-red-500' : 'text-amber-500'}`}></div>
        </div>
    </div>
);

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onInitializeStart }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        dbService.initDB();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !password.trim()) {
            setError("CREDENTIALS_REQUIRED");
            return;
        }

        if (!apiKeyInput.trim() && isLoginMode) {
            const brain = await dbService.loadBrain(username);
            if (!brain?.apiKey) {
                setError("NEURAL_UPLINK_KEY_MISSING");
                return;
            }
        }
        
        if (onInitializeStart) onInitializeStart();
        setIsLoading(true);

        try {
            const profile = isLoginMode
                ? await login(username, password)
                : await register(username, password);
            
            onLoginSuccess(profile, apiKeyInput);
        } catch (err) {
            setError(err instanceof Error ? err.message : "SYNC_FAILURE");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-black relative overflow-hidden font-orbitron">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)]"></div>
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)', backgroundSize: '100px 100px'}}></div>

            <div className="w-full max-w-[480px] relative z-10 animate-fade-in">
                {/* Header Decoration */}
                <div className="flex items-center justify-center gap-4 mb-12 opacity-80">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50"></div>
                    <div className="text-center">
                        <h1 className="text-5xl text-white tracking-[0.25em] font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">AMADEUS</h1>
                        <div className="text-amber-500/40 text-[9px] uppercase tracking-[1em] mt-2 ml-[1em]">Cognitive Simulation System</div>
                    </div>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50"></div>
                </div>

                <div className="glass-panel border-amber-500/20 rounded-3xl p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden">
                    {/* Inner Decoration */}
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <svg width="60" height="60" viewBox="0 0 100 100" className="text-amber-500 rotate-45">
                            <path d="M10 10 H90 V90 H10 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" />
                        </svg>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10">
                        <AuthInput label="Laboratory ID" type="text" value={username} onChange={setUsername} placeholder="USERNAME..." disabled={isLoading} />
                        <AuthInput label="Security Protocol" type="password" value={password} onChange={setPassword} placeholder="PASSWORD..." disabled={isLoading} />
                        <AuthInput label="Neural Link Key" type="password" value={apiKeyInput} onChange={setApiKeyInput} placeholder="GEMINI_API_KEY..." disabled={isLoading} isKey />

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-center gap-3 animate-shake">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest leading-tight">{error}</p>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="group relative w-full h-16 border border-amber-500/30 rounded-xl overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span className="text-amber-500 text-xs tracking-[0.5em] uppercase font-bold">Synchronizing...</span>
                                    </div>
                                ) : (
                                    <span className="text-white text-sm tracking-[0.8em] uppercase font-bold ml-[0.8em] group-hover:text-amber-300 transition-colors">
                                        {isLoginMode ? 'Initialize' : 'Register Core'}
                                    </span>
                                )}
                            </div>
                        </button>
                    </form>

                    <button 
                        onClick={() => setIsLoginMode(!isLoginMode)} 
                        className="w-full mt-8 py-2 text-[9px] text-amber-500/40 uppercase tracking-[0.4em] hover:text-amber-400 transition-all font-bold border-t border-white/5 pt-6"
                    >
                        {isLoginMode ? 'Create New Neural Profile' : 'Access Existing Cognitive Core'}
                    </button>
                </div>
                
                <div className="mt-8 flex justify-center items-center gap-8 opacity-20">
                    <div className="text-[8px] text-white tracking-[0.5em] uppercase">Status: Awaiting Link</div>
                    <div className="text-[8px] text-white tracking-[0.5em] uppercase">Protocol: v1.42</div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}} />
        </div>
    );
};

export default AuthScreen;
