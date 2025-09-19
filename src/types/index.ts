import { ReactNode } from 'react';

// Core Translation Types
export interface Translation {
  id?: number | string;
  key: string;
  translations: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  metadata?: {
    context?: string;
    description?: string;
    tags?: string[];
  };
}

// Tree Structure Types
export interface TreeNode {
  [key: string]: TreeNode | Translation;
}

// API Response Types
export interface APIResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = Translation> {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

// Component Props Types
export interface TranslationManagerProps {
  apiEndpoint: string;
  supportedLocales: string[];
  defaultLocale?: string;
  enableRTL?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  enableBatchOperations?: boolean;
  pageSize?: number;
  permissions?: Permissions;
  theme?: Theme;
  className?: string;
  customStyles?: CustomStyles;
  components?: ComponentOverrides;
  validation?: ValidationRules;
  apiHeaders?: Record<string, string>;
  onTranslationChange?: (translations: Translation[]) => void;
  onError?: (error: Error) => void;
  realTimeUpdates?: RealTimeConfig;
  lazy?: boolean;
}

export interface TranslationTableProps {
  translations: Translation[];
  supportedLocales: string[];
  loading?: boolean;
  onEdit?: (translation: Translation) => void;
  onDelete?: (id: string | number) => void;
  onBulkDelete?: (ids: (string | number)[]) => void;
  permissions?: Permissions;
  enableSelection?: boolean;
  selectedItems?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  customStyles?: CustomStyles;
  enableRTL?: boolean;
}

export interface TranslationFormProps {
  translation?: Translation;
  supportedLocales: string[];
  onSubmit: (translation: Translation) => void;
  onCancel: () => void;
  loading?: boolean;
  validation?: ValidationRules;
  mode: 'create' | 'edit';
  enableRTL?: boolean;
  customStyles?: CustomStyles;
}

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  enableRTL?: boolean;
  onClear?: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  enableRTL?: boolean;
}

export interface ImportExportProps {
  onImport: (data: Translation[]) => void;
  onExport: () => void;
  supportedFormats?: string[];
  loading?: boolean;
  permissions?: Pick<Permissions, 'canImport' | 'canExport'>;
  className?: string;
}

export interface TreeViewProps {
  translations: Translation[];
  onEdit?: (translation: Translation) => void;
  onDelete?: (id: string | number) => void;
  onAdd?: (parentKey?: string) => void;
  expanded?: string[];
  onToggleExpand?: (key: string) => void;
  enableRTL?: boolean;
  customStyles?: CustomStyles;
}

// Configuration Types
export interface Theme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  foreground: string;
  border: string;
}

export interface Permissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canImport: boolean;
  canBulkEdit?: boolean;
  canBulkDelete?: boolean;
}

export interface ValidationRules {
  keyPattern?: RegExp;
  maxKeyLength?: number;
  minKeyLength?: number;
  requiredLocales?: string[];
  customValidation?: (translation: Translation) => string | null;
  preventDuplicateKeys?: boolean;
}

export interface CustomStyles {
  container?: string;
  header?: string;
  searchBox?: string;
  button?: string;
  table?: string;
  tableHeader?: string;
  tableRow?: string;
  tableCell?: string;
  form?: string;
  input?: string;
  textarea?: string;
  pagination?: string;
  modal?: string;
  sidebar?: string;
}

export interface ComponentOverrides {
  SearchBox?: React.ComponentType<SearchBoxProps>;
  PaginationControls?: React.ComponentType<PaginationProps>;
  LoadingSpinner?: React.ComponentType<{ size?: 'sm' | 'md' | 'lg' }>;
  ErrorMessage?: React.ComponentType<{ message: string; onRetry?: () => void }>;
  ConfirmDialog?: React.ComponentType<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>;
}

export interface RealTimeConfig {
  enabled: boolean;
  websocketUrl?: string;
  reconnectInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onUpdate?: (translation: Translation) => void;
}

// Hook Types
export interface UseTranslationManagerOptions {
  apiEndpoint: string;
  pageSize?: number;
  apiHeaders?: Record<string, string>;
  onError?: (error: Error) => void;
}

export interface UseTranslationManagerReturn {
  translations: Translation[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  createTranslation: (translation: Omit<Translation, 'id'>) => Promise<Translation>;
  updateTranslation: (id: string | number, translation: Partial<Translation>) => Promise<Translation>;
  deleteTranslation: (id: string | number) => Promise<void>;
  bulkDeleteTranslations: (ids: (string | number)[]) => Promise<void>;
  importTranslations: (translations: Translation[]) => Promise<void>;
  exportTranslations: (format?: string) => Promise<Blob>;
  refresh: () => Promise<void>;
}

// Storage Types
export interface StorageAdapter {
  load(): Promise<Translation[]>;
  save(translations: Translation[]): Promise<void>;
  delete(id: string | number): Promise<void>;
  create(translation: Omit<Translation, 'id'>): Promise<Translation>;
  update(id: string | number, translation: Partial<Translation>): Promise<Translation>;
}

// Utility Types
export type TranslationKey = string;
export type LocaleCode = string;
export type TranslationValue = string;

export interface FlatTranslation {
  key: TranslationKey;
  value: TranslationValue;
  locale: LocaleCode;
}

export interface TranslationStats {
  totalKeys: number;
  translatedKeys: Record<LocaleCode, number>;
  completionPercentage: Record<LocaleCode, number>;
  missingTranslations: Record<LocaleCode, TranslationKey[]>;
}

// Import/Export Types
export interface ImportResult {
  imported: number;
  updated: number;
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  locales?: LocaleCode[];
  includeMetadata?: boolean;
  flattenKeys?: boolean;
}

// Error Types
export class TranslationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TranslationError';
  }
}

export class ValidationError extends TranslationError {
  constructor(message: string, public field: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class APIError extends TranslationError {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message, 'API_ERROR', response);
    this.name = 'APIError';
  }
}

// Event Types
export interface TranslationEvent {
  type: 'create' | 'update' | 'delete' | 'bulk_delete' | 'import';
  translation?: Translation;
  translations?: Translation[];
  ids?: (string | number)[];
  timestamp: string;
  userId?: string;
}

// Filter Types
export interface TranslationFilter {
  search?: string;
  locales?: LocaleCode[];
  hasTranslation?: LocaleCode[];
  missingTranslation?: LocaleCode[];
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

// Sort Types
export interface SortOptions {
  field: 'key' | 'createdAt' | 'updatedAt' | LocaleCode;
  order: 'asc' | 'desc';
}
