/**
 * Step 2: Tablet Type Selection
 * 
 * Elder-friendly design:
 * - Large card buttons (min h-24)
 * - Entire card is clickable
 * - Strong visual feedback when selected
 * - Shows count of tablets already in cart
 */

'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react'
import { getTabletTypeOptions, TabletTypeValue } from '@/lib/tablet-types-config'
import { getTabletCountByType, getCartCount } from '@/lib/utils/application-storage'
import { useState, useEffect } from 'react'

interface TabletTypeSelectorProps {
  onSelectType: (type: TabletTypeValue) => void
  onBack: () => void
  onViewCart: () => void
}

export function TabletTypeSelector({
  onSelectType,
  onBack,
  onViewCart,
}: TabletTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<TabletTypeValue | null>(null)
  const [cartCounts, setCartCounts] = useState<Partial<Record<TabletTypeValue, number>>>({})
  const [totalCount, setTotalCount] = useState(0)

  const tabletTypes = getTabletTypeOptions()

  // Load cart counts on mount and update
  useEffect(() => {
    updateCartCounts()
  }, [])

  const updateCartCounts = () => {
    setCartCounts(getTabletCountByType())
    setTotalCount(getCartCount())
  }

  const handleSelectType = (type: TabletTypeValue) => {
    setSelectedType(type)
    // Small delay for visual feedback
    setTimeout(() => {
      onSelectType(type)
    }, 150)
  }

  return (
    <div className="space-y-8">
      {/* Title with cart indicator */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="form-step-title text-3xl font-bold text-foreground mb-2">
            選擇牌位類型
          </h2>
          <p className="text-lg text-muted-foreground">
            請選擇您要添加的牌位類型
          </p>
        </div>
        
        {/* Cart indicator */}
        {totalCount > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-lg font-semibold">{totalCount} 位</span>
          </div>
        )}
      </div>

      {/* Type Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tabletTypes.map((type) => {
          const count = cartCounts[type.value] || 0
          const isSelected = selectedType === type.value

          return (
            <button
              key={type.value}
              onClick={() => handleSelectType(type.value)}
              className={`
                relative p-6 rounded-lg border-2 text-left transition-all duration-200
                min-h-[120px] flex flex-col justify-between
                hover:scale-[1.02] active:scale-[0.98]
                ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
              aria-pressed={isSelected}
            >
              {/* Badge showing count if > 0 */}
              {count > 0 && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {count}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {type.label}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {type.description}
                </p>
              </div>

              {/* Indicator arrow */}
              <div className={`
                mt-3 flex items-center text-sm font-medium
                ${isSelected ? 'text-primary' : 'text-muted-foreground'}
              `}>
                <span>開始填寫</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="outline"
          className="h-14 text-lg font-semibold order-2 sm:order-1"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          返回
        </Button>

        {/* View Cart Button (only show if cart has items) */}
        {totalCount > 0 && (
          <Button
            onClick={onViewCart}
            className="btn-primary-elder flex-1 order-1 sm:order-2"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            查看清單並提交 ({totalCount} 位)
          </Button>
        )}
      </div>
    </div>
  )
}

