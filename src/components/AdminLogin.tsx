import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, ShieldAlert, KeyRound, ArrowLeft, LogIn } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Default demo credentials (configurable, customizable, safe)
  const DEFAULT_USER = 'admin';
  const DEFAULT_PASS = 'admin123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate database lookup network latency
    setTimeout(() => {
      if (
        username.toLowerCase().trim() === DEFAULT_USER && 
        password === DEFAULT_PASS
      ) {
        // Store session token in localStorage
        localStorage.setItem('admin_session_active', 'true');
        onSuccess();
      } else {
        setError('Kombinasi Username atau Password salah! Periksa kembali kredensial Anda.');
      }
      setIsLoading(false);
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8" id="admin-login-root">
      
      {/* Header Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition font-mono uppercase bg-transparent border-0"
        id="btn-back-to-gallery"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Galeri
      </button>

      {/* Brand title block */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/10 to-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Otentikasi Administrator</h2>
        <p className="text-xs text-zinc-500">Silakan masukkan akun pengelola untuk mengedit database galeri.</p>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-4" id="form-admin-login">
        {/* Username form field */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 font-mono uppercase tracking-wider">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username admin"
              className="w-full bg-zinc-900 border border-zinc-850 focus:border-emerald-500/70 text-sm pl-11 pr-4 py-3 rounded-xl text-zinc-200 outline-none transition"
              id="input-login-username"
            />
          </div>
        </div>

        {/* Password form field */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 font-mono uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-zinc-900 border border-zinc-850 focus:border-emerald-500/70 text-sm pl-11 pr-11 py-3 rounded-xl text-zinc-200 outline-none transition"
              id="input-login-password"
            />
            {/* Eye hide show toggler */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              id="btn-toggle-password-view"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Error box */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-red-950/40 border border-red-900/40 rounded-xl text-xs text-red-400 flex items-start gap-2.5"
            id="login-error-alert"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Action button submit */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading}
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-850 text-zinc-950 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
            id="btn-login-submit"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>MEMUTUSKAN KREDENSIAL...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>MASUK ADMINISTRATOR</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

    </div>
  );
}
