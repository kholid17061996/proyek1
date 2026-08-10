export default function OrtuPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Akses Orang Tua</h1>
        <p className="text-center text-gray-500 mb-6">Silakan masukkan Kode Akses Anda.</p>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Kode Akses..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emas outline-none"
          />
          <button className="w-full bg-emas hover:bg-emasHover text-slate font-bold py-3 rounded-lg">
            Masuk
          </button>
        </div>
      </div>
    </div>
  )
}
