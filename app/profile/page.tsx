'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  userId: string;
  email: string;
  role: string;
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        localStorage.removeItem('accessToken');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = confirm('จะไปแล้วหรอ? 🥺');
    if (confirmLogout) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/auth/login');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_20px_50px_rgba(100,116,139,0.1)] border-4 border-white overflow-hidden">
        
        <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-400 relative">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-white rounded-full p-2">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-5xl border-4 border-purple-100">
                    👤
                </div>
            </div>
        </div>

        <div className="pt-20 pb-10 px-8 text-center">
            
          <h1 className="text-2xl font-black text-slate-800 mb-1">
            {profile?.email}
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            profile?.role === 'admin' 
                ? 'bg-pink-100 text-pink-500' 
                : 'bg-blue-100 text-blue-500'
          }`}>
            {profile?.role?.toUpperCase()}
          </span>

          <div className="mt-8 grid grid-cols-1 gap-4 text-left">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">User ID</p>
                <p className="font-mono text-slate-600 text-sm break-all">{profile?.userId}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
             <Link href="/product" className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95">
                🔙 กลับไปหน้ารายการ
             </Link>
             
             <button 
                onClick={handleLogout}
                className="w-full py-3 bg-pink-50 hover:bg-red-50 text-pink-400 hover:text-red-500 font-bold rounded-xl transition-all active:scale-95 border border-pink-100 hover:border-red-100"
             >
                ออกจากระบบ (Logout)
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
