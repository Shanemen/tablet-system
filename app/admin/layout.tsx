import { Sidebar } from '@/components/admin/Sidebar'
import { createClient } from '@/lib/supabase/server'

// Fetch temple info for the current user
async function getTempleInfo(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  // Get user's temple assignment
  const { data: userTemple } = await supabase
    .from('admin_user_temple')
    .select('temple_id')
    .eq('user_id', userId)
    .single()

  if (!userTemple?.temple_id) {
    return null
  }

  // Get temple details
  const { data: temple } = await supabase
    .from('temples')
    .select('name_zh, logo_url')
    .eq('id', userTemple.temple_id)
    .single()

  return temple
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Get current user - middleware already protects these routes
  // So we can safely assume user exists here
  const { data: { user } } = await supabase.auth.getUser()
  
  // If no user (shouldn't happen due to middleware), just return children without sidebar
  if (!user) {
    return children
  }

  // Fetch temple info for the user
  const templeInfo = await getTempleInfo(supabase, user.id)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userEmail={user.email || 'Admin'} templeInfo={templeInfo} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

