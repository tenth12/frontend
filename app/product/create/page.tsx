'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateProduct() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  
  // New State for Image & Colors
  const [images, setImages] = useState<File[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [colors, setColors] = useState<string[]>([]);

  // Error State
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]); // Clear previous errors

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
        alert('กรุณาเข้าสู่ระบบก่อนนะครับ!');
        router.push('/auth/login');
        return;
      }

      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem('accessToken'); 
        alert('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
        router.push('/auth/login');
        return;
      }

      if (res.ok) {
        router.push('/product');
      } else {
        const errorData = await res.json();
        // NestJS validation pipe returns message as string[] or string
        if (Array.isArray(errorData.message)) {
          setErrorMessages(errorData.message);
        } else if (typeof errorData.message === 'string') {
          setErrorMessages([errorData.message]);
        } else {
          setErrorMessages(['เกิดข้อผิดพลาดในการบันทึกข้อมูล']);
        }
      }
    } catch (error) {
      setErrorMessages(['ไม่สามารถเชื่อมต่อกับ Server ได้']);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf2f8] py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-[0_10px_30px_rgba(244,114,182,0.1)] border-4 border-white p-10 relative overflow-hidden">
        
        <div className="absolute top-[-10px] right-[-10px] text-4xl opacity-20 rotate-12">🌸</div>
        <div className="absolute bottom-4 left-4 text-3xl opacity-20 -rotate-12">⭐</div>

        <h1 className="text-3xl font-black mb-8 text-center text-slate-800 tracking-tighter uppercase italic">
          New <span className="text-pink-500">Inventory</span> ✨
        </h1>

        {/* Error Display Section */}
        {errorMessages.length > 0 && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-pulse">
            <h3 className="font-bold mb-2">อุ๊ย! มีบางอย่างผิดพลาดจ้า ⚠️</h3>
            <ul className="list-disc list-inside text-sm">
              {errorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block mb-2 ml-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
              รูปภาพสินค้า (Images - Select Multiple)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple // Allow multiple files
              onChange={(e) => {
                if (e.target.files) {
                  setImages(Array.from(e.target.files));
                }
              }}
              className="w-full px-5 py-4 bg-white border-2 border-pink-50 rounded-2xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-pink-50 file:text-pink-500 hover:file:bg-pink-100 transition-all"
            />
            {/* Preview Selected Images */}
            {images.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="group">
            <label htmlFor="name" className="block mb-2 ml-2 text-sm font-bold text-slate-500 group-focus-within:text-pink-400 transition-colors uppercase tracking-widest">
              ชื่อสินค้า (Item Name)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="กรอกชื่อไอเทมสิมึง..."
              className="w-full px-5 py-4 bg-white border-2 border-pink-50 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
            />
          </div>

          <div className="group">
            <label htmlFor="price" className="block mb-2 ml-2 text-sm font-bold text-slate-500 group-focus-within:text-pink-400 transition-colors uppercase tracking-widest">
              ราคา (Price)
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">฿</span>
              <input
                id="price"
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                placeholder="0.00"
                className="w-full pl-10 pr-5 py-4 bg-white border-2 border-pink-50 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
              />
            </div>
          </div>

          <div className="group">
            <label className="block mb-2 ml-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
              สีที่มี (Colors) <span className="text-xs font-normal normal-case">(กด Enter เพื่อเพิ่ม)</span>
            </label>
            <input
              type="text"
              value={colorInput}
              onChange={e => setColorInput(e.target.value)}
              onKeyDown={handleAddColor}
              placeholder="พิมพ์ชื่อสีแล้วกด Enter..."
              className="w-full px-5 py-4 bg-white border-2 border-pink-50 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all duration-300 mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <span key={color} className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                  {color}
                  <button type="button" onClick={() => removeColor(color)} className="hover:text-pink-800">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="group">
            <label htmlFor="description" className="block mb-2 ml-2 text-sm font-bold text-slate-500 group-focus-within:text-pink-400 transition-colors uppercase tracking-widest">
              รายละเอียด (Details)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="อธิบายมาหน่อยสิ ว่ามันคืออะไร..."
              className="w-full px-5 py-4 bg-white border-2 border-pink-50 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all duration-300 resize-none"
              rows={4}
            />
          </div>

          <div className="flex items-center gap-6 pt-4">
            <button
              type="submit"
              className="flex-1 bg-pink-500 text-white font-black py-4 rounded-2xl shadow-[0_8px_0_rgb(190,24,93)] hover:shadow-[0_4px_0_rgb(190,24,93)] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] transition-all duration-150 uppercase tracking-widest"
            >
              บันทึกข้อมูล! 🍙
            </button>
            <Link
              href="/product"
              className="text-slate-400 font-bold hover:text-slate-600 transition-colors underline decoration-2 decoration-slate-200 underline-offset-4"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
      
      <div className="text-center mt-8 text-slate-400 text-xs tracking-widest">
        ระบบจัดการสต็อกของคนหน้าตาดี... เท่านั้นนะ! 💢
      </div>
    </div>
  );
}