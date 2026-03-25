# Decisions

## ADR-001: Use a single Next.js app

The product has no admin surface, auth, or payment workflow. Splitting apps would add overhead without operational value, so marketing pages and product demo pages live in one App Router project with route groups.

## ADR-002: Use local typed demo data instead of a database

Persistence is not required for the initial experience. Local TypeScript seed data keeps the app easy to run from a fresh clone, avoids premature schema design, and still supports credible analytics and route-planning demos.

## ADR-003: Put route planning behind a typed server service

The route planner currently uses local blueprints and scoring logic, but a provider like Mapbox can later replace the implementation behind the same service boundary and request schema.

## ADR-004: Centralize observability and environment parsing

Environment validation and logging are centralized so the app can evolve toward real monitoring providers without scattering parsing or console calls throughout the codebase.

## ADR-005: Use in-memory rate limiting for the demo

The API routes need baseline abuse protection now. In-memory limiting is sufficient for local development and a demo deployment, while the documentation makes clear that a distributed store is the next production-scale step.
