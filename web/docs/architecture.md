# Architecture Summary

## Overview

Traffic Congestion is a single Next.js App Router application deployed well on Vercel and organized around feature boundaries instead of a flat component bucket. The product ships with local typed demo data instead of a database because the initial goal is a credible interactive MVP, not persistence-heavy operations.

## Structure

- `app/`: Route groups separate marketing and product surfaces while keeping one deployable app.
- `components/`: Reusable UI primitives, site chrome, and visualization blocks shared across features.
- `features/`: Domain-level page implementations and shared schemas for contact and route planning.
- `lib/`: Environment validation, formatting, metadata helpers, logging, observability hooks, and rate limiting.
- `server/`: Server-side services that transform structured demo data into dashboard, forecasting, optimization, and route-planning outputs.
- `tests/`: Unit, component, and end-to-end coverage for the most important flows.

## Key Boundaries

- Server-first rendering: informational pages and analytics pages render on the server with typed demo snapshots.
- Client islands only where needed: navigation toggle, dashboard filter, route planner form, and contact form.
- Shared validation: Zod schemas live with the feature and are reused across client forms and API routes.
- Typed service layer: route ranking, forecast selection, and contact submission sit behind server-side functions instead of being embedded in UI files.
- Observability hook points: `lib/logger.ts` and `lib/observability.ts` centralize structured logging and future analytics/error provider integrations.

## Security and Operations

- Security headers are set in `next.config.ts`.
- Rate limiting is enforced on the contact and route-plan API routes.
- No privileged mutations are performed in the client.
- Environment variables are parsed centrally in `lib/env.ts`.

## Deployment

The app targets Vercel by default, but also includes a Dockerfile for container-based deployment. No database or background worker is required for the demo experience.
