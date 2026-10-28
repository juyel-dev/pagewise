# Blueprint · 10 · PageWise Architecture Specification (Authoritative)

**Version:** 1.0 · **Status:** LOCKED — Planning approved by owner 2026-10-28.
**Scope:** Application architecture, Home UI, navigation, extensibility, authentication, future feature integration.
**Downstream docs must stay consistent with this file. Changes follow §13 change control.**

## 1. Product Vision

PageWise will be a modular learning platform, not merely an NCERT PDF viewer.

The platform will support study materials, questions, practice, progress tracking, student achievements, community-oriented content, announcements, sponsors, affiliate recommendations and future features.

The architecture must allow features to be added, removed, redesigned or expanded without requiring unrelated parts of the application to be rewritten.

## 2. User Journey

The initial user journey is:

1. A visitor opens PageWise through a shared link or Google search.
2. The visitor sees the public landing experience.
3. The visitor proceeds through three onboarding screens.
4. The visitor reaches Google Sign-In.
5. After successful authentication, the user enters the application Home.

Returning authenticated users may be routed directly to the application Home, subject to the final authentication and onboarding rules.

The public landing experience and authenticated Home may share a visual identity, but their content and user actions must support their different purposes.

## 3. Core Application Architecture

The application will have independent, clearly separated areas:

- Public Landing Experience
- Onboarding
- Authentication
- Application Shell and Navigation
- Home Page System
- Study
- Practice
- Progress
- Bookmarks
- Settings
- Future Feature Modules

Each feature module must own its relevant UI, logic, data requirements and permissions.

Shared components and services may be reused, but unrelated features must not become tightly coupled.

## 4. Home Page — Highest UI Flexibility

The Home Page is the application's most frequently changeable UI surface.

It must use an architecture distinct from the standard layouts of other application pages.

### 4.1 Independent design

- Home can be redesigned without redesigning Study, Practice or other pages.
- Home layout changes must not break the PDF viewer or question system.
- Home-specific styling and layout decisions must remain isolated from unrelated page styling.
- Shared design tokens and reusable components may be used without forcing every page to share the same layout.

### 4.2 Modular Home sections

Each major Home section must be independently configurable and replaceable.

Initial sections:

1. Hero banner
2. Featured students
3. Explore PageWise / feature discovery
4. Weekly and monthly leaderboard
5. Badges and achievements
6. Events and challenges
7. Notices and announcements
8. Affiliate recommendations
9. Sponsored content
10. Footer and informational links

Sections may later be added, removed, reordered, hidden, redesigned or replaced without restructuring the entire Home Page.

### 4.3 Configuration-driven extensibility

The architecture should support configuration-driven section management.

Where practical, authorized administrators should eventually be able to:

- Enable or disable a section.
- Change its order.
- Update supported content.
- Select supported layout variants.
- Configure visibility and presentation.
- Introduce new section types through a controlled extension mechanism.

A new section type may still require implementation work. The architecture must not assume that arbitrary new functionality can be created solely through configuration.

### 4.4 Responsive behavior

Home must support desktop, tablet and mobile layouts.

Responsive presentation must be designed as part of the Home system rather than added as an afterthought.

## 5. Landing Page and Authenticated Home

### Public landing experience

Its purpose is to introduce PageWise and encourage visitors to get started.

It may display:

- Hero banner and primary calls to action
- Product and feature introductions
- Featured students and achievements
- Public leaderboard information
- Events and challenges
- Public notices
- Affiliate recommendations
- Clearly identified sponsor placements
- About, contact, privacy and terms links

Public content must not expose private student information or authenticated-only data.

### Authenticated Home

Its purpose is to serve as the user's central application hub.

It may display:

- Personalized welcome content
- Relevant feature shortcuts
- Continue-learning entry points
- Student community and achievement highlights
- Leaderboard and challenge information
- Notices, affiliate content and sponsorships

The exact personalized content and its priority may evolve without changing the core architecture.

## 6. Navigation and Feature Integration

The application will use a central navigation system.

Initial navigation:

- Home
- Study
- Practice
- Progress
- Bookmarks
- Settings

The navigation must support future feature entries.

Adding a feature must not require rewriting the navigation system. New entries should be integrated through a controlled, consistent registration or configuration mechanism.

The Home Page's section list and the application's navigation list are separate concepts. A feature may exist in navigation without occupying a permanent Home section, and a Home section may promote a feature without duplicating its implementation.

## 7. Study Module

Study is an independent feature, not the Home Page itself.

Its initial experience will follow the previously discussed design concept, including:

- Continue Studying
- Recent Chapters
- Study progress
- Quick Actions
- Chapter access and study-related navigation

The planned NCERT reading experience will support a custom PDF viewer, page tracking and associated questions.

Where appropriate, a chapter page and its expected questions can be displayed side by side.

The PDF viewer, page mapping, question storage and study logic must remain independent of Home's layout implementation.

## 8. Reusable Components and Design System

The application should provide reusable components for recurring patterns, including:

- Cards
- Banners
- Student profile cards
- Badges
- Achievement indicators
- Notices
- Sponsor placements
- Affiliate cards
- Buttons
- Navigation elements
- Loading, empty and error states

Shared components should be configurable enough to support different layouts without introducing unnecessary dependencies between pages.

Home-specific composition must remain independent even when it uses shared components.

## 9. Student Profiles, Leaderboards and Achievements

The platform may feature students who have explicitly agreed to participate.

- Student images and profiles must be displayed with appropriate permission.
- Featured status and badges must not imply unearned qualifications.
- Leaderboards must use documented, consistent ranking criteria.
- Weekly and monthly ranking periods must be defined consistently.
- Achievement rules must be distinguishable from promotional labels.
- Private account information must not appear in public profiles.

The exact ranking algorithm and achievement rules are implementation decisions that require separate specification.

## 10. Sponsors and Affiliate Content

Sponsored content and affiliate recommendations are separate content categories.

- Sponsored placements must be clearly labelled.
- Affiliate relationships must be disclosed appropriately.
- Promotional content must not be presented as an objective student achievement.
- Content management must be separate from the core Study and Practice functionality.
- Promotional sections must be independently enabled, disabled and reordered.

The architecture must permit future commercial features without making them mandatory dependencies of the learning experience.

## 11. Authentication, Authorization and Privacy

The initial authentication journey includes three onboarding screens followed by Google Sign-In.

Authentication and authorization must be separated from presentation logic.

The implementation must distinguish public visitors, authenticated users and authorized administrative roles.

Private content and administrative operations must be protected by server-side authorization and appropriate database/storage policies. Hiding a UI control is not sufficient authorization.

Onboarding completion, returning-user behavior, profile visibility and consent requirements must be defined during implementation planning.

## 12. Future Feature Extension

Future features must be addable without redesigning the entire application.

The architecture should support:

- Independent feature modules
- Controlled navigation registration
- Reusable UI components
- Extensible Home sections
- Separate data models and service boundaries where appropriate
- Explicit permissions and access rules
- Feature-specific loading, error and empty states
- Safe feature removal without breaking unrelated modules

A feature should not be allowed to modify unrelated modules implicitly.

## 13. Implementation and Change Control

Before implementation, the existing repository must be reviewed to map this specification onto the actual codebase.

Implementation should proceed incrementally, with tests and clear separation of concerns.

The project should use the existing GitHub workflow and appropriate review/merge procedures.

Any proposed change to a locked decision must include:

1. The decision being changed
2. Why the change is needed
3. Its impact on existing features
4. The proposed alternative
5. Approval before implementation

Future additions are allowed. Silent changes to locked architecture are not.

## 14. Non-Goals and Boundaries

This specification does not authorize immediate implementation.

It does not finalize:

- Every visual detail
- Every database schema
- Exact leaderboard algorithms
- Sponsor management workflows
- Every future feature
- Detailed admin-panel screens
- Deployment or migration changes

These require separate planning while remaining consistent with this specification.

## 15. Acceptance Criteria

The architecture will be considered compliant when:

- Home can be redesigned independently of other application pages.
- Home sections can be managed independently.
- Future sections can be registered without rewriting Home's core layout.
- Navigation can accommodate new feature modules.
- Study's PDF viewer and question functionality are isolated from Home presentation.
- Public and authenticated experiences have appropriate content boundaries.
- Shared components are reusable without forcing all pages into the same layout.
- Authentication, permissions and private data are protected appropriately.
- New features can be introduced incrementally without destabilizing unrelated functionality.

---

**Locked principle:** PageWise must be designed for future change. Home is an independently extensible UI system, and every major feature must remain sufficiently modular to evolve without requiring unrelated parts of the application to be rebuilt.
