'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/admin/PageLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { FormField } from '@/components/admin/FormField'
import { PasswordConfirmDialog } from '@/components/admin/PasswordConfirmDialog'
import { NotificationDialog } from '@/components/admin/NotificationDialog'
import { getCurrentCeremony, updateCeremony, createCeremony, verifyPasswordAndDelete, Ceremony } from './actions'
import { Loader2, Edit2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function CeremoniesPage() {
  const [ceremony, setCeremony] = useState<Ceremony | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [fullUrl, setFullUrl] = useState<string>('')
  const [hasChanges, setHasChanges] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false) // Flag to prevent re-loading after delete
  const [showDonation, setShowDonation] = useState(false) // Track donation toggle state
  const [showCopyNotification, setShowCopyNotification] = useState(false) // Copy URL notification

  useEffect(() => {
    if (!isDeleted) {
      loadCeremony()
    }
  }, [isDeleted])

  useEffect(() => {
    // Set full URL once ceremony is loaded (client-side only)
    if (typeof window !== 'undefined' && ceremony?.slug) {
      // Use environment variable if available, otherwise use current origin
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      setFullUrl(`${baseUrl}/apply/${ceremony.slug}`)
    }
  }, [ceremony?.slug])

  const loadCeremony = async () => {
    setLoading(true)
    const data = await getCurrentCeremony()
    setCeremony(data)
    setShowDonation(data?.show_donation || false) // Initialize donation toggle state
    setHasChanges(false) // Reset changes flag when loading
    setIsEditing(!data) // Auto-enable editing for new ceremony
    setLoading(false)
  }

  const handleFormChange = () => {
    if (ceremony) {
      setHasChanges(true)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowDonation(ceremony?.show_donation || false) // Reset donation state when entering edit mode
    setMessage(null)
  }

  const handleCancel = async () => {
    if (!ceremony) return
    
    // Reload ceremony data to discard changes
    await loadCeremony()
    setIsEditing(false)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    setSaving(true)
    setMessage(null)
    
    const formData = new FormData(e.currentTarget)
    
    if (!ceremony) {
      // Create new ceremony
      const result = await createCeremony(formData)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: result.success || '法會已創建！' })
        await loadCeremony()
        setIsEditing(false)
      }
    } else {
      // Update existing ceremony
      const result = await updateCeremony(ceremony.id, formData)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: result.success || '法會信息已成功更新！' })
        setHasChanges(false) // Reset changes flag after successful save
        await loadCeremony()
        setIsEditing(false)
      }
    }
    
    setSaving(false)
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async (password: string) => {
    if (!ceremony) return
    
    setSaving(true)
    setMessage(null)
    
    const result = await verifyPasswordAndDelete(ceremony.id, password)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      setSaving(false)
      setShowDeleteDialog(false)
    } else {
      // Set flag to prevent re-loading
      setIsDeleted(true)
      // Clear ceremony state to show empty STARTING STATE
      setCeremony(null)
      setMessage({ type: 'success', text: result.success || '表格已刪除！' })
      setSaving(false)
      setShowDeleteDialog(false)
      setIsEditing(true) // Show create form after deletion
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

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

  // Format date for display (read-only view)
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <PageLayout narrow>
      <PageHeader 
        title="表格編輯" 
        subtitle={ceremony ? "編輯申請表上的法會詳情" : "創建新的法會牌位申請表"} 
      />

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-lg ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      <Card className="p-6">
        {/* Read-only view when ceremony exists and not editing */}
        {ceremony && !isEditing ? (
          <div className="space-y-6">
            {/* Display ceremony details */}
            <div className="space-y-4">
              <div>
                <label className="form-label">法會名稱</label>
                <p className="text-lg text-foreground mt-1">{ceremony.name_zh}</p>
              </div>

              {ceremony.presiding_monk && (
                <div>
                  <label className="form-label">主法和尚</label>
                  <p className="text-lg text-foreground mt-1">{ceremony.presiding_monk}</p>
                </div>
              )}

              <div>
                <label className="form-label">法會日期和時間</label>
                <p className="text-lg text-foreground mt-1">
                  {formatDateTime(ceremony.start_at)} — {formatDateTime(ceremony.end_at)}
                </p>
              </div>

              <div>
                <label className="form-label">網上申請截止時間</label>
                <p className="text-lg text-foreground mt-1">{formatDateTime(ceremony.deadline_at)}</p>
              </div>

              {ceremony.location && (
                <div>
                  <label className="form-label">法會地點</label>
                  <p className="text-lg text-foreground mt-1">{ceremony.location}</p>
                </div>
              )}

              {/* Donation Settings */}
              <div>
                <label className="form-label">提交後顯示捐贈功能？</label>
                <p className="text-lg text-foreground mt-1">
                  {ceremony.show_donation ? 'Yes' : 'No'}
                </p>
                {ceremony.show_donation && ceremony.donation_url && (
                  <div className="mt-2">
                    <label className="form-label text-sm">捐贈頁面 URL</label>
                    <p className="text-base text-foreground mt-1 break-all">{ceremony.donation_url}</p>
                  </div>
                )}
              </div>

              {/* Public URL and QR Code */}
              <div>
                <label className="form-label">信眾申請鏈接</label>
                
                {/* URL Copy Section */}
                <div className="mb-4 mt-2">
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      value={fullUrl || `/apply/${ceremony.slug}`}
                      readOnly
                      className="bg-primary/10 text-primary font-mono border-primary/20 h-9 py-2 text-base"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
                        const urlToCopy = fullUrl || `${baseUrl}/apply/${ceremony.slug}`
                        navigator.clipboard.writeText(urlToCopy)
                        setShowCopyNotification(true)
                      }}
                      className="btn-secondary-large whitespace-nowrap"
                    >
                      複製鏈接
                    </Button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex items-start gap-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex-shrink-0">
                    {fullUrl && (
                      <QRCodeSVG
                        value={fullUrl}
                        size={120}
                        level="H"
                        includeMargin={true}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-base text-primary mb-2">
                      <strong className="text-primary">二維碼分享</strong>
                    </p>
                    <p className="text-sm text-primary">
                      掃描二維碼即可訪問申請表單，方便信眾使用手機填寫
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons for Read-only View */}
            <div className="flex items-center justify-between pt-6">
              {/* Left: Delete button */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDeleteClick}
                  disabled={saving}
                  className="text-muted-foreground hover:text-red-600 hover:bg-red-50 underline underline-offset-4 text-base px-6 py-3 font-normal"
                >
                  刪除表格
                </Button>
              </div>

              {/* Right: Edit button */}
              <div>
                <Button
                  type="button"
                  onClick={handleEdit}
                  className="btn-primary-large"
                >
                  <Edit2 className="mr-2 h-5 w-5" />
                  編輯
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Edit form when creating new ceremony or editing existing one */
          <form key={ceremony?.id || 'new'} onSubmit={handleSubmit} onChange={handleFormChange} className="form-section">
            {/* Chinese Name */}
            <FormField label="法會名稱（中文 + 英文）" required htmlFor="name_zh">
              <Input
                id="name_zh"
                name="name_zh"
                type="text"
                required
                defaultValue={ceremony?.name_zh || ''}
                placeholder="例如：三時繫念法會 Amitabha Service"
                className="form-input"
              />
            </FormField>

            {/* Presiding Monk - NEW FIELD */}
            <FormField label="主法和尚" htmlFor="presiding_monk">
              <Input
                id="presiding_monk"
                name="presiding_monk"
                type="text"
                defaultValue={ceremony?.presiding_monk || ''}
                placeholder="例如：釋某某法師"
                className="form-input"
              />
            </FormField>

            {/* Ceremony Duration - MOVED BEFORE LOCATION */}
            <div>
              <label className="form-label">
                法會日期和時間<span className="text-red-500 ml-1">*</span>
                <span className="text-sm text-muted-foreground font-normal ml-2">
                  （點擊選擇或直接輸入，例如：2024/03/15 9:00 AM）
                </span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label htmlFor="start_at" className="sr-only">開始時間</label>
                  <Input
                    id="start_at"
                    name="start_at"
                    type="datetime-local"
                    required
                    defaultValue={ceremony?.start_at ? ceremony.start_at.slice(0, 16) : ''}
                    className="form-input"
                  />
                </div>
                <span className="text-lg text-muted-foreground font-medium">—</span>
                <div className="flex-1">
                  <label htmlFor="end_at" className="sr-only">結束時間</label>
                  <Input
                    id="end_at"
                    name="end_at"
                    type="datetime-local"
                    required
                    defaultValue={ceremony?.end_at ? ceremony.end_at.slice(0, 16) : ceremony?.start_at ? ceremony.start_at.slice(0, 16) : ''}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Deadline */}
            <FormField 
              label="網上申請截止時間" 
              required 
              htmlFor="deadline_at"
              helpText="超過此時間後，申請表單將自動關閉"
            >
              <Input
                id="deadline_at"
                name="deadline_at"
                type="datetime-local"
                required
                defaultValue={ceremony?.deadline_at ? ceremony.deadline_at.slice(0, 16) : ''}
                className="form-input"
              />
            </FormField>

            {/* Location - MOVED AFTER TIME FIELDS */}
            <FormField label="法會地點" required htmlFor="location">
              <Input
                id="location"
                name="location"
                type="text"
                required
                defaultValue={ceremony?.location || ''}
                placeholder="例如：123 Main Street, City, State, 10000"
                className="form-input"
              />
            </FormField>

            {/* Donation Settings - Inline layout */}
            <div>
              <div className="flex items-center gap-3">
                <span className="text-base text-muted-foreground whitespace-nowrap">
                  提交後顯示捐贈功能？
                </span>
                <select
                  id="show_donation"
                  name="show_donation"
                  value={showDonation ? 'true' : 'false'}
                  onChange={(e) => {
                    setShowDonation(e.target.value === 'true')
                    setHasChanges(true)
                  }}
                  className="border border-input rounded-md pl-3 pr-8 py-1.5 text-sm bg-background appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {/* Conditional URL input - only show when Yes is selected */}
              {showDonation && (
                <div className="mt-4">
                  <FormField 
                    label="捐贈頁面 URL" 
                    htmlFor="donation_url"
                    helpText="信眾點擊捐贈按鈕後將跳轉到此鏈接"
                  >
                    <Input
                      id="donation_url"
                      name="donation_url"
                      type="url"
                      defaultValue={ceremony?.donation_url || ''}
                      placeholder="https://example.com/donate"
                      className="form-input"
                    />
                  </FormField>
                </div>
              )}
            </div>

            {/* Public URL and QR Code - Show when ceremony exists */}
            {ceremony && (
              <div>
                <label className="form-label">
                  信眾申請鏈接
                </label>
                
                {/* URL Copy Section */}
                <div className="mb-4">
                  <div className="flex gap-3">
                    <Input
                      id="slug"
                      name="slug"
                      type="text"
                      value={fullUrl || `/apply/${ceremony.slug}`}
                      readOnly
                      className="bg-primary/10 text-primary font-mono border-primary/20 h-9 py-2 text-base"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
                        const urlToCopy = fullUrl || `${baseUrl}/apply/${ceremony.slug}`
                        navigator.clipboard.writeText(urlToCopy)
                        setShowCopyNotification(true)
                      }}
                      className="btn-secondary-large whitespace-nowrap"
                    >
                      複製鏈接
                    </Button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex items-start gap-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex-shrink-0">
                    {fullUrl && (
                      <QRCodeSVG
                        value={fullUrl}
                        size={120}
                        level="H"
                        includeMargin={true}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-base text-primary mb-2">
                      <strong className="text-primary">二維碼分享</strong>
                    </p>
                    <p className="text-sm text-primary">
                      掃描二維碼即可訪問申請表單，方便信眾使用手機填寫
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6">
              {/* Left: Delete button (only show when editing existing ceremony) */}
              <div>
                {ceremony && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDeleteClick}
                    disabled={saving}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50 underline underline-offset-4 text-base px-6 py-3 font-normal"
                  >
                    刪除表格
                  </Button>
                )}
              </div>

              {/* Right: Cancel and Save buttons */}
              <div className="flex gap-4">
                {ceremony && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                    className="btn-secondary-large"
                  >
                    放棄修改
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saving || (!!ceremony && !hasChanges)}
                  className="btn-primary-large"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {ceremony ? '保存中...' : '創建中...'}
                    </>
                  ) : ceremony ? (
                    '保存修改'
                  ) : (
                    '創建申請表格'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>

      {/* Password Confirm Dialog */}
      {showDeleteDialog && (
        <PasswordConfirmDialog
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={saving}
        />
      )}

      {/* Copy URL Notification Dialog */}
      {showCopyNotification && (
        <NotificationDialog
          message="鏈接已複製！"
          onClose={() => setShowCopyNotification(false)}
        />
      )}
    </PageLayout>
  )
}
