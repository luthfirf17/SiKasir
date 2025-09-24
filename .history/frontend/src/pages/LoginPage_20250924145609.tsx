import React, { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff, Building2, TrendUp, Shield, Zap, DollarSign, BarChart3, Wallet, CreditCard } from 'lucide-react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { loginUser, clearError } from '../store/slices/authSlice';
import { LoginCredentials } from '../types/auth';

const LoginPage = () => {
  // ========== REDUX HOOKS ==========
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // ========== USER ROLES DEFINITION ==========
  const userRoles = useMemo(() => [
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Akses penuh ke semua fitur sistem',
      icon: Shield,
      color: 'from-purple-600 to-blue-600'
    },
    { 
      value: 'owner', 
      label: 'Owner/Manajer', 
      description: 'Manajemen restoran dan laporan',
      icon: Building2,
      color: 'from-emerald-600 to-teal-600'
    },
    { 
      value: 'kasir', 
      label: 'Kasir', 
      description: 'Point of Sale dan transaksi',
      icon: CreditCard,
      color: 'from-orange-600 to-red-600'
    },
    { 
      value: 'kitchen', 
      label: 'Kitchen', 
      description: 'Manajemen pesanan dan dapur',
      icon: Wallet,
      color: 'from-indigo-600 to-purple-600'
    },
  ], []);

  const demoCredentials = useMemo(() => [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Kasir', username: 'kasir1', password: 'kasir123' },
    { role: 'Waiter', username: 'waiter1', password: 'waiter123' },
    { role: 'Customer', username: 'customer1', password: 'customer123' }
  ], []);

  // ========== FORM VALIDATION SCHEMA ==========
  const validationSchema = useMemo(() => yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    role: yup.string().required('Please select your role'),
  }), []);

  // ========== LIFECYCLE EFFECTS ==========
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // ========== FORM MANAGEMENT ==========
  const formik = useFormik<LoginCredentials & { role: string }>({
    initialValues: {
      username: '',
      password: '',
      rememberMe: false,
      role: '',
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(loginUser(values));
    },
  });

  // Handle form submit for button click
  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    formik.handleSubmit();
  };

  // Memoized FloatingElements component for better performance
  const FloatingElements = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Money Symbols */}
      <div className="absolute top-20 left-10 text-emerald-400/20 text-6xl animate-bounce-slow">
        $
      </div>

      <div className="absolute top-32 right-20 text-blue-400/20 text-4xl animate-float-vertical">
        €
      </div>
      <div className="absolute bottom-40 left-20 text-purple-400/20 text-5xl animate-float-diagonal">
        ¥
      </div>
      
      {/* Financial Icons */}
      <div className="absolute top-1/4 right-1/4 opacity-10">
        <TrendUp className="h-16 w-16 text-emerald-400 animate-slide-right" />
      </div>
      <div className="absolute bottom-1/3 left-1/3 opacity-10">
        <BarChart3 className="h-14 w-14 text-blue-400 animate-slide-left" />
      </div>
      <div className="absolute top-1/2 left-10 opacity-10">
        <DollarSign className="h-12 w-12 text-yellow-400 animate-rotate-slow" />
      </div>
      
      {/* POS Elements */}
      <div className="absolute bottom-20 right-10 opacity-10">
        <CreditCard className="h-10 w-10 text-indigo-400 animate-slide-up" />
      </div>
      <div className="absolute top-40 left-1/2 opacity-10">
        <Wallet className="h-8 w-8 text-green-400 animate-float-horizontal" />
      </div>
      
      {/* Receipt Animation */}
      <div className="absolute bottom-1/4 right-1/3 opacity-15">
        <div className="bg-white/10 w-8 h-16 rounded transform animate-slide-down">
          <div className="h-1 bg-emerald-400/30 w-full mt-2"></div>
          <div className="h-1 bg-blue-400/30 w-3/4 mt-1"></div>
          <div className="h-1 bg-purple-400/30 w-1/2 mt-1"></div>
          <div className="h-1 bg-yellow-400/30 w-full mt-1"></div>
        </div>
      </div>
      
      {/* Coins Animation */}
      <div className="absolute top-16 right-1/3 opacity-20">
        <div className="w-6 h-6 rounded-full bg-yellow-400/30 animate-coin-flip"></div>
      </div>
      <div className="absolute bottom-16 left-1/4 opacity-20">
        <div 
          className="w-4 h-4 rounded-full bg-amber-400/30 animate-coin-flip" 
          style={{ animationDelay: '1s' }}
        ></div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative">
      {/* Custom CSS Styles */}
      <style>{`
        @keyframes float-vertical {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-horizontal {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(15px); }
        }
        @keyframes float-diagonal {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(10px, -15px); }
        }
        @keyframes slide-right {
          0%, 100% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
        }
        @keyframes slide-left {
          0%, 100% { transform: translateX(10px); }
          50% { transform: translateX(-10px); }
        }
        @keyframes slide-up {
          0%, 100% { transform: translateY(10px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-down {
          0%, 100% { transform: translateY(-5px); }
          50% { transform: translateY(5px); }
        }
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes coin-flip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
        
        .animate-float-vertical { animation: float-vertical 4s ease-in-out infinite; }
        .animate-float-horizontal { animation: float-horizontal 5s ease-in-out infinite; }
        .animate-float-diagonal { animation: float-diagonal 6s ease-in-out infinite; }
        .animate-slide-right { animation: slide-right 8s ease-in-out infinite; }
        .animate-slide-left { animation: slide-left 7s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 5s ease-in-out infinite; }
        .animate-slide-down { animation: slide-down 6s ease-in-out infinite; }
        .animate-rotate-slow { animation: rotate-slow 12s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-coin-flip { animation: coin-flip 4s ease-in-out infinite; }
      `}</style>
      
      <FloatingElements />
      
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="w-full max-w-md relative">
        <form onSubmit={formik.handleSubmit}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400"></div>
            
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                SiKasir <span className="text-emerald-400">Financial</span>
              </h1>
              <p className="text-slate-300 text-sm">
                Modern Restaurant Financial System
              </p>
            </div>

            {/* ========== ERROR ALERT ========== */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <fieldset disabled={isLoading} className="space-y-6">
              
              {/* ========== ROLE SELECTION ========== */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Login sebagai
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userRoles.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <label
                        key={role.value}
                        className={`
                          relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105
                          ${formik.values.role === role.value 
                            ? `bg-gradient-to-r ${role.color} border-white/30 shadow-lg text-white` 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formik.values.role === role.value}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="sr-only"
                          aria-describedby={formik.errors.role ? "role-error" : undefined}
                        />
                        <div className="flex flex-col items-center text-center">
                          <IconComponent className={`h-6 w-6 mb-2 ${formik.values.role === role.value ? 'text-white' : 'text-emerald-400'}`} />
                          <span className="text-sm font-semibold">{role.label}</span>
                          <span className="text-xs opacity-80 mt-1">{role.description}</span>
                        </div>
                        {formik.values.role === role.value && (
                          <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse"></div>
                        )}
                      </label>
                    );
                  })}
                </div>
                {formik.touched.role && formik.errors.role && (
                  <p id="role-error" className="text-red-400 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {formik.errors.role}
                  </p>
                )}
              </div>

              {/* ========== USERNAME INPUT ========== */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-slate-200">Username</label>
                <div className="relative group">
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onFocus={() => setFocusedField('username')}
                    aria-label="Username"
                    aria-describedby={formik.errors.username ? "username-error" : undefined}
                    className={`
                      w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-slate-400
                      transition-all duration-300 focus:outline-none focus:bg-white/15
                      ${focusedField === 'username' || formik.values.username
                        ? 'border-emerald-400 shadow-lg shadow-emerald-400/25' 
                        : 'border-white/20 hover:border-white/30'
                      }
                      ${formik.touched.username && formik.errors.username ? 'border-red-400 shadow-lg shadow-red-400/25' : ''}
                    `}
                    placeholder="Enter your username"
                  />
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
                    focusedField === 'username' ? 'bg-emerald-400/5 opacity-100' : 'opacity-0'
                  }`}></div>
                </div>
                {formik.touched.username && formik.errors.username && (
                  <p id="username-error" className="text-red-400 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {formik.errors.username}
                  </p>
                )}
              </div>

              {/* ========== PASSWORD INPUT ========== */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onFocus={() => setFocusedField('password')}
                    aria-label="Password"
                    aria-describedby={formik.errors.password ? "password-error" : undefined}
                    className={`
                      w-full px-4 py-3 pr-12 bg-white/10 border-2 rounded-xl text-white placeholder-slate-400
                      transition-all duration-300 focus:outline-none focus:bg-white/15
                      ${focusedField === 'password' || formik.values.password
                        ? 'border-emerald-400 shadow-lg shadow-emerald-400/25' 
                        : 'border-white/20 hover:border-white/30'
                      }
                      ${formik.touched.password && formik.errors.password ? 'border-red-400 shadow-lg shadow-red-400/25' : ''}
                    `}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
                    focusedField === 'password' ? 'bg-emerald-400/5 opacity-100' : 'opacity-0'
                  }`}></div>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p id="password-error" className="text-red-400 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* ========== REMEMBER ME CHECKBOX ========== */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formik.values.rememberMe}
                    onChange={formik.handleChange}
                    className="sr-only"
                    aria-label="Remember me"
                  />
                  <div className={`
                    w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200
                    ${formik.values.rememberMe 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-white/30 group-hover:border-emerald-400'
                    }
                  `}>
                    {formik.values.rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                    Remember me
                  </span>
                </label>
              </div>

              {/* ========== SUBMIT BUTTON ========== */}
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={isLoading}
                aria-label="Sign in to your account"
                className={`
                  w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform
                  ${isLoading 
                    ? 'bg-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                  }
                  text-white relative overflow-hidden
                `}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span className="relative z-10">Sign In</span>
                )}
              </button>

              {/* ========== FORGOT PASSWORD LINK ========== */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors duration-200 hover:underline"
                  onClick={() => {
                    // Handle forgot password navigation
                    console.log('Navigate to forgot password page');
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </fieldset>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-center mb-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Demo Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {demoCredentials.map((cred, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200 cursor-pointer group"
                      onClick={() => {
                        formik.setValues({
                          ...formik.values,
                          username: cred.username,
                          password: cred.password,
                          role: cred.role.toLowerCase() === 'admin' ? 'admin' : 
                                cred.role.toLowerCase() === 'kasir' ? 'kasir' : 
                                cred.role.toLowerCase() === 'waiter' ? 'kitchen' : 'kasir'
                        });
                      }}
                    >
                      <div className="text-emerald-400 font-semibold group-hover:text-emerald-300">
                        {cred.role}
                      </div>
                      <div className="text-slate-400 group-hover:text-slate-300">
                        {cred.username} / {cred.password}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 opacity-10">
              <BarChart3 className="h-32 w-32 text-emerald-400 animate-slide-right" />
            </div>
          </div>
        </form>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Shield, label: 'Secure', color: 'text-blue-400' },
            { icon: DollarSign, label: 'Financial', color: 'text-emerald-400' },
            { icon: TrendingUp, label: 'Analytics', color: 'text-purple-400' }
          ].map(({ icon: Icon, label, color }, index) => (
            <div
              key={index}
              className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
            >
              <Icon className={`h-6 w-6 ${color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;