'use server'

import { createClient } from '@supabase/supabase-js'

export async function createPengajarAccount(formData: FormData) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel di .env.local' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nama = formData.get('nama') as string

  if (!email || !password || !nama) {
    return { error: 'Email, Password, dan Nama harus diisi' }
  }

  // Gunakan service_role key untuk mendapatkan akses admin
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Otomatis terkonfirmasi
  })

  if (authError) {
    return { error: 'Gagal membuat akun: ' + authError.message }
  }

  if (!authData.user) {
    return { error: 'Gagal mendapatkan data user setelah pembuatan akun' }
  }

  const userId = authData.user.id

  // 2. Create Profile
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert([
      {
        id: userId,
        full_name: nama,
        email: email,
        role: 'pengajar',
        is_active: true
      }
    ])

  if (profileError) {
    // Jika gagal buat profil, hapus akun auth untuk rollback
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { error: 'Gagal membuat profil pengguna: ' + profileError.message }
  }

  return { success: true, profileId: userId }
}

export async function updatePengajarAuth(profileId: string, email?: string, password?: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Kunci konfigurasi SUPABASE_SERVICE_ROLE_KEY belum disetel di .env.local' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const updatePayload: any = {}
  if (email) updatePayload.email = email
  if (password) updatePayload.password = password
  if (email) updatePayload.email_confirm = true

  if (Object.keys(updatePayload).length > 0) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(profileId, updatePayload)
    if (authError) {
      return { error: 'Gagal memperbarui data login: ' + authError.message }
    }
  }

  if (email) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ email })
      .eq('id', profileId)

    if (profileError) {
      return { error: 'Gagal memperbarui email di profil: ' + profileError.message }
    }
  }

  return { success: true }
}
