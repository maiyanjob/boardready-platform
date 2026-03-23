import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated Background Blobs - VISIBLE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/30 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative z-10">
        <div>
          <h1 className="text-7xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              BoardReady
            </span>
          </h1>
          <p className="text-2xl text-blue-200 font-light">AI-Powered Board Placement Platform</p>
        </div>

        <div className="space-y-6">
          {[
            { emoji: '🧠', title: 'Semantic AI Matching', desc: 'Context-aware intelligence finds perfect candidates' },
            { emoji: '⚡', title: 'Instant Search', desc: 'Natural language queries deliver results in milliseconds' },
            { emoji: '📊', title: 'Smart Analytics', desc: 'Data-driven insights optimize every placement' }
          ].map((item, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-blue-200">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-blue-300/60 text-sm">© 2026 BoardReady • Powered by Voyage AI</p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/40">
            <div className="lg:hidden mb-8">
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BoardReady
              </h1>
              <p className="text-gray-600 mt-2 text-lg">AI-Powered Placement</p>
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome back</h2>
            <p className="text-gray-600 mb-8 text-lg">Sign in to your workspace</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
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
                  className="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in →'
                )}
              </button>
            </form>

            <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100">
              <p className="text-sm font-bold text-blue-900 mb-2">🎯 Demo Account</p>
              <p className="text-sm text-blue-700 font-mono">
                admin@boardready.com<br/>
                admin123
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
