import { Sidebar } from '@/components/admin/Sidebar'
import { createClient } from '@/lib/supabase/server'

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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userEmail={user.email || 'Admin'} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

