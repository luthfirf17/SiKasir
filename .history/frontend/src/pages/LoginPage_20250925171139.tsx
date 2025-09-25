import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Building2, TrendingUp, Shield, Zap, DollarSign, BarChart3, Wallet, CreditCard } from 'lucide-react';
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
  const { isLoading, error, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // ========== USER ROLES DEFINITION ==========
  const userRoles = [
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
  ];

  const demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Kasir', username: 'kasir1', password: 'kasir123' },
    { role: 'Waiter', username: 'waiter1', password: 'waiter123' },
    { role: 'Customer', username: 'customer1', password: 'customer123' }
  ];

  // ========== FORM VALIDATION SCHEMA ==========
  const validationSchema = yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    role: yup.string().required('Please select your role'),
  });

  // ========== LIFECYCLE EFFECTS ==========
  useEffect(() => {
    if (isAuthenticated && user) {
      // Navigate based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'owner':
          navigate('/owner/dashboard');
          break;
        case 'kasir':
          navigate('/kasir/dashboard');
          break;
        case 'kitchen':
        case 'waiter':
          navigate('/kitchen/dashboard');
          break;
        case 'customer':
          navigate('/customer/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

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
      // Include role in login credentials
      const loginData: LoginCredentials = {
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe,
        role: values.role,
      };
      dispatch(loginUser(loginData));
    },
  });

  // ========== KEYBOARD EVENT HANDLER ==========
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      formik.handleSubmit();
    }
  };

  const FloatingElements = () => (
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
        <TrendingUp className="h-16 w-16 text-emerald-400 animate-slide-right" />
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
        <div className="w-4 h-4 rounded-full bg-amber-400/30 animate-coin-flip" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  );  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative">
      <FloatingElements />

      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Mobile Layout */}
      <div className="w-full max-w-md lg:hidden relative">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {renderLoginContent()}
        </div>
      </div>

      {/* Desktop/Tablet Layout - Side by Side */}
      <div className="hidden lg:block w-full max-w-6xl relative">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding & Features */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <div className="flex justify-center lg:justify-start mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  SiKasir <span className="text-emerald-400">Financial</span>
                </h1>
                <p className="text-slate-300 text-lg mb-8">
                  Modern Restaurant Financial System
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: 'Secure Login', desc: 'Advanced security' },
                  { icon: DollarSign, label: 'Financial Mgmt', desc: 'Complete financial tools' },
                  { icon: TrendingUp, label: 'Analytics', desc: 'Real-time insights' },
                  { icon: CreditCard, label: 'POS System', desc: 'Modern point of sale' }
                ].map(({ icon: Icon, label, desc }, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <Icon className="h-8 w-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-white font-semibold text-sm mb-1">{label}</h3>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Demo Credentials - Desktop */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Demo Credentials
                </h3>
                <div className="grid grid-cols-2 gap-3">
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
                      <div className="text-emerald-400 font-semibold group-hover:text-emerald-300 text-sm">
                        {cred.role}
                      </div>
                      <div className="text-slate-400 group-hover:text-slate-300 text-xs">
                        {cred.username} / {cred.password}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="space-y-6">
              {renderLoginForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to render login content for mobile
  function renderLoginContent() {
    return (
      <>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400"></div>

        <div className="text-center mb-6">
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

        {renderLoginForm()}

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-center mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              Demo Credentials
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
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
      </>
    );
  }

  // Helper function to render login form
  function renderLoginForm() {
    return (
      <>
        {/* ========== ERROR ALERT ========== */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-6">

          {/* ========== ROLE SELECTION ========== */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Login sebagai
            </label>
            <div className="grid grid-cols-2 gap-3">
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
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                {formik.errors.role}
              </p>
            )}
          </div>

          {/* ========== USERNAME INPUT ========== */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Username</label>
            <div className="relative group">
              <input
                type="text"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={() => setFocusedField('username')}
                onKeyPress={handleKeyPress}
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
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                {formik.errors.username}
              </p>
            )}
          </div>

          {/* ========== PASSWORD INPUT ========== */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Password</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={() => setFocusedField('password')}
                onKeyPress={handleKeyPress}
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
                focusedField === 'password' ? 'bg-emerald-400/5 opacity-100' : 'opacity-0'
              }`}></div>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-400 text-sm flex items-center gap-1">
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
            type="submit"
            disabled={isLoading}
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
        </div>
        </form>
      </>
    );
  }
};

export default LoginPage;
