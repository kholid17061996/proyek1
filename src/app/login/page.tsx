'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { BookOpen, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // middleware will handle redirection to /admin or /pengajar
        // but we can also trigger a router refresh to let middleware kick in
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emas text-slate mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Mutaba'ah Tahfidz</h1>
          <p className="text-slate-200 mt-2">Login Admin & Pengajar</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate focus:border-slate outline-none transition-colors"
                placeholder="Masukkan email Anda"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate focus:border-slate outline-none transition-colors"
                placeholder="Masukkan password Anda"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emas hover:bg-emasHover text-slate font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Akses Orang Tua? <a href="/ortu" className="text-slate font-semibold hover:underline">Klik di sini</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
