# OpenBoards Design Rules

## Components

- Use shadcn/ui primitives only (Button, Input, Textarea, Select, Dialog, Drawer, Dropdown, Tabs, Table, Badge, Avatar, Tooltip, Toast, Skeleton, Pagination, Command, Breadcrumb, Form).
- Install components on-demand as features are implemented.

## Patterns

- Feedback pages (public + private) are single pages:
  - New post form and post detail open in `Dialog` overlays (URL-driven with search params).
  - Keep list context visible in the background.
- Use consistent spacing/typography via Tailwind presets.
- Empty states + loading skeletons for all lists.

## Accessibility

- Keyboard-first: dialog focus trap, Escape to close, aria labels.
- Color contrast for badges/status.
- Form labels and descriptions; visible error messages.

## Forms

- Validate with Zod; use shadcn `Form` wrapper.
- Submit: optimistic UI where safe; show toasts on success/error.

## Content

- Public copy uses clear, friendly language.
- Anonymous comments: optional display name; default “Anonymous”.
