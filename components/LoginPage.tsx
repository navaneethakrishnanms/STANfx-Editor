import React, { useState, useMemo } from 'react';
import type { User } from '../types';

// A simple (and not cryptographically secure) hash function for demonstration purposes.
// This avoids using `crypto.subtle` which requires a secure context (HTTPS/localhost)
// and may not work over a local network HTTP link.
const simpleHash = (str: string): string => {
  if (!str) return '';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Prepend a character to ensure it's always treated as a string
  return 'h' + (hash >>> 0).toString(16);
};


const PhotoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--accent-secondary)] transition-all duration-1000" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const Moth = ({ style, animationName }: { style: React.CSSProperties, animationName: string }) => (
    <div className="moth" style={{ ...style, animation: `${animationName} linear forwards`}}>
        <div className="moth-wing left"></div>
        <div className="moth-wing right"></div>
    </div>
);

interface LoginPageProps {
  onLogin: (username: string) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users, setUsers }) => {
  const [isLampOn, setIsLampOn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const lights = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        transform: `scale(${Math.random() * 0.6 + 0.4})`, // scale from 0.4 to 1.0
        animationDelay: `${Math.random() * 5}s`,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    if (isRegistering) {
      if (users.find(u => u.username === username)) {
        setError("Username already exists.");
        return;
      }
      const passwordHash = simpleHash(password);
      const role = users.length === 0 ? 'admin' : 'user';
      setUsers([...users, { username, passwordHash, role }]);
      onLogin(username);
    } else {
      const user = users.find(u => u.username === username);
      if (!user) {
        setError("Invalid username or password.");
        return;
      }
      const passwordHash = simpleHash(password);
      if (user.passwordHash !== passwordHash) {
        setError("Invalid username or password.");
        return;
      }
      onLogin(username);
    }
  };

  const toggleLamp = () => {
    setIsLampOn(prev => !prev);
  }

  return (
    <div className="login-page-wrapper">
      <div className={`night-sky ${isLampOn ? 'lamp-on' : ''}`} onClick={toggleLamp}>
        {/* --- Moths --- */}
        <Moth style={{ top: '40%', left: '25%', animationDuration: '8s', animationDelay: '0s' }} animationName="move-moth-1" />
        <Moth style={{ top: '60%', left: '70%', animationDuration: '10s', animationDelay: '1s' }} animationName="move-moth-2" />
        <Moth style={{ top: '55%', left: '40%', animationDuration: '7s', animationDelay: '0.5s' }} animationName="move-moth-3" />
        <Moth style={{ top: '70%', left: '85%', animationDuration: '9s', animationDelay: '2s' }} animationName="move-moth-1" />
        <Moth style={{ top: '50%', left: '15%', animationDuration: '11s', animationDelay: '1.5s' }} animationName="move-moth-2" />
        
        {/* --- Scattered Lights --- */}
        {lights.map(({ top, left, transform, animationDelay }, index) => (
            <div key={index} className="light-wrapper" style={{ top, left }}>
                <div className="light-string" style={{ animationDelay }} />
                <div className="light-orb" style={{ transform, animationDelay }} />
            </div>
        ))}

        {/* --- Animated Logo --- */}
        <div className="logo-wrapper" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center">
              <PhotoIcon />
              <h1 className="text-2xl sm:text-3xl font-bold mt-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent transition-all duration-1000">
                  STANFx
              </h1>
          </div>
        </div>

        {/* --- Animated Form --- */}
        <div className="form-wrapper w-full max-w-md px-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-[rgba(var(--bg-secondary-rgb),0.6)] backdrop-blur-xl border border-[rgba(var(--border-rgb),0.1)] rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-primary">{isRegistering ? 'Create Your Account' : 'Welcome Back'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-secondary">Username</label>
                <div className="mt-1">
                  <input
                    id="username" name="username" type="text" autoComplete="username" required
                    value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 bg-[rgba(var(--bg-tertiary-rgb),0.8)] border border-[rgb(var(--bg-interactive-rgb))] rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-shadow"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password"className="block text-sm font-medium text-secondary">Password</label>
                <div className="mt-1">
                  <input
                    id="password" name="password" type="password"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[rgba(var(--bg-tertiary-rgb),0.8)] border border-[rgb(var(--bg-interactive-rgb))] rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-shadow"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-[rgb(var(--danger-text-rgb))] bg-[rgba(var(--danger-bg-rgb),0.5)] p-3 rounded-md border border-[rgba(var(--danger-border-rgb),0.3)]">{error}</p>}

              <div>
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-sky-500/10 text-sm font-semibold text-white bg-gradient-to-br from-[var(--accent-gradient-from)] to-[var(--accent-gradient-to)] hover:from-[var(--accent-primary)] hover:to-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-secondary-rgb))] focus:ring-[var(--accent-primary)] transition-all">
                  {isRegistering ? 'Register' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
              >
                {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};