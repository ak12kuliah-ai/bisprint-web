"use client"; 

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [ikonFile, setIkonFile] = useState("fas fa-file-alt text-blue-500");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Memproses Dokumen..."); // Tambahan untuk info proses
  const [dragOver, setDragOver] = useState(false); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const maxSize = 10 * 1024 * 1024; // 10 MB
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (selectedFile.size > maxSize) {
        Swal.fire('File Terlalu Besar', 'Ukuran maksimal adalah 10 MB.', 'error');
        resetFile();
        return;
    }

    if (!allowedExtensions.includes(ext)) {
        Swal.fire('Format Tidak Didukung', 'Harap unggah PDF, Word, Excel, PPT, atau Gambar.', 'error');
        resetFile();
        return;
    }

    setFile(selectedFile);

    // Animasi pantulan ikon
    const baseIcons = {
      pdf: "fas fa-file-pdf text-red-500",
      doc: "fas fa-file-word text-blue-700",
      docx: "fas fa-file-word text-blue-700",
      xls: "fas fa-file-excel text-green-600",
      xlsx: "fas fa-file-excel text-green-600",
      ppt: "fas fa-file-powerpoint text-orange-500",
      pptx: "fas fa-file-powerpoint text-orange-500",
      png: "fas fa-file-image text-purple-500",
      jpg: "fas fa-file-image text-purple-500",
      jpeg: "fas fa-file-image text-purple-500"
    };
    const iconClass = baseIcons[ext] || "fas fa-file-alt text-blue-500";
    setIkonFile(iconClass + " animate-bounce-once");
    setTimeout(() => {
      setIkonFile(iconClass);
    }, 400);
  };

  const resetFile = () => {
    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- FUNGSI LOAD LIBRARY PDF.JS DINAMIS ---
  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window['pdfjs-dist/build/pdf']) {
        return resolve(window['pdfjs-dist/build/pdf']);
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => resolve(window['pdfjs-dist/build/pdf']);
      script.onerror = () => reject(new Error('Gagal memuat library PDF'));
      document.head.appendChild(script);
    });
  };

  // --- FUNGSI DETEKSI WARNA (PIXEL) ---
  const detectColor = (ctx, width, height) => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      let colorPixels = 0;
      const totalPixels = width * height;

      for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          
          if (max - min > 20) {
              colorPixels++;
          }
      }
      return (colorPixels / totalPixels) * 100 > 0.3; 
  };

  // --- FUNGSI SUBMIT UTAMA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);

    try {
        const ext = file.name.split('.').pop().toLowerCase();
        let totalBW = 0;
        let totalWarna = 0;

        // 1. PROSES ANALISIS JIKA FILE ADALAH PDF
        if (ext === 'pdf') {
            setLoadingText("Memuat mesin AI Pengecek Warna...");
            const pdfjsLib = await loadPdfJs();
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const totalPages = pdf.numPages;

            // Buat canvas virtual di memori (tidak tampil di layar)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            for (let i = 1; i <= totalPages; i++) {
                setLoadingText(`Menganalisis Halaman ${i} dari ${totalPages}...`);
                const page = await pdf.getPage(i);
                
                // Gunakan skala 0.3 agar proses cepat seperti di PHP sebelumnya
                const viewport = page.getViewport({ scale: 0.3 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                const isColor = detectColor(ctx, canvas.width, canvas.height);
                if (isColor) totalWarna++;
                else totalBW++;
            }
        } else {
            // Jika bukan PDF (misal JPG/DOC), set default nilai (karena butuh diproses server/kasir admin)
            setLoadingText("Memproses Lampiran...");
            totalWarna = 1; 
            totalBW = 0;
        }

        // 2. PROSES UNGGAH KE SUPABASE
        setLoadingText("Mengunggah File ke Database Server...");
        const fileNameUnik = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

        const { error } = await supabase.storage
            .from('dokumen_pesanan')
            .upload(fileNameUnik, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('dokumen_pesanan')
            .getPublicUrl(fileNameUnik);

        // 3. SIMPAN DATA ASLI KE LOCALSTORAGE
        const pesananData = {
            fileName: file.name,
            fileUrl: urlData.publicUrl,
            halBW: totalBW,         // <--- Tepat dari hasil Hitung PDF
            halWarna: totalWarna    // <--- Tepat dari hasil Hitung PDF
        };
        localStorage.setItem('pesananBisprint', JSON.stringify(pesananData));

        router.push('/preview');

    } catch (error) {
        Swal.fire('Gagal Memproses', error.message, 'error');
        setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-4 mt-8 relative">
      {/* Step indicator */}
      <div className="absolute top-0 left-0 right-0 flex justify-center -mt-6 z-20">
        <div className="bg-white shadow-lg rounded-full px-6 py-2 flex items-center gap-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">1</span>
            <span className="text-sm font-semibold text-blue-700">Unggah File</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-2 opacity-50">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-white font-bold text-sm">2</span>
            <span className="text-sm font-medium text-gray-500">Atur Pesanan</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-blue-100 transform transition-all hover:shadow-[0_20px_50px_rgba(0,0,255,0.1)]">
        
        {/* Header diganti dengan Pamflet Gambar */}
        <div className="w-full border-b border-blue-100 bg-blue-50">
          <img src="/img_login.png" alt="Pamflet Promo Bisprint" className="w-full h-auto object-cover" />
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div 
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer group ${
                file ? 'border-blue-500 bg-blue-50/80 shadow-inner' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-lg hover:scale-[1.02]'
              }`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
            >
              <div className="text-6xl mb-4 text-blue-500 transform transition-transform group-hover:scale-110 group-hover:rotate-6">
                <i className={`fas fa-cloud-upload-alt ${dragOver ? 'animate-bounce' : ''}`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Pilih atau Seret File Anda ke Sini</h3>
              <p className="text-sm text-gray-500">Format: PDF, DOC/X, XLS/X, PPT/X, PNG, JPG (Maks. 10 MB)</p>
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" 
                className="hidden" 
                onChange={handleFileChange}
              />
              {file && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full animate-ping"></div>
              )}
            </div>

            {file && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-between border border-blue-200 shadow-md animate-fadeInDown">
                <div className="flex items-center overflow-hidden">
                  <i className={`${ikonFile} text-2xl mr-3 transition-all duration-300`}></i>
                  <div className="overflow-hidden">
                    <div className="font-medium text-gray-700 truncate max-w-[200px] md:max-w-[300px]">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                {!isLoading && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); resetFile(); }} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110">
                    <i className="fas fa-times text-xl"></i>
                    </button>
                )}
              </div>
            )}

            {file && (
              <button type="submit" disabled={isLoading} 
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 flex justify-center items-center disabled:opacity-75 shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95">
                {isLoading ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> {loadingText}</>
                ) : (
                  <><span>Lanjut Pengaturan Pesanan</span> <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i></>
                )}
              </button>
            )}
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.4s ease-out;
        }
        @keyframes bounceOnce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .animate-bounce-once {
          animation: bounceOnce 0.4s ease-in-out;
        }
      `}</style>
    </main>
  );
}