import type { Translation } from '../types';

export interface TreeNode {
  [key: string]: TreeNode | Translation;
}

/**
 * Build a tree structure from flat translations
 */
export function buildTranslationTree(translations: Translation[]): TreeNode {
  const tree: TreeNode = {};

  for (const translation of translations) {
    const keys = translation.key.split('.');
    let current: TreeNode = tree;

    // Navigate/create the path
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      
      // If the key doesn't exist or is a translation, create a new branch
      if (!current[key] || isTranslation(current[key])) {
        current[key] = {};
      }
      
      current = current[key] as TreeNode;
    }

    // Set the final translation
    const finalKey = keys[keys.length - 1];
    current[finalKey] = translation;
  }

  return tree;
}

/**
 * Flatten a tree structure back to translations array
 */
export function flattenTranslationTree(tree: TreeNode, prefix = ''): Translation[] {
  const translations: Translation[] = [];

  for (const [key, value] of Object.entries(tree)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (isTranslation(value)) {
      translations.push(value);
    } else {
      // Recursively flatten sub-trees
      translations.push(...flattenTranslationTree(value as TreeNode, fullKey));
    }
  }

  return translations;
}

/**
 * Get all keys at a specific level in the tree
 */
export function getKeysAtLevel(tree: TreeNode, level: number): string[] {
  if (level === 0) {
    return Object.keys(tree);
  }

  const keys: Set<string> = new Set();
  
  function traverse(node: TreeNode, currentLevel: number, prefix = '') {
    if (currentLevel === level) {
      Object.keys(node).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.add(fullKey);
      });
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (!isTranslation(value)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        traverse(value as TreeNode, currentLevel + 1, fullKey);
      }
    }
  }

  traverse(tree, 0);
  return Array.from(keys).sort();
}

/**
 * Get all leaf nodes (translations) under a specific key
 */
export function getTranslationsUnderKey(tree: TreeNode, keyPath: string): Translation[] {
  const keys = keyPath.split('.');
  let current: TreeNode | Translation = tree;

  // Navigate to the target node
  for (const key of keys) {
    if (isTranslation(current)) {
      return []; // Path leads to a translation, not a branch
    }
    
    current = (current as TreeNode)[key];
    if (!current) {
      return []; // Path doesn't exist
    }
  }

  // If we ended up at a translation, return it
  if (isTranslation(current)) {
    return [current];
  }

  // Otherwise, get all translations under this branch
  return flattenTranslationTree(current as TreeNode, keyPath);
}

/**
 * Count items in tree (both branches and leaves)
 */
export function countTreeItems(tree: TreeNode): { branches: number; leaves: number; total: number } {
  let branches = 0;
  let leaves = 0;

  function traverse(node: TreeNode) {
    for (const value of Object.values(node)) {
      if (isTranslation(value)) {
        leaves++;
      } else {
        branches++;
        traverse(value as TreeNode);
      }
    }
  }

  traverse(tree);

  return {
    branches,
    leaves,
    total: branches + leaves
  };
}

/**
 * Find all translations matching a search term
 */
export function searchInTree(tree: TreeNode, searchTerm: string): Translation[] {
  const results: Translation[] = [];
  const term = searchTerm.toLowerCase();

  function traverse(node: TreeNode) {
    for (const [key, value] of Object.entries(node)) {
      if (isTranslation(value)) {
        const translation = value as Translation;
        
        // Search in key
        if (translation.key.toLowerCase().includes(term)) {
          results.push(translation);
          continue;
        }

        // Search in translation values
        for (const translationValue of Object.values(translation.translations)) {
          if (translationValue.toLowerCase().includes(term)) {
            results.push(translation);
            break;
          }
        }
      } else {
        traverse(value as TreeNode);
      }
    }
  }

  traverse(tree);
  return results;
}

/**
 * Get the depth of the tree
 */
export function getTreeDepth(tree: TreeNode): number {
  let maxDepth = 0;

  function traverse(node: TreeNode, currentDepth: number) {
    maxDepth = Math.max(maxDepth, currentDepth);
    
    for (const value of Object.values(node)) {
      if (!isTranslation(value)) {
        traverse(value as TreeNode, currentDepth + 1);
      }
    }
  }

  traverse(tree, 0);
  return maxDepth;
}

/**
 * Get parent key path for a given key
 */
export function getParentKey(key: string): string | null {
  const parts = key.split('.');
  return parts.length > 1 ? parts.slice(0, -1).join('.') : null;
}

/**
 * Get child keys for a given parent key
 */
export function getChildKeys(tree: TreeNode, parentKey: string): string[] {
  const keys = parentKey.split('.');
  let current: TreeNode | Translation = tree;

  // Navigate to the parent node
  for (const key of keys) {
    if (isTranslation(current)) {
      return []; // Parent is a translation, no children
    }
    
    current = (current as TreeNode)[key];
    if (!current) {
      return []; // Parent doesn't exist
    }
  }

  if (isTranslation(current)) {
    return []; // Parent is a translation
  }

  // Return direct children keys
  return Object.keys(current as TreeNode).map(key => 
    parentKey ? `${parentKey}.${key}` : key
  );
}

/**
 * Check if a node exists in the tree
 */
export function nodeExists(tree: TreeNode, keyPath: string): boolean {
  const keys = keyPath.split('.');
  let current: TreeNode | Translation = tree;

  for (const key of keys) {
    if (isTranslation(current)) {
      return false; // Path continues beyond a translation
    }
    
    current = (current as TreeNode)[key];
    if (!current) {
      return false; // Path doesn't exist
    }
  }

  return true;
}

/**
 * Remove a node from the tree
 */
export function removeFromTree(tree: TreeNode, keyPath: string): TreeNode {
  const keys = keyPath.split('.');
  const newTree = JSON.parse(JSON.stringify(tree)); // Deep clone
  
  if (keys.length === 1) {
    delete newTree[keys[0]];
    return newTree;
  }

  let current: TreeNode = newTree;
  
  // Navigate to parent
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (isTranslation(current[key])) {
      return newTree; // Can't navigate further
    }
    current = current[key] as TreeNode;
  }

  // Remove the target
  delete current[keys[keys.length - 1]];
  
  return newTree;
}

/**
 * Add a translation to the tree
 */
export function addToTree(tree: TreeNode, translation: Translation): TreeNode {
  const newTree = JSON.parse(JSON.stringify(tree)); // Deep clone
  const keys = translation.key.split('.');
  let current: TreeNode = newTree;

  // Navigate/create the path
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    if (!current[key] || isTranslation(current[key])) {
      current[key] = {};
    }
    
    current = current[key] as TreeNode;
  }

  // Add the translation
  current[keys[keys.length - 1]] = translation;
  
  return newTree;
}

/**
 * Type guard to check if a value is a Translation
 */
function isTranslation(value: any): value is Translation {
  return value && typeof value === 'object' && 'key' in value && 'translations' in value;
}
