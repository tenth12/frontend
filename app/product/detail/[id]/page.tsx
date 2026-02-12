'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '../../../types/product';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For main display & modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('accessToken');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/products/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          alert('หาไอเทมไม่เจอ... มึงมโนไปเองป่ะ?');
          router.push('/product');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-pink-400 font-bold animate-pulse tracking-widest text-sm">LOADING DATA...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden">
      
      {/* Full Image Modal */}
      {/* Full Image Modal with Zoom */}
      {isImageModalOpen && (selectedImage || (product?.imageUrls && product.imageUrls.length > 0)) && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
        >
          {/* Close Button */}
          <button 
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-white/30 text-white rounded-full p-3 transition-all backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full h-full flex items-center justify-center overflow-hidden" onClick={(e) => {
             // Close if clicking outside the image area (if convenient, but with zoom it's tricky, so maybe just rely on button or explicit background area)
             if (e.target === e.currentTarget) setIsImageModalOpen(false);
          }}>
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <TransformComponent wrapperClass="!w-full !h-full flex items-center justify-center" contentClass="!w-full !h-full flex items-center justify-center">
                    <img 
                      src={`${BASE_URL}/${selectedImage || (product?.imageUrls ? product.imageUrls[0] : '')}`} 
                      alt={product?.name || 'Zoomable Image'} 
                      className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl"
                    />
                  </TransformComponent>
                  
                  {/* Zoom Controls */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-[110] pointer-events-none">
                     <div className="flex gap-2 bg-black/50 backdrop-blur-md p-2 rounded-2xl pointer-events-auto border border-white/10 shadow-xl">
                        <button onClick={() => zoomOut()} className="p-3 hover:bg-white/20 rounded-xl text-white transition-colors" title="Zoom Out">➖</button>
                        <button onClick={() => resetTransform()} className="p-3 hover:bg-white/20 rounded-xl text-white transition-colors" title="Reset">↺</button>
                        <button onClick={() => zoomIn()} className="p-3 hover:bg-white/20 rounded-xl text-white transition-colors" title="Zoom In">➕</button>
                     </div>
                  </div>
                </div>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}

      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob"></div>
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-[1400px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden relative z-10 flex flex-col md:flex-row transition-all duration-500">
        
        {/* Back Button (Floating) */}
        <Link 
          href="/product" 
          className="absolute top-6 left-6 z-20 bg-white/90 hover:bg-white text-slate-600 px-5 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-slate-200/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-md"
        >
          <span>←</span> Back
        </Link>
        
        {/* Left Side: Image Display */}
        <div className="md:w-1/2 relative bg-slate-50 min-h-[400px] md:min-h-[600px] flex flex-col p-8 group">
           {/* Main Image */}
           <div className="flex-1 relative flex items-center justify-center mb-4">
             {product?.imageUrls && product.imageUrls.length > 0 ? (
               <div 
                 className="relative w-full h-full transform transition-transform duration-700 ease-in-out cursor-zoom-in"
                 onClick={() => setIsImageModalOpen(true)}
               >
                  <img 
                    src={`http://localhost:3000/${selectedImage || product.imageUrls[0]}`} 
                    alt={product.name} 
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    Click to Expand 🔍
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center text-slate-300">
                 <span className="text-6xl mb-4">📷</span>
                 <span className="font-bold text-lg uppercase tracking-widest text-slate-300">No Image</span>
               </div>
             )}
           </div>

           {/* Thumbnails Gallery */}
           {product?.imageUrls && product.imageUrls.length > 1 && (
             <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
               {product.imageUrls.map((url, i) => (
                 <button
                   key={i}
                   onClick={() => setSelectedImage(url)}
                   className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${
                     (selectedImage || product.imageUrls![0]) === url 
                       ? 'border-blue-500 shadow-lg scale-110' 
                       : 'border-white opacity-70 hover:opacity-100'
                   }`}
                 >
                   <img src={`http://localhost:3000/${url}`} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                 </button>
               ))}
             </div>
           )}
           
           <div className="absolute bottom-6 right-6 bg-black/5 backdrop-blur-sm px-4 py-2 rounded-2xl text-[10px] font-mono text-slate-500 font-bold tracking-widest">
             Ref: {id.slice()}
           </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50">
          <div>
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight tracking-tight">
                {product?.name}
              </h1>
              {/* Price Tag */}
              <div className="flex-shrink-0 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-200">
                <span className="text-xs font-medium block opacity-80 uppercase tracking-widest mb-1">Price</span>
                <span className="text-2xl font-black">฿{product?.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Colors Section */}
            {product?.colors && product.colors.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Available Colors</h3>
                <div className="flex flex-wrap gap-3">
                   {product.colors.map((c, i) => (
                     <div key={i} className="group relative">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-slate-200 shadow-sm cursor-help transition-transform hover:scale-110" 
                          style={{ backgroundColor: c.toLowerCase() === 'white' ? '#fff' : c.toLowerCase() }}
                        ></div>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {c}
                        </span>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* Description Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative">
               <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-400 to-purple-400 rounded-l-3xl"></div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-4 h-[1px] bg-slate-400"></span>
                 รายละเอียดสินค้า
               </h3>
               <p className="text-slate-600 leading-relaxed text-lg font-medium opacity-90">
                 {product?.description || "No description available for this item."}
               </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-8 gap-4">
             <div className="text-xs text-slate-400 font-medium">
                อัปเดตล่าสุดเมื่อ <br/> 
                <strong className="text-slate-600">
                  {product?.updatedAt ? new Date(product.updatedAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </strong>
             </div>
             <Link 
               href={`/product/${id}`}
               className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold overflow-hidden shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
             >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-3">
                  แก้ไขสินค้า <span>🛠️</span>
                </span>
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}