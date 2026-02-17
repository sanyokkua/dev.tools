# dev.tools Workspace Instructions

## Project Overview

This is a **client-side only** Next.js application built with TypeScript and React. All computations happen in the browser - no data is sent to external servers. The application provides various text manipulation, code editing, and configuration tools.

## Key Features

- Text transformation tools (case conversion, line operations, etc.)
- Monaco Code Editor with syntax highlighting
- JSON formatter
- Hashing and encoding tools
- Git configuration assistant
- MacOS configuration assistant
- Prompt library for LLMs

## Architecture

### Core Structure

- **Pages**: `/src/pages/` - Main application pages
- **Components**: `/src/components/` - Reusable UI components
- **Common**: `/src/common/` - Shared utilities and logic
- **Styles**: `/src/styles/` - Global CSS/Sass files

### Key Technologies

- Next.js 15 (v15)
- TypeScript 5
- React 19
- Monaco Editor (VS Code's engine)
- Sass for styling
- Jest for testing

## Development Workflow

### Running the Application

```bash
npm run dev  # Development server
npm run build  # Production build
```

### Testing

```bash
npm run test  # Run all tests with coverage
```

### Code Quality

```bash
npm run lint  # Lint code
npm run format  # Format code with Prettier
```

## Code Organization

### Components

- **Controls**: Reusable UI elements (buttons, inputs, modals)
- **Elements**: Specific UI elements (code snippets, editors)
- **Layouts**: Container components for page structure
- **App Layout**: Main application layout components

### Prompts System

The application has a sophisticated prompt system:

- `/src/common/prompts/` - Contains system prompts, user prompts, and prompt libraries
- Prompt types include: text transformation, code generation, research, API design, etc.
- Prompts are organized by task categories and can be parameterized

### Pages

Each page is organized under `/src/pages/` and typically includes:

- Page-specific components in `/src/components/page-specific/`
- Custom logic and UI for that specific tool

## Key Files and Directories

### Main Entry Points

- `src/pages/index.tsx` - Main application page
- `src/_app.tsx` - Application wrapper
- `src/_document.tsx` - Document structure

### Common Utilities

- `src/common/utils-factory.ts` - Factory functions for common utilities
- `src/common/formatting-tools.ts` - Text formatting utilities
- `src/common/git-utils.ts` - Git-related utilities
- `src/common/macos-utils.ts` - macOS configuration utilities

### Prompt System

- `src/common/prompts/prompts.ts` - Prompt types and categories
- `src/common/prompts/system-prompts.ts` - System prompts for different roles
- `src/common/prompts/user-prompts.ts` - User prompts for text transformations
- `src/common/prompts/prompts-library.ts` - Library of reusable prompts

## Development Guidelines

### Code Style

- Follow TypeScript strict mode
- Use consistent naming conventions (PascalCase for components, camelCase for functions)
- Maintain clean, readable code with meaningful variable names
- Follow SOLID principles and clean code practices

### Testing

- All components should have unit tests
- Test both happy paths and edge cases
- Use Jest and React Testing Library for testing

### Performance

- All computations happen client-side
- Optimize for browser performance
- Avoid unnecessary re-renders in React components

## Special Considerations

### Client-Side Only

- No server-side rendering or API calls
- All data processing happens in the browser
- No external dependencies for core functionality

### Monaco Editor Integration

- Uses @monaco-editor/react for code editing
- Supports syntax highlighting for multiple languages
- Custom configurations for different code editors

### Prompt System

- Highly parameterized prompts
- Multiple prompt formats (system, user, etc.)
- Prompt library with categorized templates

## Common Tasks

### Adding a New Tool

1. Create a new page in `/src/pages/`
2. Add page-specific components in `/src/components/page-specific/`
3. Implement the functionality in the page component
4. Add any necessary utilities to `/src/common/`
5. Add tests in `/test/`

### Modifying Prompts

1. Edit `/src/common/prompts/` files
2. Add new prompt types to `/src/common/prompts/prompts.ts`
3. Implement system prompts in `/src/common/prompts/system-prompts.ts`
4. Add user prompts in `/src/common/prompts/user-prompts.ts`

### Adding New Components

1. Place in appropriate subdirectory under `/src/components/`
2. Follow existing component patterns
3. Use TypeScript interfaces for props
4. Include proper documentation and examples

## Example Prompts for Agent Use

Try asking for:

- "Create a new text transformation tool for converting text to snake_case"
- "Generate a system prompt for a senior frontend engineer"
- "Implement a new Git configuration assistant page"
- "Add a new prompt for generating API documentation"
