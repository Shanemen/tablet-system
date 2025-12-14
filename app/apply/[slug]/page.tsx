/**
 * Tablet Application Form - Multi-Step Single Page Application
 * 
 * User Journey:
 * Step 1: Applicant Information (name, phone)
 * Step 2: Select Tablet Type
 * Step 3: Fill Form & Preview (dynamic based on tablet type)
 * Step 4: Cart Review & Submit
 * 
 * Features:
 * - Shopping cart model: users can add multiple tablets of different types
 * - localStorage persistence: data saved automatically
 * - Elder-friendly UI: large text, buttons, and touch targets
 * - Single page: no URL changes, smooth transitions
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { PageLayout } from '@/components/admin/PageLayout'
import { getCeremonyBySlug, Ceremony } from '@/app/admin/ceremonies/actions'
import { submitMultiTypeApplication } from './actions'

// Step Components
import { ApplicantInfoStep } from '@/components/apply/ApplicantInfoStep'
import { ApplicationDetailsPage } from '@/components/apply/ApplicationDetailsPage'
import { TabletFormStep } from '@/components/apply/TabletFormStep'
import { PreviewConfirmStep } from '@/components/apply/PreviewConfirmStep'
import { CeremonyHeader } from '@/components/apply/CeremonyHeader'
import { TempleBanner } from '@/components/apply/TempleBanner'

// Utils
import {
  clearCart,
  isCartForCeremony,
  hasApplicantInfo,
  getCartCount,
  getApplicantInfo,
  getCartTablets,
} from '@/lib/utils/application-storage'
import { TabletTypeValue } from '@/lib/tablet-types-config'

type Step = 'applicant-info' | 'application-details' | 'fill-form' | 'preview-confirm'

export default function ApplicationFormPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params.slug
  
  const [ceremony, setCeremony] = useState<Ceremony | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<Step>('applicant-info')
  const [selectedTabletType, setSelectedTabletType] = useState<TabletTypeValue | null>(null)
  
  // Ceremony info visibility state
  // First page: expanded by default, other pages: collapsed by default
  const [showCeremonyInfo, setShowCeremonyInfo] = useState(true)
  
  // Message state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  useEffect(() => {
    loadCeremony()
  }, [slug])
  
  useEffect(() => {
    if (ceremony) {
      const deadline = new Date(ceremony.deadline_at)
      const now = new Date()
      setIsDeadlinePassed(now > deadline)

      // Check if cart is for this ceremony, if not, clear it
      if (!isCartForCeremony(slug)) {
        clearCart()
      }

      // If applicant info already saved, skip to application details
      if (hasApplicantInfo() && currentStep === 'applicant-info') {
        setCurrentStep('application-details')
      }
    }
  }, [ceremony, slug])

  // Reset ceremony info visibility when step changes
  // First page: expanded, other pages: collapsed
  useEffect(() => {
    setShowCeremonyInfo(currentStep === 'applicant-info')
  }, [currentStep])
  
  const loadCeremony = async () => {
    setLoading(true)
    const data = await getCeremonyBySlug(slug)
    setCeremony(data)
    setLoading(false)
  }
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  // Step Navigation Handlers
  const handleApplicantInfoNext = () => {
    setCurrentStep('application-details')
  }
  
  const handleEditApplicant = () => {
    setCurrentStep('applicant-info')
  }
  
  const handleAddTablet = (type: TabletTypeValue) => {
    setSelectedTabletType(type)
    setCurrentStep('fill-form')
  }
  
  const handleBackToMenu = () => {
    setSelectedTabletType(null)
    setCurrentStep('application-details')
  }

  const handleGoBack = () => {
    setCurrentStep('applicant-info')
  }

  const handlePreview = () => {
    setCurrentStep('preview-confirm')
  }

  const handleBackFromPreview = () => {
    setCurrentStep('application-details')
  }
  
  const handleConfirmSubmit = async () => {
    if (!ceremony) return
    
    // Read data from localStorage on client
    const applicantInfo = getApplicantInfo()
    const tablets = getCartTablets()
    
    // Submit to server with data
    try {
      const result = await submitMultiTypeApplication(
        ceremony.id, 
        slug,
        applicantInfo,
        tablets
      )
    
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
        setCurrentStep('application-details')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // Clear cart and redirect to success page
        clearCart()
        router.push(`/apply/success/${result.applicationId}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      setMessage({ type: 'error', text: '提交失敗，請稍後再試' })
      setCurrentStep('application-details')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">
          <Loader2 className="h-6 w-6 animate-spin" />
          載入中...
        </div>
      </div>
    )
  }
  
  // Ceremony not found
  if (!ceremony) {
    return (
      <PageLayout narrow>
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">找不到此法會申請表單。</p>
        </Card>
      </PageLayout>
    )
  }
  
  // Deadline passed
  if (isDeadlinePassed) {
  return (
    <PageLayout narrow>
      {/* Ceremony Header */}
      <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
          {ceremony.name_zh}
        </h1>
      </Card>
      
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="text-center">
            <p className="text-xl font-bold text-red-700 mb-2">申請已截止</p>
            <p className="text-base text-red-600">
              本次法會的牌位申請已於 {formatDateTime(ceremony.deadline_at)} 截止。
            </p>
            <p className="text-sm text-red-600 mt-2">感恩您的參與。</p>
          </div>
        </Card>
      </PageLayout>
    )
  }

  // Toggle ceremony info visibility
  const handleCeremonyToggle = () => {
    setShowCeremonyInfo(!showCeremonyInfo)
  }

  // Main Application Form
  return (
    <>
      {/* Temple Banner - Fixed at top with ceremony toggle */}
      <TempleBanner 
        temple={ceremony?.temple}
        showCeremonyToggle={true}
        isCeremonyExpanded={showCeremonyInfo}
        onCeremonyToggle={handleCeremonyToggle}
      />
      
      <PageLayout narrow>
        {/* Ceremony Header - Collapsible, shown based on showCeremonyInfo state */}
        {showCeremonyInfo && (
          <CeremonyHeader ceremony={ceremony} variant="full" />
        )}

      {/* Error/Success Message */}
          {message && (
        <Card
          className={`p-6 mb-6 ${
              message.type === 'error' 
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <p
            className={`text-lg font-medium ${
              message.type === 'error' ? 'text-red-700' : 'text-green-700'
            }`}
          >
            {message.text}
          </p>
        </Card>
      )}

      {/* Step Content - Single page with conditional rendering */}
      {currentStep === 'applicant-info' && (
        <ApplicantInfoStep ceremonySlug={slug} onNext={handleApplicantInfoNext} />
      )}

      {currentStep === 'application-details' && (
        <ApplicationDetailsPage
          onBack={handleGoBack}
          onEditApplicant={handleEditApplicant}
          onAddTablet={handleAddTablet}
          onPreview={handlePreview}
        />
      )}

      {currentStep === 'preview-confirm' && (
        <PreviewConfirmStep
          onBack={handleBackFromPreview}
          onConfirm={handleConfirmSubmit}
        />
      )}

      {currentStep === 'fill-form' && selectedTabletType && (
        <TabletFormStep
          tabletType={selectedTabletType}
          onBackToMenu={handleBackToMenu}
          imageStyle={ceremony?.temple?.image_style || 'bw'}
        />
      )}
    </PageLayout>
    </>
  )
}
