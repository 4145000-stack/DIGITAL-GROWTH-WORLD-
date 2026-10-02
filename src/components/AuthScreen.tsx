import React, { useState } from 'react';
import { Chrome, Facebook, ArrowUpRight } from 'lucide-react';
import heroImage from '../assets/images/astro_hero_1789523002068.jpg';

interface AuthScreenProps {
  onLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    agreed: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.agreed) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#53305B] via-[#2F1D38] to-[#120B1C]">
      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-fade-in">
        
        {/* Left Column: Image & Branding */}
        <div className="relative w-full md:w-1/2 min-h-[300px] md:min-h-[600px] flex flex-col justify-between p-8 text-white overflow-hidden">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-0" />
          
          <div className="relative z-10 font-bold text-xl tracking-tight text-white drop-shadow-md">
            DGW
          </div>
          
          <div className="relative z-10 mt-auto">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2 drop-shadow-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Exploring new frontiers,<br />one step at a Time.
            </h1>
          </div>

          <div className="relative z-10 mt-12 text-xs font-medium text-white/80 uppercase tracking-widest drop-shadow-md">
            Beyond Earth's grasp
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-14 flex flex-col relative bg-white">
          
          {/* Top Right Sign In Link */}
          <div className="absolute top-8 right-8 text-sm font-medium text-gray-500 flex items-center gap-1 cursor-pointer hover:text-gray-800 transition">
            Already a member? Sign in <ArrowUpRight className="w-4 h-4" />
          </div>

          <div className="mt-8 md:mt-12 flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Create Account
            </h2>

            {/* Social Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#5123A1] hover:bg-[#3F1A7E] transition text-white rounded-full text-sm font-semibold shadow-sm">
                <Chrome className="w-4 h-4" />
                Sign up with Google
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#F0EEF5] hover:bg-[#E2DCEB] transition text-[#3A2D4F] rounded-full text-sm font-semibold shadow-sm">
                <Facebook className="w-4 h-4 text-[#3A2D4F]" />
                with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Or sign up using your email address
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Name</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#F4F3F7] text-gray-900 px-5 py-3.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5123A1]/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Email or Phone no.</label>
                <input 
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#F4F3F7] text-gray-900 px-5 py-3.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5123A1]/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Username</label>
                <input 
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-[#F4F3F7] text-gray-900 px-5 py-3.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5123A1]/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-[#F4F3F7] text-gray-900 px-5 py-3.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5123A1]/30 transition"
                />
              </div>

              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={formData.agreed}
                  onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
                  className="w-4 h-4 text-[#5123A1] bg-gray-100 border-gray-300 rounded focus:ring-[#5123A1] focus:ring-2 cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 text-xs font-medium text-gray-500 cursor-pointer">
                  I agree to all terms and Privacy Policy
                </label>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 bg-[#0A0514] hover:bg-[#1A102D] text-white font-semibold py-3.5 rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                Sign up
              </button>

              <div className="text-center mt-4 text-xs font-medium text-gray-500">
                Already have an account? <span className="text-gray-900 font-bold cursor-pointer hover:underline">Log in</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
