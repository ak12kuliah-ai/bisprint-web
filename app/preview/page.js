"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function PreviewPage() {
  const router = useRouter();
  const [dataDokumen, setDataDokumen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [halamanPrint, setHalamanPrint] = useState('');
  const [ukuranKertas, setUkuranKertas] = useState('A4');
  const [statusJilid, setStatusJilid] = useState('Tidak Dijilid');
  const [nomorHp, setNomorHp] = useState('');
  const [catatan, setCatatan] = useState('');

  // Saat halaman dimuat, ambil data dari localStorage
  useEffect(() => {
    const pesananDataStr = localStorage.getItem('pesananBisprint');
    if (!pesananDataStr) {
      router.push('/');
    } else {
      setDataDokumen(JSON.parse(pesananDataStr));
    }
  }, [router]);

  if (!dataDokumen) return (
    <div className="flex-grow flex items-center justify-center relative z-10">
      <div className="text-center">
        <i className="fas fa-spinner fa-spin text-5xl text-blue-600 mb-4"></i>
        <p className="text-gray-500 animate-pulse">Memuat data pesanan...</p>
      </div>
    </div>
  );

  // Perhitungan Harga
  const biayaBW = dataDokumen.halBW * 500;
  const biayaWarna = dataDokumen.halWarna * 1000;
  const estimasiBiayaDasar = biayaBW + biayaWarna;
  const hargaJilid = statusJilid === 'Dijilid' ? 3000 : 0;
  const totalHarga = estimasiBiayaDasar + hargaJilid;

  const formatRupiah = (angka) => 'Rp ' + new Intl.NumberFormat('id-ID').format(angka);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const tgl = new Date();
    const dateStr = tgl.getFullYear() + String(tgl.getMonth()+1).padStart(2, '0') + String(tgl.getDate()).padStart(2, '0');
    const nomorNota = `NOTA-${dateStr}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const payload = {
        nomor_nota: nomorNota,
        file_name: dataDokumen.fileName,
        file_url: dataDokumen.fileUrl,
        halaman_print: halamanPrint || 'Semua',
        ukuran_kertas: ukuranKertas,
        status_jilid: statusJilid,
        nomor_hp: nomorHp,
        catatan: catatan,
        jumlah_halaman_bw: dataDokumen.halBW,
        jumlah_halaman_warna: dataDokumen.halWarna,
        harga_print: estimasiBiayaDasar,
        harga_jilid: hargaJilid,
        total_harga: totalHarga
    };

    try {
        const res = await fetch('/api/pesanan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Gagal menyimpan pesanan ke database');

        localStorage.removeItem('pesananBisprint');

        const noWAAdmin = "6285952406485";
        let pesanWA = `Halo Admin Bisprint,%0A%0A*PESANAN BARU MASUK*%0ANota: ${nomorNota}%0AFile: ${dataDokumen.fileName}%0AKertas: ${ukuranKertas}%0AJilid: ${statusJilid}%0ATotal Biaya: *${formatRupiah(totalHarga)}*%0ACatatan: ${catatan ? catatan : '-'}%0ANomor Pelanggan: ${nomorHp}`;
        
        window.location.href = `https://wa.me/${noWAAdmin}?text=${pesanWA}`;

    } catch (error) {
        Swal.fire('Gagal Menyimpan', error.message, 'error');
        setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-3xl mx-auto py-6 px-4 relative z-10">
      {/* Indikator Langkah */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-full px-6 py-2 flex items-center gap-3 border border-indigo-100">
          <div className="flex items-center gap-2 opacity-60">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm"><i className="fas fa-check"></i></span>
            <span className="text-sm font-medium text-gray-600">Unggah File</span>
          </div>
          <div className="w-6 h-0.5 bg-indigo-300"></div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">2</span>
            <span className="text-sm font-bold text-indigo-700">Atur Pesanan</span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/40 transform transition-all">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")` }}></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
            <button onClick={() => router.push('/')} 
              className="self-start flex items-center gap-2 text-indigo-100 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all backdrop-blur-sm border border-white/20">
              <i className="fas fa-arrow-left"></i>
              <span className="text-sm font-medium">Kembali</span>
            </button>
            <div className="ml-auto text-right">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <i className="fa-solid fa-sliders"></i> Pengaturan
              </h2>
              <p className="text-indigo-100 text-sm truncate max-w-[250px] sm:max-w-xs">
                <i className="fas fa-file-alt mr-1"></i> {dataDokumen.fileName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Analisis Dokumen */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm">
            <div className="text-2xl transform hover:scale-110 transition-transform">
              <i className="fas fa-robot text-indigo-500"></i>
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-800 flex items-center gap-2">
                <i className="fas fa-magic text-indigo-400"></i> Analisis Dokumen Otomatis
              </h4>
              <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                Sistem kami memindai setiap halaman. Halaman dengan lebih dari <span className="font-bold bg-indigo-200 px-1 rounded">10% warna non‑hitam</span> akan otomatis dihitung sebagai cetak warna.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Halaman */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i className="fas fa-file-lines text-blue-500"></i> Halaman yang Dicetak
                </label>
                <input type="text" value={halamanPrint} onChange={(e) => setHalamanPrint(e.target.value)} 
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-400 text-gray-700 shadow-sm"
                  placeholder="1-5, 8 (Kosong = Semua)" />
              </div>

              {/* Ukuran Kertas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i className="fas fa-ruler-combined text-blue-500"></i> Ukuran Kertas
                </label>
                <select value={ukuranKertas} onChange={(e) => setUkuranKertas(e.target.value)} 
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all shadow-sm text-gray-700" required>
                  <option value="A4">A4 (21 x 29.7 cm)</option>
                  <option value="F4">F4 (21.5 x 33 cm)</option>
                </select>
              </div>

              {/* Jilid */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i className="fas fa-book text-blue-500"></i> Opsi Jilid
                </label>
                <select value={statusJilid} onChange={(e) => setStatusJilid(e.target.value)} 
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all shadow-sm text-gray-700" required>
                  <option value="Tidak Dijilid">Tidak Dijilid</option>
                  <option value="Dijilid">Dijilid (+ Rp 3.000)</option>
                </select>
              </div>

              {/* Nomor HP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i className="fab fa-whatsapp text-green-500"></i> Nomor WhatsApp
                </label>
                <input type="number" value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} 
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all shadow-sm text-gray-700"
                  placeholder="0812xxxxxx" required />
              </div>
            </div>

            {/* Catatan */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <i className="fas fa-pencil-alt text-blue-500"></i> Catatan Tambahan
              </label>
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows="3" 
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all shadow-sm text-gray-700 placeholder:text-gray-400"
                placeholder="Misal: Jilid spiral, sampul depan bening, belakang merah..."></textarea>
            </div>

            {/* Rincian Biaya */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/60 border border-gray-200/80 rounded-2xl p-6 mb-8 shadow-inner">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3 border-gray-200">
                <i className="fas fa-calculator text-indigo-500"></i> Estimasi Biaya Cetak
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <i className="fas fa-circle text-gray-400 text-[8px]"></i> Hitam Putih ({dataDokumen.halBW} hal)
                  </span>
                  <span className="font-medium text-gray-800">{formatRupiah(biayaBW)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <i className="fas fa-circle text-purple-400 text-[8px]"></i> Berwarna ({dataDokumen.halWarna} hal)
                  </span>
                  <span className="font-medium text-gray-800">{formatRupiah(biayaWarna)}</span>
                </div>
                
                {statusJilid === 'Dijilid' && (
                  <div className="flex justify-between items-center text-sm text-indigo-600 font-medium animate-fadeInDown">
                    <span className="flex items-center gap-2">
                      <i className="fas fa-circle text-indigo-400 text-[8px]"></i> Jilid
                    </span>
                    <span>+ Rp 3.000</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-dashed border-gray-300 mt-4 pt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total {dataDokumen.halBW + dataDokumen.halWarna} halaman</p>
                  <p className="text-base font-bold text-gray-800">Total Tagihan</p>
                </div>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent drop-shadow-md mt-2 sm:mt-0">
                  {formatRupiah(totalHarga)}
                </p>
              </div>
            </div>

            {/* Tombol Kirim */}
            <button type="submit" disabled={isLoading} 
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex justify-center items-center disabled:opacity-75 disabled:hover:scale-100">
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i> Memproses Pesanan...</>
              ) : (
                <span className="flex items-center gap-2">
                  Kirim Pesanan & Lanjut ke WhatsApp <i className="fas fa-paper-plane group-hover:translate-x-1 transition-transform"></i>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}