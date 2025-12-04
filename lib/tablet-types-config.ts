/**
 * Tablet Types Configuration System
 * 
 * This file defines the configuration for each tablet type, including:
 * - Display names and descriptions
 * - Form field configurations
 * - Validation rules
 * - Preview requirements
 * 
 * To add/modify fields for a tablet type, update the configuration below.
 * No code changes needed elsewhere!
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type TabletTypeValue =
  | 'longevity'
  | 'deceased'
  | 'ancestors'
  | 'karmic-creditors'
  | 'aborted-spirits'
  | 'land-deity'

export type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'checkbox'

export interface FormField {
  name: string
  label: string
  type: FieldType
  required: boolean
  placeholder?: string
  helpText?: string
  maxLength?: number
  options?: { value: string; label: string }[] // For select fields
  validation?: {
    pattern?: RegExp
    message?: string
  }
}

export interface TabletTypeConfig {
  value: TabletTypeValue
  label: string // Display name in Chinese
  description: string // Short description for selection
  detailedDescription?: string // Longer explanation (optional)
  fields: FormField[] // Form fields for this tablet type
  previewFields: string[] // Which field values to show in preview confirmation (honoree area)
  petitionerFields?: string[] // Which field values to show in petitioner/left area (optional)
}

// ============================================================================
// Tablet Types Configuration
// ============================================================================

export const TABLET_TYPES: TabletTypeConfig[] = [
  {
    value: 'longevity',
    label: '長生祿位',
    description: '為在世的人消災祈福',
    detailedDescription:
      '為在世的人消災祈福，可添加個人或闔家',
    fields: [
      {
        name: 'name',
        label: '祈福受益人姓名',
        type: 'text',
        required: true,
        placeholder: '例如：陳小華',
      },
      {
        name: 'is_family',
        label: '闔家',
        type: 'checkbox',
        required: false,
      },
    ],
    previewFields: ['name', 'is_family'],
  },
  {
    value: 'deceased',
    label: '往生蓮位',
    description: '超薦一年內去世的往生者',
    detailedDescription:
      '超薦去世一年內的往生者',
    fields: [
      {
        name: 'name',
        label: '往生者姓名',
        type: 'text',
        required: true,
        placeholder: '例如：王大明',
      },
      {
        name: 'deceased_title',
        label: '往生者稱謂/與申請人關係',
        type: 'text',
        required: true,
        placeholder: '例如：祖父，姑媽，蓮友',
      },
      {
        name: 'petitioner_name',
        label: '申請人姓名',
        type: 'text',
        required: true,
        placeholder: '例如：陳小華',
      },
      {
        name: 'petitioner_title',
        label: '申請人稱謂/與往生者關係',
        type: 'text',
        required: true,
        placeholder: '例如：孫子，姪女，蓮友',
      },
    ],
    previewFields: ['deceased_title', 'name'],
    petitionerFields: ['petitioner_title', 'petitioner_name'],
  },
  {
    value: 'ancestors',
    label: '歷代祖先',
    description: '超薦家族祖先，填上祖先姓氏',
    detailedDescription:
      '超薦家族祖先，填上祖先姓氏；申請人只需填寫一位家族代表即可。',
    fields: [
      {
        name: 'surname',
        label: '祖先姓氏',
        type: 'text',
        required: true,
        placeholder: '例如：陳',
        maxLength: 4,
      },
      {
        name: 'descendant_name',
        label: '後裔申請人姓名',
        type: 'text',
        required: true,
        placeholder: '例如：陳小華',
      },
    ],
    previewFields: ['surname'],
    petitionerFields: ['descendant_name'], // 左区显示後裔申請人姓名
  },
  {
    value: 'karmic-creditors',
    label: '冤親債主',
    description: '為在世個的人超薦累劫冤親債主',
    detailedDescription:
      '為在世個人超薦累劫的冤親債主，必須為個人，不可用闔家或公司',
    fields: [
      {
        name: 'name',
        label: '申請人姓名',
        type: 'text',
        required: true,
        placeholder: '例如：李美華',
        maxLength: 8,
        validation: {
          pattern: /^(?!.*闔家)(?!.*公司)(?!.*團體).+$/,
          message: '冤親債主牌位不可使用「闔家」、「公司」、「團體」等字眼',
        },
      },
    ],
    previewFields: ['name'],
    petitionerFields: ['name'], // 左区显示申請人姓名（阳上）
  },
  {
    value: 'aborted-spirits',
    label: '嬰靈排位',
    description: '超薦墮胎或夭折之胎兒',
    detailedDescription: '超薦墮胎或夭折之胎兒。有取名請寫「故兒○○○」。未取名者可寫「故兒妙音」或「李姓嬰孩菩薩」。若有多位，則註明數量，如「李姓二位嬰孩菩薩」',
    fields: [
      {
        name: 'name',
        label: '嬰靈名稱',
        type: 'text',
        required: true,
        placeholder: '例如：故兒妙音',
        maxLength: 8,
      },
      {
        name: 'father_name',
        label: '父親姓名',
        type: 'text',
        required: true,
        placeholder: '例如：陳大明',
      },
      {
        name: 'mother_name',
        label: '母親姓名',
        type: 'text',
        required: true,
        placeholder: '例如：李小華',
      },
    ],
    previewFields: ['name'],
    petitionerFields: ['father_name', 'mother_name'],
  },
  {
    value: 'land-deity',
    label: '地基主',
    description: '超薦家宅或公司的土地守護神，祈求平安',
    detailedDescription:
      '超薦家宅或公司的土地守護神，祈求平安。請填入詳細地址',
    fields: [
      {
        name: 'address',
        label: '地址',
        type: 'textarea',
        required: true,
        placeholder: '例如：台北市中正區羅斯福路四段1號',
        maxLength: 100,
      },
      {
        name: 'applicant_name',
        label: '申請人姓名',
        type: 'text',
        required: true,
        placeholder: '例如：陳小華',
      },
    ],
    previewFields: ['address'],
    petitionerFields: ['applicant_name'], // 左区显示申請人姓名
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get configuration for a specific tablet type
 */
export function getTabletTypeConfig(
  type: TabletTypeValue
): TabletTypeConfig | undefined {
  return TABLET_TYPES.find((t) => t.value === type)
}

/**
 * Get display label for a tablet type
 */
export function getTabletTypeLabel(type: TabletTypeValue): string {
  return getTabletTypeConfig(type)?.label || type
}

/**
 * Get all tablet type options for selection
 */
export function getTabletTypeOptions(): {
  value: TabletTypeValue
  label: string
  description: string
}[] {
  return TABLET_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
    description: t.description,
  }))
}

/**
 * Validate form data against tablet type configuration
 */
export function validateTabletFormData(
  type: TabletTypeValue,
  data: Record<string, string>
): { valid: boolean; errors: Record<string, string> } {
  const config = getTabletTypeConfig(type)
  if (!config) {
    return { valid: false, errors: { _form: '無效的牌位類型' } }
  }

  const errors: Record<string, string> = {}

  config.fields.forEach((field) => {
    const value = data[field.name]?.trim() || ''

    // Check required fields
    if (field.required && !value) {
      errors[field.name] = `${field.label}為必填項`
      return
    }

    if (!value) return // Skip validation for empty optional fields

    // Check max length
    if (field.maxLength && value.length > field.maxLength) {
      errors[field.name] = `${field.label}不能超過${field.maxLength}個字`
      return
    }

    // Check custom validation pattern
    if (field.validation?.pattern && !field.validation.pattern.test(value)) {
      errors[field.name] = field.validation.message || '格式不正確'
      return
    }
  })

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Get preview text for confirmation display (honoree area - center)
 */
export function getPreviewText(
  type: TabletTypeValue,
  data: Record<string, string>
): string {
  const config = getTabletTypeConfig(type)
  if (!config) return ''

  // Special handling for longevity with family option
  if (type === 'longevity') {
    const name = data['name'] || ''
    const isFamily = data['is_family'] === 'true' || data['is_family'] === '1'
    return isFamily ? `${name}闔家` : name
  }

  const previewParts = config.previewFields
    .map((fieldName) => data[fieldName])
    .filter(Boolean)

  return previewParts.join(' ')
}

/**
 * Get petitioner text for left panel display
 * For aborted-spirits: "父 [father_name] 母 [mother_name]"
 */
export function getPetitionerText(
  type: TabletTypeValue,
  data: Record<string, string>
): string {
  const config = getTabletTypeConfig(type)
  if (!config || !config.petitionerFields) return ''

  // Special formatting for aborted-spirits
  if (type === 'aborted-spirits') {
    const fatherName = data['father_name'] || ''
    const motherName = data['mother_name'] || ''
    
    if (!fatherName && !motherName) return ''
    
    const parts: string[] = []
    if (fatherName) parts.push(`父 ${fatherName}`)
    if (motherName) parts.push(`母 ${motherName}`)
    
    return parts.join(' ')
  }

  // Default: join all petitioner fields
  const petitionerParts = config.petitionerFields
    .map((fieldName) => data[fieldName])
    .filter(Boolean)

  return petitionerParts.join(' ')
}

