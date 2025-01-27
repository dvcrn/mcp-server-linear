# Contributing to Linear MCP

Thank you for your interest in contributing to Linear MCP! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to the Contributor Covenant code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/linear-mcp.git`
3. Create a branch: `git checkout -b feature/amazing-feature`
4. Install dependencies: `npm install`

## Development Process

### Environment Setup

1. Copy `.env.example` to `.env`
2. Add your Linear API credentials
3. Run `npm run build` to build the project
4. Run `npm test` to ensure everything works

### Making Changes

1. Follow the existing code style and architecture
2. Keep files under 200 lines of code
3. Write clear commit messages
4. Add tests for new features
5. Update documentation as needed

### Code Style

- Use TypeScript
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful variable names
- Add JSDoc comments for public APIs

### Testing

- Write unit tests for all new code
- Include integration tests for API interactions
- Maintain test coverage above 80%
- Run `npm test` before submitting PR

```bash
# Run all tests
npm test

# Run specific tests
npm test -- --grep "issue"

# Check coverage
npm run test:coverage
```

### Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update architecture.md for structural changes
- Create examples for new features

## Pull Request Process

1. Update the README.md with details of changes
2. Update the architecture.md if you change the structure
3. Add tests for your changes
4. Ensure all tests pass
5. Update documentation
6. Create a Pull Request with a clear title and description

### PR Title Format

Use semantic commit messages for PR titles:

- `feat: Add new feature`
- `fix: Fix bug in X`
- `docs: Update documentation`
- `refactor: Refactor X component`
- `test: Add tests for X`
- `chore: Update dependencies`

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests
- [ ] I have updated documentation
```

## Architecture Guidelines

### File Organization

Follow the established project structure:

```
src/
├── core/               # Core types and interfaces
├── features/          # Feature modules by domain
├── infrastructure/    # Infrastructure concerns
└── utils/            # Shared utilities
```

### Code Organization

1. **Domain Separation**
   - Keep domain logic separate
   - Use feature folders
   - Maintain clear boundaries

2. **Type Safety**
   - Use TypeScript features
   - Define clear interfaces
   - Avoid type assertions

3. **Error Handling**
   - Use custom error types
   - Include context in errors
   - Handle edge cases

4. **Testing**
   - Unit test business logic
   - Integration test API calls
   - Mock external dependencies

## Review Process

1. All PRs require review
2. Address review comments
3. Keep discussions focused
4. Be respectful and constructive

## Release Process

1. Maintainers will review PRs
2. Changes are merged to main
3. Version is bumped following semver
4. Release notes are generated
5. NPM package is published

## Questions?

- Open an issue for bugs
- Use discussions for questions
- Join our Discord community
- Check the documentation first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
