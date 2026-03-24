import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Left Side - Hero */}
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative z-10"
      >
        <div>
          <h1 className="text-7xl font-black mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              BoardReady
            </span>
          </h1>
          <p className="text-2xl text-slate-300 font-light">AI-Powered Board Placement Platform</p>
        </div>

        <div className="space-y-4">
          {[
            { emoji: '🧠', title: 'Semantic AI Matching', desc: 'Context-aware intelligence finds perfect candidates' },
            { emoji: '⚡', title: 'Instant Search', desc: 'Natural language queries deliver results in milliseconds' },
            { emoji: '📊', title: 'Smart Analytics', desc: 'Data-driven insights optimize every placement' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200 inline-block">
                {item.emoji}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-slate-600 text-sm">© 2026 BoardReady • Powered by Voyage AI</p>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10"
      >
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/40">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                BoardReady
              </h1>
              <p className="text-gray-500 mt-2 text-lg">AI-Powered Placement</p>
            </div>

            <h2 className="text-4xl font-black text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500 mb-8 text-lg">Sign in to your workspace</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
                >
                  <p className="text-red-700 font-semibold text-sm">{error}</p>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full h-14 px-4 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-14 px-4 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200 bg-white text-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-base font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in →'
                )}
              </button>
            </form>

            <div className="mt-8 p-5 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl border-2 border-blue-100">
              <p className="text-sm font-bold text-gray-700 mb-2">🎯 Demo Account</p>
              <p className="text-sm text-gray-600 font-mono">
                admin@boardready.com<br />
                admin123
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
