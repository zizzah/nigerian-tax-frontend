# Contributing to Nigerian Tax Frontend

A tax compliance platform for Nigerian SMEs. Read this fully before 
making your first contribution.

## Getting Started
1. Clone the repo:
   git clone https://github.com/zizzah/nigerian-tax-frontend.git
2. Navigate into the project:
   cd nigerian-tax-frontend
3. Install dependencies:
   npm install
4. Create a .env file based on .env.example
5. Run the development server:
   npm run dev

## Branch Naming
Always branch off main. Use the following prefixes:
- feature/ — new functionality e.g. feature/invoice-pdf-export
- fix/     — bug fixes e.g. fix/double-debit-calculation
- hotfix/  — urgent production fixes e.g. hotfix/payment-crash
- chore/   — config, deps, tooling e.g. chore/update-eslint

Never work directly on main.

## Commit Messages
Follow this format:
  type: short description of what changed and why

Types: feat, fix, refactor, chore, docs

Examples:
  feat: add PDF export to invoice detail page
  fix: resolve double debit on paystack callback
  chore: update .env.example with new API keys

Keep messages under 72 characters. Present tense. No vague 
messages like "fix", "update", or "changes".

## Pull Request Process
1. Push your branch to GitHub
2. Open a PR against main with a clear title and description
3. Describe what changed and how to test it
4. Assign yourself and request at least one reviewer
5. All automated checks must pass before review
6. At least one approval is required before merging
7. Do not merge your own PR

## Code Review Standards
Reviewers will check for:
- Correct TypeScript types — no implicit any
- Proper error handling — no silent failures
- No hardcoded secrets or API keys
- Components are reusable where possible
- Code is readable without needing comments to explain it

Address all review comments before requesting re-review.