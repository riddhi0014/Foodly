# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Build**: `npm run build` (compiles TypeScript, bundles React app)
- **Start Dev Server**: `npm start` (launches frontend on `http://localhost:3000`)
- **Lint**: `npm run lint` (checks TypeScript & ESLint rules)
- **Run Tests**: `npm test` (Jest + React Testing Library; add `-- --grep "<test name>"` to run a specific test)
- **Restaurant Service**: `cd services/restaurant && npm run dev` (starts mock restaurant API if required)

## Architecture

### Frontend
- **TypeScript React App**: `frontend/src/App.tsx` is the entry point
- **State Management**: Uses React Context API (`frontend/src/context/AppContext.tsx`)
- **Components**: 
  - Reusable UI components in `frontend/src/components`
  - Page-specific components in `frontend/src/pages`
- **Routing**: Implied by `frontend/src/App.tsx` and recent OAuth setup commits (likely React Router v6)

### Backend
- **Restaurant Service**: `services/restaurant` contains mock/real API implementations (structure depends on implementation details)

## Important Files

- **Types**: Core TypeScript types defined in `frontend/src/types.ts`
- **OAuth Setup**: Google OAuth configuration in `frontend/src/pages/AuthPage.tsx` and related routing
- **Config**: Check `.env` files for API keys/environment variables

## Special Notes

1. **Testing**: When adding new features, ensure tests are written for critical flows (use `-- --grep` to target specific tests during development)
2. **Context API**: New features should integrate with the existing AppContext for state management
3. **Restaurant Service**: Verify service status before debugging frontend API calls

## Copilot/Cursor Rules

Include relevant rules from `.cursor/rules` or `.github/copilot-instructions.md` if present (check these files for specific instructions).