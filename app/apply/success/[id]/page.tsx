import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageLayout } from '@/components/admin/PageLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Download } from 'lucide-react'

// Map plaque types to Chinese labels
const PLAQUE_TYPE_LABELS: Record<string, string> = {
  'longevity': '長生祿位',
  'deceased': '往生蓮位',
  'ancestors': '歷代祖先',
  'karmic_creditors': '冤親債主',
  'aborted_spirits': '墮胎嬰靈',
  'land_deity': '地基主',
}

export default async function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch application with names
  const { data: application } = await supabase
    .from('application')
    .select(`
      *,
      ceremony:ceremony_id (slug),
      application_name (*)
    `)
    .eq('id', id)
    .single()

  if (!application) {
    notFound()
  }

  const names = application.application_name || []
  const plaqueLabel = PLAQUE_TYPE_LABELS[application.plaque_type] || '牌位'
  
  // Back link logic
  const backLink = application.ceremony?.slug ? `/apply/${application.ceremony.slug}` : '/'

  return (
    <PageLayout narrow>
      <Card className="p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-primary">申請已成功提交</h1>
          <p className="text-muted-foreground">
            感謝您的發心。以下是系統生成的牌位預覽：
          </p>
        </div>

        {/* Preview Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          {names.map((nameEntry: any) => {
            const imageUrl = `/api/og/tablet?name=${encodeURIComponent(nameEntry.display_name)}&type=${encodeURIComponent(plaqueLabel)}`
            
            return (
              <div key={nameEntry.id} className="space-y-3 flex flex-col items-center">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md border border-gray-200 transition-transform hover:scale-105">
                  <img 
                    src={imageUrl} 
                    alt={`Tablet for ${nameEntry.display_name}`} 
                    className="h-[400px] w-auto object-contain"
                  />
                </div>
                <p className="font-medium text-lg">{nameEntry.display_name}</p>
              </div>
            )
          })}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Link href={backLink}>
            <Button variant="outline" className="btn-secondary-large">
              返回表單
            </Button>
          </Link>
          <Button className="btn-primary-large">
            <Download className="mr-2 h-4 w-4" />
            保存圖片
          </Button>
        </div>
      </Card>
    </PageLayout>
  )
}

