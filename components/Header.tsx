import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import type { User } from '../types';

const PhotoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-3.536a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM5.05 14.95l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM1.293 10.707a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4 10a1 1 0 01-1-1H2a1 1 0 110-2h1a1 1 0 110 2z" clipRule="evenodd" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;


interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
    onGoToAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onGoToAdmin }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <header className="bg-[rgba(var(--bg-secondary-rgb),0.6)] backdrop-blur-xl border-b border-[rgba(var(--border-rgb),0.1)] sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <PhotoIcon />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                        STANFx
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-secondary hidden sm:inline">Welcome, <span className="font-semibold text-primary">{currentUser.username}</span></span>
                    
                    {currentUser.role === 'admin' && (
                       <button
                            onClick={onGoToAdmin}
                            className="p-2 bg-sky-500/10 text-sky-400 rounded-md hover:bg-sky-500/20 hover:text-sky-300 border border-sky-500/20 hover:border-sky-500/30 transition-colors"
                            aria-label="Open Admin Panel"
                        >
                            <AdminIcon />
                        </button>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="p-2 bg-[rgba(var(--bg-tertiary-rgb),0.8)] text-secondary rounded-md hover:bg-[rgb(var(--bg-interactive-rgb))] hover:text-primary border border-[rgb(var(--bg-interactive-rgb))] hover:border-[rgba(var(--bg-interactive-hover-rgb))] transition-colors"
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </button>
                    <button 
                        onClick={onLogout}
                        className="px-4 py-2 bg-[rgb(var(--bg-tertiary-rgb))] text-sm font-medium text-secondary rounded-md hover:bg-[rgba(var(--bg-interactive-rgb),0.8)] border border-[rgb(var(--bg-interactive-rgb))] hover:border-[rgb(var(--bg-interactive-hover-rgb))] transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};