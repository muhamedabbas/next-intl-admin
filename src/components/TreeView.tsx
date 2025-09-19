'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import clsx from 'clsx';
import type { TreeViewProps, Translation } from '../types';

interface TreeNode {
  [key: string]: TreeNode | Translation;
}

export const TreeView: React.FC<TreeViewProps> = ({
  translations,
  onEdit,
  onDelete,
  onAdd,
  expanded = [],
  onToggleExpand,
  enableRTL = false,
  customStyles = {}
}) => {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(new Set(expanded));

  // Build tree structure from flat translations
  const buildTree = (translations: Translation[]): TreeNode => {
    const tree: TreeNode = {};

    for (const translation of translations) {
      const keys = translation.key.split('.');
      let current: TreeNode = tree;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object' || 'id' in current[key]) {
          current[key] = {};
        }
        current = current[key] as TreeNode;
      }

      current[keys[keys.length - 1]] = translation;
    }

    return tree;
  };

  const tree = buildTree(translations);

  const handleToggleExpand = (key: string) => {
    const newExpanded = new Set(internalExpanded);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setInternalExpanded(newExpanded);
    onToggleExpand?.(key);
  };

  const renderTreeNode = (node: TreeNode | Translation, keyPath: string, level: number = 0): React.ReactNode => {
    // If it's a translation (leaf node)
    if ('id' in node && 'key' in node && 'translations' in node) {
      const translation = node as Translation;
      return (
        <div
          key={translation.key}
          className={clsx(
            'flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800',
            customStyles.tableRow
          )}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white text-sm">
              {translation.key.split('.').pop()}
            </div>
            <div className="grid gap-1 mt-1">
              {Object.entries(translation.translations).map(([locale, value]) => (
                <div key={locale} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-8">
                    {locale}
                  </span>
                  <span 
                    className="text-sm text-gray-700 dark:text-gray-300 flex-1"
                    dir={enableRTL && ['ar', 'he', 'fa', 'ur'].includes(locale) ? 'rtl' : 'ltr'}
                  >
                    {value || <em className="text-gray-400">empty</em>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(translation)}
                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                title="Edit"
              >
                <Edit size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => translation.id && onDelete(translation.id)}
                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      );
    }

    // If it's a branch node
    const branchNode = node as TreeNode;
    const isExpanded = internalExpanded.has(keyPath);
    const hasChildren = Object.keys(branchNode).length > 0;

    return (
      <div key={keyPath} className="select-none">
        <div
          className={clsx(
            'flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
            customStyles.tableRow
          )}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => handleToggleExpand(keyPath)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )
          ) : (
            <div className="w-4" />
          )}
          
          <div className="flex-1">
            <span className="font-medium text-gray-900 dark:text-white">
              {keyPath.split('.').pop()}
            </span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ({Object.keys(branchNode).length} items)
            </span>
          </div>

          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(keyPath);
              }}
              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
              title="Add translation here"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div>
            {Object.entries(branchNode)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, childNode]) => {
                const childKeyPath = keyPath ? `${keyPath}.${key}` : key;
                return renderTreeNode(childNode, childKeyPath, level + 1);
              })}
          </div>
        )}
      </div>
    );
  };

  if (translations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No translations found</p>
          <p className="text-sm">Add some translations to see them in tree view</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('tree-view p-4', customStyles.container)}>
      <div className="space-y-1">
        {Object.entries(tree)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, node]) => renderTreeNode(node, key, 0))}
      </div>
    </div>
  );
};
