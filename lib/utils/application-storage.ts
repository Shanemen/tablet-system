/**
 * Application Storage Utilities
 * 
 * Manages localStorage for the tablet application form
 * Provides a shopping cart experience where users can:
 * - Add multiple tablets of different types
 * - Save progress (persists across page refreshes)
 * - Remove individual tablets
 * - Clear cart after submission
 */

import { TabletTypeValue } from '@/lib/tablet-types-config'
import { convertToTraditional } from './chinese-converter-client'

// ============================================================================
// Type Definitions
// ============================================================================

export interface ApplicantInfo {
  name: string
  phone: string
  email: string
}

export interface TabletItem {
  id: string // Unique ID for this cart item
  tabletType: TabletTypeValue
  formData: Record<string, string> // Field values for this tablet
  previewUrl: string // Complete preview image URL (with all params)
  displayText: string // Text to show in lists (converted to traditional)
  addedAt: number // Timestamp when added
}

export interface ApplicationCart {
  applicantInfo: ApplicantInfo | null
  tablets: TabletItem[]
  ceremonySlug: string | null // Track which ceremony this is for
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'tablet_application_cart'
const STORAGE_VERSION = '1.0'

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get the current cart from localStorage
 */
export function getCart(): ApplicationCart {
  if (typeof window === 'undefined') {
    return getEmptyCart()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return getEmptyCart()
    }

    const parsed = JSON.parse(stored)
    
    // Version check (for future migrations)
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Cart version mismatch, resetting cart')
      return getEmptyCart()
    }

    return parsed.cart
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    return getEmptyCart()
  }
}

/**
 * Save the cart to localStorage
 */
function saveCart(cart: ApplicationCart): void {
  if (typeof window === 'undefined') return

  try {
    const toStore = {
      version: STORAGE_VERSION,
      cart,
      savedAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

/**
 * Get an empty cart
 */
function getEmptyCart(): ApplicationCart {
  return {
    applicantInfo: null,
    tablets: [],
    ceremonySlug: null,
  }
}

/**
 * Generate a unique ID for cart items
 */
function generateItemId(): string {
  return `tablet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// Cart Operations
// ============================================================================

/**
 * Save applicant information
 */
export function saveApplicantInfo(info: ApplicantInfo, ceremonySlug: string): void {
  const cart = getCart()
  cart.applicantInfo = info
  cart.ceremonySlug = ceremonySlug
  saveCart(cart)
}

/**
 * Get saved applicant information
 */
export function getApplicantInfo(): ApplicantInfo | null {
  return getCart().applicantInfo
}

/**
 * Add a tablet to the cart
 * Stores the complete preview URL to ensure consistency
 */
export function addTabletToCart(
  tabletType: TabletTypeValue,
  formData: Record<string, string>,
  previewUrl: string,
  displayText: string
): TabletItem {
  const cart = getCart()

  const newItem: TabletItem = {
    id: generateItemId(),
    tabletType,
    formData, // Store form data as-is
    previewUrl, // Store the exact preview URL user saw
    displayText, // Store the display text for lists
    addedAt: Date.now(),
  }

  cart.tablets.push(newItem)
  saveCart(cart)

  return newItem
}

/**
 * Get all tablets in the cart
 */
export function getCartTablets(): TabletItem[] {
  return getCart().tablets
}

/**
 * Get tablets grouped by type
 */
export function getCartTabletsByType(): Record<TabletTypeValue, TabletItem[]> {
  const tablets = getCartTablets()
  const grouped: Partial<Record<TabletTypeValue, TabletItem[]>> = {}

  tablets.forEach((tablet) => {
    if (!grouped[tablet.tabletType]) {
      grouped[tablet.tabletType] = []
    }
    grouped[tablet.tabletType]!.push(tablet)
  })

  return grouped as Record<TabletTypeValue, TabletItem[]>
}

/**
 * Get count of tablets by type
 */
export function getTabletCountByType(): Record<TabletTypeValue, number> {
  const tablets = getCartTablets()
  const counts: Partial<Record<TabletTypeValue, number>> = {}

  tablets.forEach((tablet) => {
    counts[tablet.tabletType] = (counts[tablet.tabletType] || 0) + 1
  })

  return counts as Record<TabletTypeValue, number>
}

/**
 * Get total number of tablets in cart
 */
export function getCartCount(): number {
  return getCartTablets().length
}

/**
 * Remove a tablet from the cart by ID
 */
export function removeTabletFromCart(tabletId: string): void {
  const cart = getCart()
  cart.tablets = cart.tablets.filter((t) => t.id !== tabletId)
  saveCart(cart)
}

/**
 * Clear all tablets from cart (keep applicant info)
 */
export function clearCartTablets(): void {
  const cart = getCart()
  cart.tablets = []
  saveCart(cart)
}

/**
 * Clear the entire cart (including applicant info)
 */
export function clearCart(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing cart:', error)
  }
}

/**
 * Check if cart is for a specific ceremony
 */
export function isCartForCeremony(ceremonySlug: string): boolean {
  const cart = getCart()
  return cart.ceremonySlug === ceremonySlug
}

/**
 * Check if cart has applicant info
 */
export function hasApplicantInfo(): boolean {
  const info = getApplicantInfo()
  return !!(info?.name && info?.phone && info?.email)
}

/**
 * Check if cart has any tablets
 */
export function hasTablets(): boolean {
  return getCartCount() > 0
}

/**
 * Validate cart is ready for submission
 */
export function isCartReadyForSubmission(): {
  ready: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!hasApplicantInfo()) {
    errors.push('請填寫申請人信息')
  }

  if (!hasTablets()) {
    errors.push('請至少添加一個牌位')
  }

  return {
    ready: errors.length === 0,
    errors,
  }
}

// ============================================================================
// Debug Helpers (for development)
// ============================================================================

/**
 * Get full cart for debugging
 */
export function debugGetFullCart(): ApplicationCart {
  return getCart()
}

/**
 * Log cart contents to console
 */
export function debugLogCart(): void {
  const cart = getCart()
  console.log('=== Application Cart ===')
  console.log('Ceremony:', cart.ceremonySlug)
  console.log('Applicant:', cart.applicantInfo)
  console.log('Tablets:', cart.tablets)
  console.log('Total tablets:', cart.tablets.length)
  console.log('=======================')
}

