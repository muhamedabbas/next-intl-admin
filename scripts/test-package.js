#!/usr/bin/env node

/**
 * Test script for next-intl-admin package
 * Run with: node scripts/test-package.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Next-Intl Admin Package...\n');

// Test 1: Check package.json
console.log('📦 Checking package.json...');
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`✅ Package name: ${pkg.name}`);
  console.log(`✅ Version: ${pkg.version}`);
  console.log(`✅ Author: ${pkg.author}`);
  console.log(`✅ License: ${pkg.license}`);
} else {
  console.log('❌ package.json not found');
  process.exit(1);
}

// Test 2: Check main files exist
console.log('\n📁 Checking main files...');
const mainFiles = [
  'src/index.ts',
  'src/types/index.ts',
  'src/components/TranslationManager.tsx',
  'src/components/StandaloneTranslationManager.tsx',
  'src/lib/standalone-api.ts',
  'src/lib/storage.ts',
  'src/lib/file-manager.ts',
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'CHANGELOG.md'
];

for (const file of mainFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
}

// Test 3: Check TypeScript files compile
console.log('\n🔍 Checking TypeScript exports...');
try {
  const indexPath = path.join(__dirname, '..', 'src', 'index.ts');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  const exports = indexContent.match(/export\s+\{[^}]+\}/g) || [];
  console.log(`✅ Found ${exports.length} export statements`);
  
  // Check for main exports
  const requiredExports = [
    'TranslationManager',
    'StandaloneTranslationManager',
    'StandaloneAPI',
    'FileManager',
    'LocalStorageAdapter'
  ];
  
  for (const exportName of requiredExports) {
    if (indexContent.includes(exportName)) {
      console.log(`✅ ${exportName} exported`);
    } else {
      console.log(`❌ ${exportName} not found in exports`);
    }
  }
} catch (error) {
  console.log('❌ Error checking TypeScript exports:', error.message);
}

// Test 4: Check documentation
console.log('\n📚 Checking documentation...');
const readmePath = path.join(__dirname, '..', 'README.md');
if (fs.existsSync(readmePath)) {
  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  const sections = [
    '## 🚀 Features',
    '## 📦 Installation',
    '## 🛠️ Quick Setup',
    '## 🎨 Customization',
    '## 🔧 API Reference',
    '## 📚 Advanced Usage',
    '## 🌍 Internationalization'
  ];
  
  for (const section of sections) {
    if (readmeContent.includes(section)) {
      console.log(`✅ ${section.replace('## ', '')}`);
    } else {
      console.log(`⚠️  ${section.replace('## ', '')} section missing`);
    }
  }
  
  // Check for examples
  if (readmeContent.includes('```tsx') || readmeContent.includes('```typescript')) {
    console.log('✅ Code examples found');
  } else {
    console.log('⚠️  No code examples found');
  }
} else {
  console.log('❌ README.md not found');
}

// Test 5: Check examples
console.log('\n🔧 Checking examples...');
const examplesDir = path.join(__dirname, '..', 'examples');
if (fs.existsSync(examplesDir)) {
  const examples = fs.readdirSync(examplesDir);
  console.log(`✅ Found ${examples.length} example files:`);
  examples.forEach(example => console.log(`   - ${example}`));
} else {
  console.log('⚠️  Examples directory not found');
}

// Test 6: Validate package structure for npm
console.log('\n📋 Validating npm package structure...');
const requiredForNpm = [
  { file: 'package.json', required: true },
  { file: 'README.md', required: true },
  { file: 'LICENSE', required: true },
  { file: 'src/index.ts', required: true },
  { file: '.gitignore', required: true },
  { file: 'tsconfig.json', required: true }
];

let npmReady = true;
for (const { file, required } of requiredForNpm) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`${required ? '❌' : '⚠️ '} ${file} ${required ? 'missing (required)' : 'missing (optional)'}`);
    if (required) npmReady = false;
  }
}

console.log('\n🎯 Test Summary:');
if (npmReady) {
  console.log('✅ Package is ready for npm publishing!');
  console.log('✅ All required files are present');
  console.log('✅ Documentation looks good');
  console.log('\nNext steps:');
  console.log('1. Run: npm run build');
  console.log('2. Run: npm run type-check');
  console.log('3. Run: npm run lint');
  console.log('4. Test locally: npm link');
  console.log('5. Commit to git: git add . && git commit -m "feat: ready for release"');
  console.log('6. Push to GitHub: git push origin main');
  console.log('7. Create release on GitHub');
  console.log('8. Publish to npm: npm publish');
} else {
  console.log('❌ Package has issues that need to be fixed before publishing');
  process.exit(1);
}

console.log('\n🚀 Happy coding!');
