# Testing Guide

This document outlines the testing strategy, tools, and best practices for this React application.

## Overview

This project uses **Vitest** as the test runner with **@testing-library/react** for component testing, providing a fast and modern testing experience that integrates seamlessly with Vite.

## Testing Stack

### Core Testing Libraries

- **Vitest** - Fast unit test framework powered by Vite
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom jest-dom matchers for assertions
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for Node.js (test environment)

### Why These Tools?

- **Vitest**: Native Vite integration, faster than Jest, compatible with Jest API
- **Testing Library**: Encourages best practices by testing components from user perspective
- **jsdom**: Lightweight DOM environment for testing without a real browser

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Full CI pipeline (type-check, lint, tests) — see AGENTS.md
npm run ci

# Full check including production build
npm run check:full
```

## Test File Organization

### Naming Conventions

- Test files should be co-located with the code they test
- Use `.test.tsx` or `.test.ts` extension for test files
- Example: `Button.tsx` → `Button.test.tsx`

### Directory Structure

```
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx          # Component tests
├── lib/
│   ├── utils.ts
│   └── utils.test.ts                # Utility function tests
│   ├── documentStorage.ts
│   └── documentStorage.test.ts
│   ├── sectionHierarchy.ts
│   └── sectionHierarchy.test.ts
│   ├── pdfExport.ts
│   └── pdfExport.test.ts
├── pages/
│   └── DocumentEditor.tsx           # Main application page
└── test/
    ├── setup.ts                     # Global test setup
    └── utils.tsx                    # Test utilities and helpers
```

## Testing Patterns

### 1. Component Testing

Test UI components using @testing-library/react:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Testing Components with React Query

For components that use TanStack Query, use the `renderWithQueryClient` helper:

```tsx
import { renderWithQueryClient } from "@/test/utils";
import { MyComponent } from "./MyComponent";

it("fetches and displays data", async () => {
  renderWithQueryClient(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText("Data loaded")).toBeInTheDocument();
  });
});
```

### 3. Testing Utility Functions

Pure utility functions are the simplest to test:

```tsx
import { describe, it, expect } from "vitest";
import { myUtilFunction } from "./utils";

describe("myUtilFunction", () => {
  it("returns correct output", () => {
    const result = myUtilFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### 4. Mocking

#### Mocking Modules

```tsx
import { vi } from "vitest";

vi.mock("@/lib/documentStorage", () => ({
  loadDocument: vi.fn(() => mockDocument),
  saveDocument: vi.fn(),
}));
```

#### Mocking Browser APIs

```tsx
// Mock localStorage
beforeEach(() => {
  localStorage.clear();
});

// Mock BroadcastChannel
global.BroadcastChannel = MockBroadcastChannel;
```

## Test Utilities

### Custom Test Helpers

Located in `src/test/utils.tsx`:

- **`createTestQueryClient()`** - Creates a QueryClient configured for testing
- **`renderWithQueryClient()`** - Renders components with QueryClientProvider

### Example Usage

```tsx
import { renderWithQueryClient } from "@/test/utils";

it("works with queries", () => {
  const { queryClient } = renderWithQueryClient(<MyComponent />);
  // Test your component
});
```

> **Note:** See [`AGENTS.md`](../AGENTS.md) for testing rules (e.g. co-locate tests, run `npm run ci` before commit).

## Best Practices

### 1. Query by Accessibility

Prefer queries that reflect how users interact with your app:

```tsx
// ✅ Good - queries by role and accessible name
screen.getByRole("button", { name: /submit/i });

// ❌ Avoid - queries by test IDs or implementation details
screen.getByTestId("submit-button");
```

Query priority:

1. `getByRole` - Most accessible
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Form elements
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort

### 2. Async Testing

Use `waitFor` for asynchronous operations:

```tsx
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});
```

### 3. User Interactions

Use `@testing-library/user-event` for realistic user interactions:

```tsx
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();
await user.click(button);
await user.type(input, "Hello");
```

### 4. Test Isolation

Each test should be independent:

```tsx
beforeEach(() => {
  // Reset state, clear mocks, etc.
  vi.clearAllMocks();
  localStorage.clear();
});
```

### 5. Don't Test Implementation Details

Focus on behavior, not implementation:

```tsx
// ✅ Good - tests behavior
expect(screen.getByText("0")).toBeInTheDocument();
await user.click(incrementButton);
expect(screen.getByText("1")).toBeInTheDocument();

// ❌ Avoid - tests implementation
expect(component.state.count).toBe(1);
```

### 6. Descriptive Test Names

Write clear, descriptive test names:

```tsx
// ✅ Good
it("increments counter when + button is clicked", () => {});

// ❌ Avoid
it("works", () => {});
```

## Coverage

Generate coverage reports to identify untested code:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

### Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Focus on testing critical paths and business logic rather than achieving 100% coverage.

## Common Testing Scenarios

### Testing Forms

```tsx
it("submits form with valid data", async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<MyForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText(/name/i), "John Doe");
  await user.type(screen.getByLabelText(/email/i), "john@example.com");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(handleSubmit).toHaveBeenCalledWith({
    name: "John Doe",
    email: "john@example.com",
  });
});
```

### Testing Loading States

```tsx
it("shows loading state while fetching", () => {
  render(<MyComponent />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

it("shows data after loading", async () => {
  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.getByText(/data/i)).toBeInTheDocument();
  });
});
```

### Testing Error States

```tsx
it("displays error message on failure", async () => {
  vi.mocked(api.getData).mockRejectedValue(new Error("Failed"));

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Debugging Tests

### View Rendered Output

```tsx
import { screen } from "@testing-library/react";

// Print the DOM
screen.debug();

// Print a specific element
screen.debug(screen.getByRole("button"));
```

### Check Available Queries

```tsx
// Shows all available queries for the current screen
screen.logTestingPlaygroundURL();
```

### Run Single Test

```bash
# Run specific test file
npm test -- button.test.tsx

# Run tests matching pattern
npm test -- --grep "increments counter"
```

## Next Steps

### Areas for Additional Testing

1. **Integration Tests** - Test multiple components working together
2. **E2E Tests** - Consider adding Playwright for end-to-end testing
3. **Visual Regression Tests** - Add visual snapshot testing for UI components
4. **Accessibility Tests** - Add axe-core for automated a11y testing

### Recommended Practices

- Write tests as you develop features (TDD when appropriate)
- Run tests locally before pushing
- Set up CI/CD to run tests automatically
- Review test coverage regularly
- Refactor tests when refactoring code

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [TanStack Query Testing](https://tanstack.com/query/latest/docs/framework/react/guides/testing)
