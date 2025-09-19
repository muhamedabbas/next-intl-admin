# 🚀 Deployment Guide - Next-Intl Admin

This guide covers testing, building, and publishing the next-intl-admin package to Git and npm.

## 📋 Pre-Deployment Checklist

- [ ] All code is complete and tested
- [ ] Documentation is up to date
- [ ] License and attribution are correct
- [ ] Version number is set in package.json
- [ ] All dependencies are properly listed

## 🧪 Testing Steps

### 1. Install Dependencies
```bash
cd next-intl-admin
npm install
```

### 2. Type Check
```bash
npm run type-check
```

### 3. Lint Code
```bash
npm run lint
```

### 4. Build Package
```bash
npm run build
```

### 5. Test Package Locally
```bash
# Link the package locally
npm link

# In a test Next.js project
npm link next-intl-admin

# Test the import
npm run dev
```

### 6. Test Standalone Functionality
Create a test file to verify standalone features:

```typescript
// test-standalone.ts
import { StandaloneAPI, LocalStorageAdapter } from './src';

async function testStandalone() {
  const api = new StandaloneAPI({
    supportedLocales: ['en', 'ar'],
    autoSave: true
  });

  // Test create
  const translation = await api.createTranslation({
    key: 'test.hello',
    translations: { en: 'Hello', ar: 'مرحبا' }
  });

  console.log('Created:', translation);

  // Test load
  const translations = await api.loadTranslations();
  console.log('All translations:', translations);

  // Test statistics
  const stats = await api.getStatistics();
  console.log('Statistics:', stats);
}

testStandalone().catch(console.error);
```

Run the test:
```bash
npx tsx test-standalone.ts
```

## 📦 Git Setup and Upload

### 1. Initialize Git Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial release of next-intl-admin package

- Complete translation management system
- Standalone functionality with file management
- Support for multiple storage adapters
- Full TypeScript support
- Comprehensive documentation"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Repository name: `next-intl-admin`
4. Description: `A comprehensive translation management system for Next.js applications with next-intl integration`
5. Set to **Public** (for npm publishing)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

### 3. Connect Local Repository to GitHub
```bash
# Add remote origin (replace with your GitHub username)
git remote add origin https://github.com/SciVerraTech/next-intl-admin.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 4. Create Release Tags
```bash
# Create and push version tag
git tag -a v1.0.0 -m "Release version 1.0.0 - Initial release"
git push origin v1.0.0
```

## 📝 GitHub Repository Setup

### 1. Repository Settings
- **Description**: "A comprehensive translation management system for Next.js applications with next-intl integration"
- **Website**: `https://next-intl-admin.sciverra.com`
- **Topics**: `nextjs`, `react`, `i18n`, `internationalization`, `translation-management`, `typescript`

### 2. Create GitHub Release
1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `Next-Intl Admin v1.0.0 - Initial Release`
5. Description:
```markdown
# 🎉 Initial Release of Next-Intl Admin

A comprehensive, production-ready translation management system for Next.js applications with seamless next-intl integration.

## ✨ Key Features

- 🎯 Complete Translation Management (CRUD operations)
- 🔍 Advanced Search & Filtering with real-time debouncing
- 📱 Fully Responsive Design (desktop, tablet, mobile)
- 🌍 RTL Language Support (Arabic, Hebrew, Persian, etc.)
- 📊 Pagination for handling thousands of translations
- 🎨 Tree View for hierarchical translation keys
- 📤 Import/Export functionality (JSON, CSV)
- 🔐 Role-Based Permissions system
- ⚡ Real-time inline editing
- 🎪 Beautiful animations with Framer Motion
- 📝 Full TypeScript support
- 🚀 **Standalone Mode** - No backend required!

## 🆕 Standalone Features

- **Multiple Storage Options**: localStorage, IndexedDB, memory
- **File Management**: Read from and write to public/messages folder
- **Auto-Save & Export**: Automatically maintains JSON files
- **Statistics Dashboard**: Translation completion tracking
- **Offline Capable**: Works without internet connection

## 📦 Installation

```bash
npm install next-intl-admin
```

## 🚀 Quick Start

### With Backend API
```tsx
import { TranslationManager } from 'next-intl-admin';

<TranslationManager
  apiEndpoint="/api/translations"
  supportedLocales={['en', 'ar', 'fr']}
  defaultLocale="en"
/>
```

### Standalone Mode
```tsx
import { StandaloneTranslationManager } from 'next-intl-admin';

<StandaloneTranslationManager
  supportedLocales={['en', 'ar', 'fr']}
  storageType="localStorage"
  autoExport={true}
/>
```

## 📚 Documentation

- [Full Documentation](https://next-intl-admin.sciverra.com/)
- [GitHub Repository](https://github.com/SciVerraTech/next-intl-admin)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🙏 Credits

**Lead Developer**: Mohamed Abbas <muhamedabbas74@gmail.com>
**Organization**: SciVerraTech Coop.

Made with ❤️ for the Next.js community
```

6. Check "Set as the latest release"
7. Click "Publish release"

## 📦 NPM Publishing (Optional)

### 1. Prepare for NPM
```bash
# Login to npm (if not already logged in)
npm login

# Verify package contents
npm pack --dry-run

# Check package info
npm view next-intl-admin
```

### 2. Publish to NPM
```bash
# Publish package
npm publish

# Or if scoped package
npm publish --access public
```

### 3. Verify Publication
```bash
# Check if published
npm view next-intl-admin

# Test installation
npm install next-intl-admin
```

## 🔄 Update Workflow

For future updates:

### 1. Make Changes
```bash
# Make your changes
# Update version in package.json
# Update CHANGELOG.md
```

### 2. Commit and Tag
```bash
git add .
git commit -m "feat: add new feature X"

# Update version
npm version patch  # or minor/major
git push origin main
git push --tags
```

### 3. Create GitHub Release
- Create new release with updated version
- Update changelog and features

### 4. Publish to NPM
```bash
npm publish
```

## 🧪 Testing Checklist

Before each release, verify:

- [ ] **TypeScript Compilation**: `npm run type-check`
- [ ] **Linting**: `npm run lint`
- [ ] **Build Process**: `npm run build`
- [ ] **Package Contents**: `npm pack --dry-run`
- [ ] **Local Installation**: `npm link` and test in sample project
- [ ] **Standalone Mode**: Test without backend API
- [ ] **File Operations**: Test import/export functionality
- [ ] **Storage Adapters**: Test localStorage, IndexedDB, memory
- [ ] **RTL Support**: Test with Arabic/Hebrew locales
- [ ] **Responsive Design**: Test on mobile/tablet/desktop
- [ ] **Documentation**: Verify all links and examples work

## 🚨 Troubleshooting

### Common Issues

**TypeScript Errors**:
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

**Git Push Issues**:
```bash
# Force push (use carefully)
git push --force-with-lease origin main
```

**NPM Publish Issues**:
```bash
# Check if name is available
npm view next-intl-admin

# Login again if needed
npm logout
npm login
```

**Build Failures**:
```bash
# Check dependencies
npm audit
npm audit fix

# Update TypeScript
npm update typescript
```

## 📞 Support

If you encounter issues:
- 📧 Email: muhamedabbas74@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/SciVerraTech/next-intl-admin/issues)
- 🌐 Company: [SciVerraTech Coop.](https://sciverra.com)

---

**Happy Deploying! 🚀**
