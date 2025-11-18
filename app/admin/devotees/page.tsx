import { Card } from '@/components/ui/card'

export default function DevoteesPage() {
  return (
    <div className="min-h-screen bg-background p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">常随信众</h1>
          <p className="mt-2 text-base text-foreground/80">管理经常参加法会的信众信息</p>
        </div>

        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">此功能即将上线...</p>
        </Card>
      </div>
    </div>
  )
}

