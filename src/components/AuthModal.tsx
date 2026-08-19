import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Lock, Mail, User as UserIcon, KeyRound, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthOpen,
    setIsAuthOpen,
    authMode,
    setAuthMode,
    login,
    register
  } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (authMode === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed');
      }
    } else {
      if (!name) {
        setErrorMessage('Full name is required');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed');
      }
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    await login('mr.praxlabs@gmail.com', 'password123');
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAuthOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 text-white p-8 shadow-2xl z-10 font-sans"
        >
          <button
            onClick={() => setIsAuthOpen(false)}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
            aria-label="Close auth modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl font-black tracking-widest uppercase">PRAX CLIENT ACCESS</h2>
            <p className="text-xs font-mono text-zinc-400">
              {authMode === 'login' ? 'SIGN IN TO YOUR CLIENT PROFILE' : 'CREATE YOUR CLIENT PROFILE'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 border border-zinc-800 mb-6 font-mono text-xs font-bold">
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              className={`py-2 uppercase transition-colors ${
                authMode === 'login' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
              }}
              className={`py-2 uppercase transition-colors ${
                authMode === 'signup' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              REGISTER
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {authMode === 'signup' && (
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="client@praxfashion.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest py-3.5 text-xs transition-colors shadow-md mt-2"
            >
              {loading ? 'PROCESSING...' : authMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-zinc-900 text-center font-mono space-y-3">
            <p className="text-[11px] text-zinc-500">TEST ACCESS DEMO ACCOUNT</p>
            <button
              onClick={handleDemoLogin}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white py-2 text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>LOG IN AS DEMO CLIENT</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
