```typescript
// Contributing Guidelines Types and Constants

export interface ContributorInfo {
  name: string;
  email: string;
  github: string;
  role?: string;
}

export interface PullRequestTemplate {
  title: string;
  description: string;
  type: 'feature' | 'bugfix' | 'hotfix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore';
  breaking: boolean;
  issues: string[];
  checklist: string[];
}

export interface CodeReviewChecklist {
  functionality: boolean;
  testing: boolean;
  documentation: boolean;
  performance: boolean;
  security: boolean;
  codeStyle: boolean;
}

export interface CommitMessage {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  footer?: string;
}

export const COMMIT_TYPES = {
  feat: 'New feature',
  fix: 'Bug fix',
  docs: 'Documentation changes',
  style: 'Code style changes (formatting, semicolons, etc)',
  refactor: 'Code refactoring',
  perf: 'Performance improvements',
  test: 'Adding or updating tests',
  build: 'Build system or dependency changes',
  ci: 'CI/CD configuration changes',
  chore: 'Other changes that don\'t modify src or test files',
  revert: 'Reverts a previous commit'
} as const;

export const BRANCH_NAMING_CONVENTION = {
  feature: 'feature/',
  bugfix: 'bugfix/',
  hotfix: 'hotfix/',
  release: 'release/',
  docs: 'docs/',
  test: 'test/',
  refactor: 'refactor/'
} as const;

export const CODE_STYLE_RULES = {
  indentation: 2,
  maxLineLength: 100,
  semicolons: true,
  quotes: 'single',
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always'
} as const;

export const REQUIRED_TESTS = {
  unit: true,
  integration: true,
  e2e: false,
  minCoverage: 80
} as const;

export const PR_SIZE_LIMITS = {
  small: { files: 5, lines: 100 },
  medium: { files: 15, lines: 500 },
  large: { files: 30, lines: 1000 },
  xlarge: { files: Infinity, lines: Infinity }
} as const;
```


Execution error