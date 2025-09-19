# Contributing to Next-Intl Admin

Thank you for your interest in contributing to Next-Intl Admin! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/SciVerraTech/next-intl-admin.git
   cd next-intl-admin
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
next-intl-admin/
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API
│   ├── types/              # TypeScript type definitions
│   └── index.ts            # Main package exports
├── examples/               # Usage examples
├── docs/                   # Documentation
└── tests/                  # Test files
```

## 🛠️ Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep components small and focused

### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript typing
- Include proper accessibility attributes
- Support RTL languages when applicable
- Follow the existing naming conventions

### Testing

- Write tests for new features
- Ensure all tests pass before submitting
- Include both unit and integration tests
- Test accessibility features

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### TypeScript

- Define proper interfaces and types
- Use generic types where appropriate
- Avoid `any` types
- Export types that might be useful to consumers

## 📝 Commit Messages

Use conventional commit messages:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

Examples:
```
feat: add bulk delete functionality
fix: resolve RTL layout issues in table
docs: update API documentation
```

## 🔄 Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow the coding guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes:**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request:**
   - Use a clear title and description
   - Link any related issues
   - Include screenshots for UI changes
   - Add reviewers if you know who should review

### Pull Request Checklist

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] TypeScript types are properly defined
- [ ] Accessibility is considered
- [ ] RTL support is implemented (if applicable)
- [ ] No console errors or warnings
- [ ] Performance impact is considered

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment:** OS, Node.js version, package version
- **Steps to reproduce:** Clear, numbered steps
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Screenshots:** If applicable
- **Additional context:** Any other relevant information

Use this template:

```markdown
## Bug Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g. macOS 12.0]
- Node.js: [e.g. 18.0.0]
- Package version: [e.g. 1.0.0]
- Browser: [e.g. Chrome 96.0]

## Additional Context
Any other context about the problem.
```

## 💡 Feature Requests

For feature requests, please:

1. Check if the feature already exists
2. Search existing issues for similar requests
3. Provide a clear use case
4. Explain the expected behavior
5. Consider the impact on existing users

Use this template:

```markdown
## Feature Description
A clear description of the feature you'd like to see.

## Use Case
Explain why this feature would be useful.

## Proposed Solution
Describe how you think this should work.

## Alternatives Considered
Any alternative solutions you've considered.

## Additional Context
Any other context or screenshots.
```

## 🏷️ Issue Labels

We use these labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - This will not be worked on

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### High Priority
- Bug fixes and stability improvements
- Performance optimizations
- Accessibility enhancements
- Documentation improvements
- Test coverage improvements

### Medium Priority
- New component features
- Additional export/import formats
- Theme customization options
- Keyboard shortcuts
- Mobile responsiveness

### Low Priority
- Additional languages for UI
- Advanced filtering options
- Plugin system
- Advanced analytics

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Next-intl Documentation](https://next-intl-docs.vercel.app/)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Project maintainers are responsible for clarifying standards and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## 📞 Getting Help

If you need help:

1. Check the [documentation](README.md)
2. Search [existing issues](https://github.com/SciVerraTech/next-intl-admin/issues)
3. Create a new issue with the `question` label
4. Contact us at support@sciverra.com
5. Visit [SciVerraTech Coop.](https://sciverra.com) for more information

## 🎉 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- Project documentation where appropriate

Thank you for contributing to Next-Intl Admin! 🙏

---

**Developed by Mohamed Abbas at SciVerraTech Coop.** - A technology cooperative focused on creating innovative solutions for scientific and technical applications.

Lead Developer: Mohamed Abbas <muhamedabbas74@gmail.com>
