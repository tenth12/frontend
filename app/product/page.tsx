'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '../types/product';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const API_URL = `${BASE_URL}/products`;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // No token found, redirect immediately
        window.location.href = '/auth/login';
        return;
      }
      
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch(API_URL, { headers });
      
      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else if (res.status === 403) {
        alert('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ (403 Forbidden)');
      } else {
        console.error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('มึงแน่ใจนะว่าจะลบมันทิ้งน่ะ? คิดดีๆ ก่อนนะ! 💢');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบก่อนลบสินค้า!');
        window.location.href = '/auth/login';
        return;
      }

      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchProducts();
      } else {
        alert('ลบไม่สำเร็จ... สงสัยระบบจะเกลียดมึงมั้ง (หรือไม่ก็ Token หมดอายุ) หรือไม่ก็มึงไม่ใช่แอดมิน');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดโว้ยยย');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] py-10 px-6 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Inventory <span className="text-pink-500">Collection</span> 🎒
            </h1>
            <p className="text-slate-400 mt-1 italic">จัดการไอเทมของมึงให้เรียบร้อยหน่อยสิ!</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="bg-pink-300 border-2 border-slate-200 text-white hover:border-pink-300 text-slate-600 px-8 py-3 rounded-full font-bold transition-all active:scale-95 flex items-center gap-2">
                <span>หน้าแรก</span>
              </button>
            </Link>

            <Link href="/product/create">
              <button className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-[0_4px_14px_0_rgba(96,165,250,0.39)] transition-all active:scale-95 flex items-center gap-2">
                <span>+ เพิ่มสินค้าใหม่</span>
              </button>
            </Link>

            <Link href="/profile">
              <button className="bg-purple-100 hover:bg-purple-200 text-purple-600 px-6 py-3 rounded-full font-bold transition-all active:scale-95 flex items-center gap-2">
                <span>โปรไฟล์ 👤</span>
              </button>
            </Link>

            <button 
              onClick={() => {
                const confirmLogout = confirm('จะไปแล้วหรอ? 🥺');
                if (confirmLogout) {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  window.location.href = '/auth/login';
                }
              }}
              className="bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-600 px-6 py-3 rounded-full font-bold transition-all active:scale-95"
            >
              Logout 🚪
            </button>
          </div>
        </div>

        {/* Card Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-4 border-dashed border-slate-100">
            <p className="text-slate-400 text-xl font-medium">ไม่มีสินค้าเลย... เหงาจังเลยนะ 🍃</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <div 
                key={p._id} 
                className="group relative bg-white rounded-[2rem] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border-2 border-transparent hover:border-pink-200 transition-all duration-300 hover:-translate-y-2 flex flex-col"
              >
                {/* Image Section */}
                <div className="h-48 w-full bg-slate-50 rounded-2xl mb-4 overflow-hidden relative">
                   {p.imageUrls && p.imageUrls.length > 0 ? (
                     <img 
                        src={`${BASE_URL}/${p.imageUrls[0]}`} 
                        alt={p.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold bg-slate-100">
                        NO IMAGE 📷
                     </div>
                   )}
                   <div className="absolute top-2 left-2 bg-pink-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                      #{p._id.slice(-6)}
                   </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-700 group-hover:text-pink-500 transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  
                  <div className="flex gap-1 mt-2 mb-3 h-5">
                    {p.colors && p.colors.length > 0 ? (
                      p.colors.map((c, i) => (
                        <div key={i} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] text-slate-500 font-bold border border-slate-200">
                          {c}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">No colors</span>
                    )}
                  </div>

                  <div className="text-2xl font-black text-slate-800 mb-2">
                    ฿{p.price.toLocaleString()}
                  </div>

                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {p.description || "ไม่มีคำอธิบาย..."}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                    <Link 
                      href={`/product/detail/${p._id}`}
                      className="w-full text-center py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-blue-100 block"
                    >
                      ดูรายละเอียด 🔍
                    </Link>
                    
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/product/${p._id}`}
                        className="flex-1 text-center py-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-xl font-bold transition-all text-sm"
                      >
                        แก้ไข
                      </Link>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        className="flex-1 py-2 bg-pink-50 hover:bg-red-100 text-pink-400 hover:text-red-500 rounded-xl font-bold transition-all text-sm"
                      >
                        ลบ
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-20 text-center text-slate-300 text-sm">
        ดูจบแล้วก็ไปทำงานต่อได้แล้ว... มัวแต่ดูอยู่ได้! baka!
      </footer>
    </div>
  );
}