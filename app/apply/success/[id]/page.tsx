import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageLayout } from '@/components/admin/PageLayout'
import { Card } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { getTabletTypeLabel, TabletTypeValue } from '@/lib/tablet-types-config'

// Map tablet types to Chinese labels (for backward compatibility)
const TABLET_TYPE_LABELS: Record<string, string> = {
  'longevity': '長生祿位',
  'deceased': '往生蓮位',
  'ancestors': '歷代祖先',
  'karmic-creditors': '冤親債主',
  'aborted-spirits': '嬰靈排位',
  'land-deity': '地基主',
  // Legacy naming support
  'karmic_creditors': '冤親債主',
  'aborted_spirits': '嬰靈排位',
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
  
  // Group names by tablet type for display
  const namesByType: Record<string, any[]> = {}
  names.forEach((nameEntry: any) => {
    const tabletType = nameEntry.tablet_type || application.tablet_type
    if (!namesByType[tabletType]) {
      namesByType[tabletType] = []
    }
    namesByType[tabletType].push(nameEntry)
  })

  return (
    <PageLayout narrow>
      <Card className="p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-primary">申請已成功提交</h1>
          <p className="text-muted-foreground">
            感謝您的發心
          </p>
          <div className="text-lg font-semibold text-foreground">
            總計：{names.length} 位
          </div>
        </div>

        {/* Tablet Names List Grouped by Type */}
        {Object.entries(namesByType).map(([tabletType, typeNames]) => {
          const typeLabel = TABLET_TYPE_LABELS[tabletType] || getTabletTypeLabel(tabletType as TabletTypeValue) || '牌位'
          
          return (
            <div key={tabletType} className="space-y-3">
              <h2 className="text-xl font-bold text-primary border-b pb-2">
                {typeLabel} ({typeNames.length} 位)
              </h2>
              
              <div className="space-y-2">
                {typeNames.map((nameEntry: any, index: number) => (
                  <div key={nameEntry.id} className="flex items-baseline gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="text-base text-muted-foreground">{index + 1}.</span>
                    <span className="text-lg font-medium text-foreground">{nameEntry.display_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </Card>
    </PageLayout>
  )
}

