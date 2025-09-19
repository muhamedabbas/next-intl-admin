# Next-Intl Admin 🌐

A comprehensive, production-ready translation management system for Next.js applications with seamless next-intl integration.

[![npm version](https://badge.fury.io/js/next-intl-admin.svg)](https://badge.fury.io/js/next-intl-admin)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **🎯 Complete Translation Management**: Add, edit, delete, and organize translations with a beautiful UI
- **🔍 Advanced Search & Filtering**: Real-time search across keys and translations with debouncing
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🌍 RTL Support**: Full right-to-left language support (Arabic, Hebrew, etc.)
- **📊 Pagination**: Handle thousands of translations efficiently
- **🎨 Tree View**: Hierarchical display of nested translation keys
- **📤 Import/Export**: JSON import/export functionality for bulk operations
- **🔐 Role-Based Access**: Configurable permissions for different user roles
- **⚡ Real-time Updates**: Live updates without page refresh
- **🎪 Beautiful UI**: Modern, accessible interface built with Tailwind CSS
- **📝 TypeScript**: Full TypeScript support with comprehensive type definitions

## 📦 Installation

```bash
npm install next-intl-admin
# or
yarn add next-intl-admin
# or
pnpm add next-intl-admin
```

## 🛠️ Quick Setup

### 1. Configure Next.js with next-intl

First, ensure your Next.js app is configured with next-intl:

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export default withNextIntl({
  // Your Next.js config
});
```

### 2. Setup i18n Configuration

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar', 'fr', 'es'], // Add your supported locales
  defaultLocale: 'en'
});
```

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = routing.locales.includes(requestLocale as any)
    ? requestLocale
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

### 3. Add Translation Management Page

```typescript
// src/app/[locale]/admin/translations/page.tsx
import { TranslationManager } from 'next-intl-admin';

export default function TranslationsPage() {
  return (
    <div className="container mx-auto p-6">
      <TranslationManager
        apiEndpoint="/api/translations"
        supportedLocales={['en', 'ar', 'fr', 'es']}
        defaultLocale="en"
        enableRTL={true}
        enableExport={true}
        enableImport={true}
        pageSize={25}
        permissions={{
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
          canImport: true
        }}
      />
    </div>
  );
}
```

### 4. Setup API Routes (Backend)

Choose your backend approach:

#### Option A: Next.js API Routes (Recommended for simple setups)

```typescript
// src/app/api/translations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TranslationAPI } from 'next-intl-admin/lib';

const translationAPI = new TranslationAPI({
  dataSource: 'json', // or 'database'
  messagesPath: './messages',
  supportedLocales: ['en', 'ar', 'fr', 'es']
});

export async function GET(request: NextRequest) {
  return translationAPI.handleGet(request);
}

export async function POST(request: NextRequest) {
  return translationAPI.handlePost(request);
}

export async function PUT(request: NextRequest) {
  return translationAPI.handlePut(request);
}

export async function DELETE(request: NextRequest) {
  return translationAPI.handleDelete(request);
}
```

#### Option B: External API Integration

```typescript
// src/app/[locale]/admin/translations/page.tsx
import { TranslationManager } from 'next-intl-admin';

export default function TranslationsPage() {
  return (
    <TranslationManager
      apiEndpoint="https://your-api.com/api/translations"
      apiHeaders={{
        'Authorization': 'Bearer your-token',
        'Content-Type': 'application/json'
      }}
      // ... other props
    />
  );
}
```

## 🎨 Customization

### Styling

The package uses Tailwind CSS classes. You can customize the appearance:

```typescript
<TranslationManager
  className="custom-translation-manager"
  theme={{
    primary: 'blue',
    secondary: 'gray',
    success: 'green',
    warning: 'yellow',
    danger: 'red'
  }}
  customStyles={{
    container: "bg-white dark:bg-gray-900",
    header: "border-b border-gray-200 dark:border-gray-700",
    searchBox: "border-2 border-blue-200 focus:border-blue-500",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    table: "divide-y divide-gray-200 dark:divide-gray-700"
  }}
/>
```

### Custom Components

Replace default components with your own:

```typescript
import { TranslationManager, SearchBox, PaginationControls } from 'next-intl-admin';

<TranslationManager
  components={{
    SearchBox: CustomSearchBox,
    PaginationControls: CustomPagination,
    LoadingSpinner: CustomSpinner,
    ErrorMessage: CustomError
  }}
/>
```

## 🔧 API Reference

### TranslationManager Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | Required | API endpoint for translation operations |
| `supportedLocales` | `string[]` | Required | Array of supported locale codes |
| `defaultLocale` | `string` | `'en'` | Default locale |
| `enableRTL` | `boolean` | `true` | Enable RTL support |
| `enableExport` | `boolean` | `true` | Enable export functionality |
| `enableImport` | `boolean` | `true` | Enable import functionality |
| `pageSize` | `number` | `25` | Items per page |
| `permissions` | `Permissions` | All true | User permissions |
| `theme` | `Theme` | Default | Color theme configuration |
| `className` | `string` | `''` | Additional CSS classes |
| `onTranslationChange` | `function` | - | Callback when translations change |
| `onError` | `function` | - | Error handling callback |

### Translation Object Structure

```typescript
interface Translation {
  id?: number;
  key: string;
  translations: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

// Example:
{
  id: 1,
  key: "dashboard.title",
  translations: {
    en: "Dashboard",
    ar: "لوحة التحكم",
    fr: "Tableau de bord",
    es: "Panel de control"
  }
}
```

### API Endpoints

Your backend should implement these endpoints:

- `GET /api/translations` - List translations with pagination and search
- `POST /api/translations` - Create new translation
- `PUT /api/translations/:id` - Update existing translation
- `DELETE /api/translations/:id` - Delete translation
- `POST /api/translations/import` - Bulk import translations
- `GET /api/translations/export` - Export translations

## 📚 Advanced Usage

### Custom Validation

```typescript
<TranslationManager
  validation={{
    keyPattern: /^[a-zA-Z][a-zA-Z0-9._]*$/,
    maxKeyLength: 255,
    requiredLocales: ['en'],
    customValidation: (translation) => {
      // Custom validation logic
      return translation.key.includes('.') ? null : 'Key must contain at least one dot';
    }
  }}
/>
```

### Batch Operations

```typescript
<TranslationManager
  enableBatchOperations={true}
  batchOperations={{
    canSelectAll: true,
    canBulkEdit: true,
    canBulkDelete: true,
    canBulkExport: true
  }}
/>
```

### Real-time Updates

```typescript
<TranslationManager
  realTimeUpdates={{
    enabled: true,
    websocketUrl: 'ws://localhost:8080/translations',
    reconnectInterval: 5000
  }}
/>
```

## 🌍 Internationalization

The package itself is fully internationalized. Add these keys to your messages:

```json
{
  "translationManager": {
    "title": "Translation Management",
    "search": "Search translations...",
    "addNew": "Add Translation",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "export": "Export",
    "import": "Import",
    "confirmDelete": "Are you sure you want to delete this translation?",
    "errors": {
      "loadFailed": "Failed to load translations",
      "saveFailed": "Failed to save translation",
      "deleteFailed": "Failed to delete translation"
    }
  }
}
```

## 🎯 Examples

### Basic Usage

```typescript
import { TranslationManager } from 'next-intl-admin';

export default function AdminPage() {
  return (
    <TranslationManager
      apiEndpoint="/api/translations"
      supportedLocales={['en', 'ar']}
      defaultLocale="en"
    />
  );
}
```

### Advanced Configuration

```typescript
import { TranslationManager } from 'next-intl-admin';

export default function AdminPage() {
  const handleTranslationChange = (translations) => {
    console.log('Translations updated:', translations);
    // Trigger app rebuild or cache invalidation
  };

  return (
    <TranslationManager
      apiEndpoint="/api/translations"
      supportedLocales={['en', 'ar', 'fr', 'es', 'de']}
      defaultLocale="en"
      enableRTL={true}
      pageSize={50}
      theme={{
        primary: 'indigo',
        secondary: 'gray'
      }}
      permissions={{
        canCreate: true,
        canEdit: true,
        canDelete: false, // Read-only delete
        canExport: true,
        canImport: true
      }}
      validation={{
        keyPattern: /^[a-zA-Z][a-zA-Z0-9._-]*$/,
        maxKeyLength: 200,
        requiredLocales: ['en']
      }}
      onTranslationChange={handleTranslationChange}
      onError={(error) => console.error('Translation error:', error)}
    />
  );
}
```

## 🔌 Backend Integration Examples

### Django REST Framework

```python
# models.py
from django.db import models

class Translation(models.Model):
    key = models.CharField(max_length=255, unique=True)
    translations = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# serializers.py
from rest_framework import serializers

class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = ['id', 'key', 'translations', 'created_at', 'updated_at']

# views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class TranslationViewSet(viewsets.ModelViewSet):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(key__icontains=search) |
                Q(translations__icontains=search)
            )
        return queryset
```

### Express.js + MongoDB

```javascript
// models/Translation.js
const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  translations: { type: Object, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Translation', translationSchema);

// routes/translations.js
const express = require('express');
const Translation = require('../models/Translation');
const router = express.Router();

router.get('/', async (req, res) => {
  const { page = 1, page_size = 25, search } = req.query;
  
  let query = {};
  if (search) {
    query = {
      $or: [
        { key: { $regex: search, $options: 'i' } },
        { 'translations.en': { $regex: search, $options: 'i' } },
        { 'translations.ar': { $regex: search, $options: 'i' } }
      ]
    };
  }
  
  const translations = await Translation.find(query)
    .limit(page_size * 1)
    .skip((page - 1) * page_size);
    
  const total = await Translation.countDocuments(query);
  
  res.json({
    results: translations,
    count: total,
    next: page * page_size < total ? `?page=${parseInt(page) + 1}` : null,
    previous: page > 1 ? `?page=${parseInt(page) - 1}` : null
  });
});

module.exports = router;
```

## 🚀 Performance Tips

1. **Enable Pagination**: Always use pagination for large translation sets
2. **Debounce Search**: The built-in search debouncing prevents excessive API calls
3. **Lazy Loading**: Use the `lazy` prop to load translations on demand
4. **Caching**: Implement caching in your API for frequently accessed translations
5. **Optimize Bundle**: Use tree-shaking to include only needed components

## 🐛 Troubleshooting

### Common Issues

1. **Translations not loading**
   - Check API endpoint configuration
   - Verify CORS settings
   - Check network requests in browser dev tools

2. **RTL layout issues**
   - Ensure `enableRTL` is set to `true`
   - Check if your CSS supports RTL

3. **Search not working**
   - Verify your backend implements search functionality
   - Check the search query parameter handling

4. **Pagination not working**
   - Ensure your API returns paginated responses
   - Check the response format matches expected structure

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [next-intl](https://next-intl-docs.vercel.app/)
- UI components inspired by modern design systems
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

- 📧 Email: support@sciverra.com
- 🐛 Issues: [GitHub Issues](https://github.com/SciVerraTech/next-intl-admin/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/SciVerraTech/next-intl-admin/discussions)
- 📚 Documentation: [Full Documentation](https://next-intl-admin.sciverra.com/)
- 🌐 Company: [SciVerraTech Coop.](https://sciverra.com)

---

**Developed by Mohamed Abbas at SciVerraTech Coop.** 🚀

Lead Developer: **Mohamed Abbas** <muhamedabbas74@gmail.com>

SciVerraTech Coop. is a technology cooperative focused on creating innovative solutions for scientific and technical applications. We specialize in developing high-quality, open-source tools that empower developers and organizations worldwide.

Made with ❤️ for the Next.js community
