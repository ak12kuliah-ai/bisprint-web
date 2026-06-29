import './globals.css'

export const metadata = {
  title: 'Bisprint - Cetak Dokumen Online',
  description: 'Solusi Cetak Dokumen Online Cepat & Mudah',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="text-gray-800 font-['Poppins',sans-serif] min-h-screen flex flex-col relative overflow-x-hidden" 
        style={{
          backgroundColor: '#f0f4f8',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {/* Floating decorative orbs */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Navbar Global */}
        <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <a href="/" className="hover:opacity-80 transition transform hover:scale-105">
              {/* Logo dimasukkan ke sini */}
              <img src="/logo_bisprint.png" alt="Logo Bisprint" className="h-10 md:h-12 w-auto" />
            </a>
            <div className="text-sm font-medium bg-blue-800/60 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-400/30 shadow-inner flex items-center gap-1">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Buka: 08.00 - 21.00
            </div>
          </div>
        </nav>

        {/* Konten Halaman */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>

        {/* Footer Global */}
        <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-center py-5 mt-auto relative z-10 border-t-4 border-blue-600">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-sm text-gray-400 mb-2">
              <i className="fas fa-map-marker-alt mr-1"></i> Cirebon, Jawa Barat
            </p>
            <p className="text-sm font-medium text-gray-500">
              &copy; 2026 Bisprint | Project Info: <a href="https://instagram.com/rizal_sss9" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">@rizal_sss9</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}