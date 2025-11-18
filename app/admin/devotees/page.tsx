import { Card } from '@/components/ui/card'
import { PageLayout } from '@/components/admin/PageLayout'
import { PageHeader } from '@/components/admin/PageHeader'

export default function DevoteesPage() {
  return (
    <PageLayout>
      <PageHeader 
        title="常随信众" 
        subtitle="管理经常参加法会的信众信息"
      />

      <Card className="p-8 text-center">
        <p className="text-muted-foreground text-lg">此功能即将上线...</p>
      </Card>
    </PageLayout>
  )
}

