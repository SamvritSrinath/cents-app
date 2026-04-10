# Cents Mobile App - Planning Documents

This directory contains all planning, specifications, and implementation guides for the **Cents Mobile App** built with React Native and Expo.

## Document Index

| Document | Purpose |
|----------|---------|
| [PRD.md](./PRD.md) | Product Requirements Document - Features, user stories, acceptance criteria |
| [architecture.md](./architecture.md) | Technical architecture, repo structure, shared code strategy |
| [implementation-plan.md](./implementation-plan.md) | Phased implementation timeline with milestones |
| [testing-strategy.md](./testing-strategy.md) | Testing frameworks, local testing, EAS build efficiency |
| [development-workflow.md](./development-workflow.md) | Local development setup, build process, CI/CD |
| [epics.md](./epics.md) | Trackable epics & issues - GitHub/Linear/Jira ready task breakdown |
| [pr-roadmap.md](./pr-roadmap.md) | **27 PRs with dependencies** - Step-by-step merge plan |

## Quick Links

- **Web App**: [/Users/samvrit/Developer/expensely](../../../)
- **Original Spec**: [expense-tracker-spec.md](../../../expense-tracker-spec.md)
- **OCR Service**: [ocr-service/](../../../ocr-service/)

## Key Constraints

1. **EAS Build Limits**: 15 builds/month on free tier - prioritize local development and testing
2. **Code Sharing**: Maximize reuse of business logic, types, and API patterns from web app
3. **Privacy-First**: All OCR processing on-device (ML Kit on Android, Vision on iOS)
4. **Supabase Backend**: Share existing database and auth with web app

## Status

- [ ] PRD complete
- [ ] Architecture finalized
- [ ] Implementation plan approved
- [ ] Development started
