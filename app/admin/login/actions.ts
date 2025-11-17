'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extract form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate input
  if (!email || !password) {
    return { error: '请输入邮箱和密码' }
  }

  // Attempt to sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: '登录失败：邮箱或密码错误' }
  }

  // Revalidate cache and redirect
  revalidatePath('/admin/dashboard', 'layout')
  redirect('/admin/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Extract form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate input
  if (!email || !password) {
    return { error: '请输入邮箱和密码' }
  }

  if (password.length < 6) {
    return { error: '密码至少需要 6 个字符' }
  }

  // Attempt to sign up
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: `注册失败：${error.message}` }
  }

  return { success: true, message: '注册成功！请检查您的邮箱以验证账号。' }
}

export async function logout() {
  const supabase = await createClient()
  
  await supabase.auth.signOut()
  
  revalidatePath('/admin/login', 'layout')
  redirect('/admin/login')
}

