// Main package exports
export { TranslationManager } from './components/TranslationManager';
export { StandaloneTranslationManager } from './components/StandaloneTranslationManager';
export { TranslationTable } from './components/TranslationTable';
export { TranslationForm } from './components/TranslationForm';
export { SearchBox } from './components/SearchBox';
export { PaginationControls } from './components/PaginationControls';
export { ImportExportControls } from './components/ImportExportControls';
export { TreeView } from './components/TreeView';

// Hooks
export { useTranslationManager } from './hooks/useTranslationManager';
export { useTranslationAPI } from './hooks/useTranslationAPI';
export { usePagination } from './hooks/usePagination';

// Types
export type {
  Translation,
  TranslationManagerProps,
  TranslationTableProps,
  TranslationFormProps,
  SearchBoxProps,
  PaginationProps,
  ImportExportProps,
  TreeViewProps,
  Theme,
  Permissions,
  ValidationRules,
  APIResponse,
  PaginatedResponse
} from './types';

// Utilities
export { translationUtils } from './lib/utils';
export { TranslationAPI } from './lib/api';
export { StandaloneAPI } from './lib/standalone-api';
export { FileManager } from './lib/file-manager';
export { LocalStorageAdapter, IndexedDBAdapter, MemoryStorageAdapter } from './lib/storage';
export { exportTranslations, importTranslations } from './lib/import-export';
export { buildTranslationTree, flattenTranslationTree } from './lib/tree-utils';

// Constants
export { DEFAULT_THEME, DEFAULT_PERMISSIONS, SUPPORTED_FORMATS } from './lib/constants';
