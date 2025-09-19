import type { Theme, Permissions } from '../types';

// Default theme configuration
export const DEFAULT_THEME: Theme = {
  primary: 'blue',
  secondary: 'gray',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  background: 'white',
  foreground: 'gray-900',
  border: 'gray-200'
};

// Default permissions
export const DEFAULT_PERMISSIONS: Permissions = {
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canExport: true,
  canImport: true,
  canBulkEdit: true,
  canBulkDelete: true
};

// Supported export/import formats
export const SUPPORTED_FORMATS = ['json', 'csv', 'xlsx'] as const;

// Default page size options
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// RTL languages
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'ku', 'ps', 'sd'] as const;

// Common locale codes with their display names
export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
  he: 'עברית',
  fa: 'فارسی',
  ur: 'اردو',
  tr: 'Türkçe',
  nl: 'Nederlands',
  pl: 'Polski',
  sv: 'Svenska',
  da: 'Dansk',
  no: 'Norsk',
  fi: 'Suomi',
  cs: 'Čeština',
  sk: 'Slovenčina',
  hu: 'Magyar',
  ro: 'Română',
  bg: 'Български',
  hr: 'Hrvatski',
  sr: 'Српски',
  sl: 'Slovenščina',
  et: 'Eesti',
  lv: 'Latviešu',
  lt: 'Lietuvių',
  mt: 'Malti',
  ga: 'Gaeilge',
  cy: 'Cymraeg',
  eu: 'Euskera',
  ca: 'Català',
  gl: 'Galego',
  is: 'Íslenska',
  mk: 'Македонски',
  sq: 'Shqip',
  bs: 'Bosanski',
  me: 'Crnogorski',
  rs: 'Српски'
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  // Translation key pattern: alphanumeric with dots, underscores, and hyphens
  KEY_PATTERN: /^[a-zA-Z][a-zA-Z0-9._-]*$/,
  
  // Email pattern for notifications
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // URL pattern for API endpoints
  URL_PATTERN: /^https?:\/\/[^\s/$.?#].[^\s]*$/
} as const;

// Default validation rules
export const DEFAULT_VALIDATION = {
  keyPattern: VALIDATION_PATTERNS.KEY_PATTERN,
  maxKeyLength: 255,
  minKeyLength: 1,
  requiredLocales: ['en'],
  preventDuplicateKeys: true
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

// Debounce delays (in milliseconds)
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  SAVE: 1000,
  RESIZE: 100
} as const;

// API timeout (in milliseconds)
export const API_TIMEOUT = 30000;

// Maximum file size for imports (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Maximum number of translations to process in a single batch
export const MAX_BATCH_SIZE = 1000;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  NOT_FOUND_ERROR: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_FORMAT: 'Invalid file format. Please use JSON, CSV, or XLSX.',
  BATCH_TOO_LARGE: 'Too many translations to process at once. Maximum is 1000.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  TRANSLATION_CREATED: 'Translation created successfully.',
  TRANSLATION_UPDATED: 'Translation updated successfully.',
  TRANSLATION_DELETED: 'Translation deleted successfully.',
  TRANSLATIONS_IMPORTED: 'Translations imported successfully.',
  TRANSLATIONS_EXPORTED: 'Translations exported successfully.',
  BULK_DELETE_SUCCESS: 'Selected translations deleted successfully.'
} as const;

// Feature flags (can be overridden via props)
export const DEFAULT_FEATURES = {
  ENABLE_RTL: true,
  ENABLE_EXPORT: true,
  ENABLE_IMPORT: true,
  ENABLE_BATCH_OPERATIONS: false,
  ENABLE_REAL_TIME: false,
  ENABLE_SEARCH: true,
  ENABLE_PAGINATION: true,
  ENABLE_SORTING: true,
  ENABLE_FILTERING: false,
  ENABLE_TREE_VIEW: true,
  ENABLE_INLINE_EDITING: true,
  ENABLE_KEYBOARD_SHORTCUTS: false,
  ENABLE_DARK_MODE: false,
  ENABLE_NOTIFICATIONS: false
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  CREATE_NEW: 'ctrl+n',
  SAVE: 'ctrl+s',
  DELETE: 'delete',
  SEARCH: 'ctrl+f',
  EXPORT: 'ctrl+e',
  IMPORT: 'ctrl+i',
  REFRESH: 'f5',
  ESCAPE: 'escape'
} as const;

// CSS class prefixes for styling
export const CSS_PREFIXES = {
  COMPONENT: 'next-intl-admin',
  MANAGER: 'translation-manager',
  TABLE: 'translation-table',
  FORM: 'translation-form',
  SEARCH: 'translation-search',
  PAGINATION: 'translation-pagination',
  TREE: 'translation-tree'
} as const;
