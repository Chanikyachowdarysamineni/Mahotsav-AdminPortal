import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-end pb-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 overflow-hidden">
      {/* Enhanced Background Images with Brightness and Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/public/image_1.png"
          alt="animated background"
          className="absolute inset-0 w-full h-full object-cover filter brightness-125 contrast-110 saturate-120 animate-pulse-slow"
          style={{ 
            animation: 'glow 3s ease-in-out infinite alternate',
            transform: 'translateY(-10%)',
            objectPosition: 'center 40%'
          }}
        />
        <img
          src="/public/image_2.png"
          alt="background logo overlay"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        {/* Removed dark overlay to make background fully visible */}
      </div>  {/* Pure Transparent Form (no blur, fully see-through) */}
        {/* Access Button - Show when form is hidden */}
      {!showLoginForm && (
        <button
          onClick={() => setShowLoginForm(true)}
          className="relative z-10 px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 text-white font-bold text-lg rounded-xl shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center space-x-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Access Portal</span>
        </button>
      )}

      {/* Pure Transparent Form (no blur, fully see-through) */}
      {showLoginForm && (
      <div className="relative z-10 bg-transparent border border-red-300/30 p-8 rounded-2xl shadow-xl w-full max-w-sm transform transition-all hover:scale-105 duration-300">
        {/* Logo/Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-400/20 backdrop-blur-sm border border-red-300/30 rounded-full mb-3 shadow-lg">
            <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent mb-1 drop-shadow-lg">
            Admin Portal
          </h1>
          <p className="text-red-200 text-xs drop-shadow">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 px-3 py-2 rounded-lg animate-shake text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="relative">
            <label htmlFor="email" className="block text-xs font-semibold text-red-300 mb-1 drop-shadow">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-red-300/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-transparent border border-red-300/40 rounded-lg focus:ring-2 focus:ring-red-300/70 focus:border-red-300/70 outline-none transition-all duration-200 text-red-100 placeholder-red-200/60 text-sm"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-xs font-semibold text-red-300 mb-1 drop-shadow">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-red-300/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-transparent border border-red-300/40 rounded-lg focus:ring-2 focus:ring-red-300/70 focus:border-red-300/70 outline-none transition-all duration-200 text-red-100 placeholder-red-200/60 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-transparent hover:bg-red-400/20 text-red-300 font-bold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center text-sm border border-red-300/40 shadow-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-300" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
      )}
      {/* Add custom styles for glow animation */}
      <style>{`
        @keyframes glow {
          from {
            filter: brightness(125%) contrast(110%) saturate(120%);
          }
          to {
            filter: brightness(140%) contrast(115%) saturate(130%);
          }
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;