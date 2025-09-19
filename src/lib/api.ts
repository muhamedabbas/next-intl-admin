import type { Translation, PaginatedResponse } from '../types';

export class TranslationAPI {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string, headers: Record<string, string> = {}) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.headers = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Get paginated translations
  async getTranslations(params: {
    page?: number;
    pageSize?: number;
    search?: string;
  } = {}): Promise<PaginatedResponse<Translation>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.pageSize) searchParams.set('page_size', params.pageSize.toString());
    if (params.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    const endpoint = query ? `/?${query}` : '/';
    
    return this.request<PaginatedResponse<Translation>>(endpoint);
  }

  // Get single translation by ID
  async getTranslation(id: string | number): Promise<Translation> {
    return this.request<Translation>(`/${id}`);
  }

  // Create new translation
  async createTranslation(translation: Omit<Translation, 'id'>): Promise<Translation> {
    return this.request<Translation>('/', {
      method: 'POST',
      body: JSON.stringify(translation)
    });
  }

  // Update existing translation
  async updateTranslation(
    id: string | number,
    translation: Partial<Translation>
  ): Promise<Translation> {
    return this.request<Translation>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(translation)
    });
  }

  // Delete translation
  async deleteTranslation(id: string | number): Promise<void> {
    await this.request(`/${id}`, {
      method: 'DELETE'
    });
  }

  // Bulk delete translations
  async bulkDeleteTranslations(ids: (string | number)[]): Promise<void> {
    await this.request('/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
  }

  // Import translations
  async importTranslations(translations: Translation[]): Promise<{
    imported: number;
    updated: number;
    errors: string[];
  }> {
    return this.request('/import', {
      method: 'POST',
      body: JSON.stringify({ translations })
    });
  }

  // Export translations
  async exportTranslations(format: string = 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export?format=${format}`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Search translations
  async searchTranslations(query: string): Promise<Translation[]> {
    const response = await this.getTranslations({ search: query });
    return response.results;
  }

  // Get translation statistics
  async getStatistics(): Promise<{
    totalKeys: number;
    translatedKeys: Record<string, number>;
    completionPercentage: Record<string, number>;
    missingTranslations: Record<string, string[]>;
  }> {
    return this.request('/statistics');
  }
}
