'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); 
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  
  const [images, setImages] = useState<File[]>([]);
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('accessToken');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/products/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setName(data.name);
          setPrice(data.price);
          setDescription(data.description);
          setColors(data.colors || []);
          setCurrentImageUrls(data.imageUrls || []);
        } else {
          alert('ไม่พบไอเทมชิ้นนี้นะ... มึงหลงทางป่ะเนี่ย?');
          router.push('/product');
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleAddColor = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && colorInput.trim()) {
      e.preventDefault();
      if (!colors.includes(colorInput.trim())) {
        setColors([...colors, colorInput.trim()]);
      }
      setColorInput('');
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColors(colors.filter(c => c !== colorToRemove));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('description', description);
      
      colors.forEach(color => formData.append('colors', color));

      if (images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
         router.push('/auth/login');
         return;
      }

      const res = await fetch(`${apiUrl}/products/${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (res.status === 401) {
         localStorage.removeItem('accessToken');
         router.push('/auth/login');
         return;
      }

      if (res.ok) {
        router.push('/product');
      } else {
        const errorData = await res.json();
        if (Array.isArray(errorData.message)) {
          setErrorMessages(errorData.message);
        } else if (typeof errorData.message === 'string') {
          setErrorMessages([errorData.message]);
        } else {
          setErrorMessages(['เกิดข้อผิดพลาดในการอัปเดตข้อมูล']);
        }
      }
    } catch (error) {
      setErrorMessages(['ไม่สามารถเชื่อมต่อกับ Server ได้']);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
      <p className="ml-4 text-blue-400 font-bold">กำลังโหลดข้อมูล... อย่ารีบสิ!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4ff] py-12 px-4 font-sans text-slate-700">
      <div className="max-w-lg mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(100,116,139,0.1)] border-8 border-white overflow-hidden relative">
        
        <div className="h-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>

        <div className="p-10">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-800">
                Edit <span className="text-blue-500 underline decoration-wavy decoration-blue-200">Item</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">ID: <span className="font-mono text-pink-500">#{id}</span></p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
              🛠️
            </div>
          </header>

          {/* Error Display */}
          {errorMessages.length > 0 && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-pulse">
              <h3 className="font-bold mb-2">โอ๊ะโอ! แก้ข้อมูลไม่ได้จ้า ⚠️</h3>
              <ul className="list-disc list-inside text-sm">
                {errorMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                Product Images (Select new to replace all)
              </label>
              
              {/* Display Current Images */}
              {currentImageUrls.length > 0 && images.length === 0 && (
                 <div className="mb-4 flex gap-4 overflow-x-auto pb-2">
                    {currentImageUrls.map((url, index) => (
                      <div key={index} className="flex-shrink-0 w-32 h-32 relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <img 
                          src={`http://localhost:3000/${url}`} 
                          alt={`Current ${index}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                 </div>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setImages(Array.from(e.target.files));
                  }
                }}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-300 focus:bg-white focus:outline-none transition-all duration-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-500 hover:file:bg-blue-200"
              />

              {/* Preview New Images */}
              {images.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-blue-200">
                      <img src={URL.createObjectURL(img)} alt="new preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                Product Name
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="ชื่อสินค้าใหม่..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-300 focus:bg-white focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                Price (THB)
              </label>
              <input 
                type="number" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                required 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-300 focus:bg-white focus:outline-none transition-all duration-300"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                Colors <span className="text-[10px] font-normal normal-case">(Enter to add)</span>
              </label>
              <input
                type="text"
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                onKeyDown={handleAddColor}
                placeholder="เพิ่มสี..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-300 focus:bg-white focus:outline-none transition-all duration-300 mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <span key={color} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                    {color}
                    <button type="button" onClick={() => removeColor(color)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 ml-2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                Description
              </label>
              <textarea 
                rows={4}
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="บอกรายละเอียดมาหน่อย..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-300 focus:bg-white focus:outline-none transition-all duration-300 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <Link 
                href="/product"
                className="flex items-center justify-center py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-2xl transition-all active:scale-95"
              >
                ย้อนกลับ
              </Link>
              
              <button 
                type="submit"
                className="py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 duration-200"
              >
                อัปเดตเลย! ✨
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <p className="text-center mt-8 text-slate-400 text-sm italic">
        "แก้ให้ดีๆ นะ อย่าให้ฉันต้องมาตรวจซ้ำล่ะ!" 😤
      </p>
    </div>
  );
}