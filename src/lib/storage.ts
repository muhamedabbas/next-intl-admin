'use client';

import type { Translation } from '../types';

export interface StorageAdapter {
  load(): Promise<Translation[]>;
  save(translations: Translation[]): Promise<void>;
  delete(id: string | number): Promise<void>;
  create(translation: Omit<Translation, 'id'>): Promise<Translation>;
  update(id: string | number, translation: Partial<Translation>): Promise<Translation>;
}

// Local Storage implementation
export class LocalStorageAdapter implements StorageAdapter {
  private key: string;

  constructor(key: string = 'next-intl-admin-translations') {
    this.key = key;
  }

  async load(): Promise<Translation[]> {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  async save(translations: Translation[]): Promise<void> {
    try {
      localStorage.setItem(this.key, JSON.stringify(translations));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  async delete(id: string | number): Promise<void> {
    const translations = await this.load();
    const filtered = translations.filter(t => t.id !== id);
    await this.save(filtered);
  }

  async create(translation: Omit<Translation, 'id'>): Promise<Translation> {
    const translations = await this.load();
    const newTranslation: Translation = {
      id: Date.now().toString(),
      ...translation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    translations.push(newTranslation);
    await this.save(translations);
    return newTranslation;
  }

  async update(id: string | number, updates: Partial<Translation>): Promise<Translation> {
    const translations = await this.load();
    const index = translations.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Translation not found');
    }

    translations[index] = {
      ...translations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.save(translations);
    return translations[index];
  }
}

// IndexedDB implementation for better performance with large datasets
export class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private storeName: string;
  private version: number;

  constructor(
    dbName: string = 'next-intl-admin',
    storeName: string = 'translations',
    version: number = 1
  ) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('key', 'key', { unique: true });
          store.createIndex('updatedAt', 'updatedAt');
        }
      };
    });
  }

  async load(): Promise<Translation[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    } catch (error) {
      console.error('Error loading from IndexedDB:', error);
      return [];
    }
  }

  async save(translations: Translation[]): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    // Clear existing data
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onerror = () => reject(clearRequest.error);
      clearRequest.onsuccess = () => resolve();
    });

    // Add new data
    for (const translation of translations) {
      await new Promise<void>((resolve, reject) => {
        const addRequest = store.add(translation);
        addRequest.onerror = () => reject(addRequest.error);
        addRequest.onsuccess = () => resolve();
      });
    }
  }

  async delete(id: string | number): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async create(translation: Omit<Translation, 'id'>): Promise<Translation> {
    const newTranslation: Translation = {
      id: Date.now().toString(),
      ...translation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.add(newTranslation);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(newTranslation);
    });
  }

  async update(id: string | number, updates: Partial<Translation>): Promise<Translation> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    // Get existing translation
    const existing = await new Promise<Translation>((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (!request.result) {
          reject(new Error('Translation not found'));
        } else {
          resolve(request.result);
        }
      };
    });

    const updated: Translation = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(updated);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(updated);
    });
  }
}

// Memory storage for testing or temporary use
export class MemoryStorageAdapter implements StorageAdapter {
  private translations: Translation[] = [];
  private idCounter = 1;

  async load(): Promise<Translation[]> {
    return [...this.translations];
  }

  async save(translations: Translation[]): Promise<void> {
    this.translations = [...translations];
  }

  async delete(id: string | number): Promise<void> {
    this.translations = this.translations.filter(t => t.id !== id);
  }

  async create(translation: Omit<Translation, 'id'>): Promise<Translation> {
    const newTranslation: Translation = {
      id: this.idCounter++,
      ...translation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.translations.push(newTranslation);
    return newTranslation;
  }

  async update(id: string | number, updates: Partial<Translation>): Promise<Translation> {
    const index = this.translations.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error('Translation not found');
    }

    this.translations[index] = {
      ...this.translations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.translations[index];
  }
}
