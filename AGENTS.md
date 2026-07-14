<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Testing Requirements

Any time a new feature is implemented, you MUST create test conditions for it and add them to the central `TESTING.md` document in the root directory. This ensures we have a comprehensive suite of regression test conditions.

# Architecture Documentation

With each release or any major architectural changes (such as adding new API routes, databases, or external integrations), you MUST update the architecture diagram and documentation located in `ARCHITECTURE.md`.
