# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 landing page project for an AI navigation/directory website ("AI 导航"). The site features a modern, component-based architecture with shadcn/ui components, dark mode theming, and Tailwind CSS v4 styling. The content is primarily in Chinese.

## Development Commands

### Package Management
- **Install dependencies**: `pnpm install` (uses pnpm, not npm)
- **Add dependency**: `pnpm add <package>`
- **Add dev dependency**: `pnpm add -D <package>`

### Development & Build
- **Start dev server**: `pnpm dev` (runs on http://localhost:3000)
- **Build for production**: `pnpm build`
- **Start production server**: `pnpm start`
- **Lint code**: `pnpm lint`

Note: TypeScript build errors are ignored in production builds (`ignoreBuildErrors: true` in next.config.mjs).

## Architecture & Structure

### Technology Stack
- **Framework**: Next.js 16.0.0 (App Router)
- **React**: v19.2.0 with React Server Components
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui (New York style) + Radix UI primitives
- **Theme**: Custom OKLCH color system with dark mode default
- **Icons**: lucide-react
- **Analytics**: Vercel Analytics

### Project Structure

```
router-park/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata, fonts, dark mode
│   ├── page.tsx            # Home page (landing page sections)
│   └── globals.css         # Global styles, Tailwind imports, CSS variables
├── components/             # Feature components
│   ├── ui/                 # shadcn/ui components (50+ components)
│   ├── header.tsx          # Site header with navigation
│   ├── hero.tsx            # Hero section
│   ├── features.tsx        # Features section
│   ├── how-it-works.tsx    # How it works section
│   ├── testimonials.tsx    # Testimonials section
│   ├── pricing.tsx         # Pricing section
│   ├── faq.tsx             # FAQ section
│   ├── footer.tsx          # Site footer
│   └── theme-provider.tsx  # Theme context provider
├── hooks/                  # Custom React hooks
│   ├── use-mobile.ts       # Mobile detection hook
│   └── use-toast.ts        # Toast notification hook
├── lib/                    # Utilities
│   └── utils.ts            # cn() helper for className merging
└── components.json         # shadcn/ui configuration
```

### Path Aliases
All imports use the `@/` alias which maps to the project root:
- `@/components` → components directory
- `@/lib/utils` → lib/utils.ts
- `@/hooks` → hooks directory
- `@/components/ui` → components/ui directory

### Styling System

**Tailwind CSS v4 with PostCSS**: This project uses the new Tailwind v4 which has a different configuration system:
- Global styles in `app/globals.css` (not `tailwind.config.js`)
- Custom variant: `@custom-variant dark (&:is(.dark *))`
- OKLCH color system for better perceptual uniformity
- CSS variables for theming (`--background`, `--foreground`, etc.)
- Custom radius values (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`)

**Theme**: Dark mode is default (set in `app/layout.tsx` with `className="dark"`).

### Component Patterns

**Landing Page Structure**: The home page (`app/page.tsx`) is composed of section components imported from `/components`:
1. Header (navigation)
2. Hero
3. Features
4. How It Works
5. Testimonials
6. Pricing
7. FAQ
8. Footer

**shadcn/ui Components**: 50+ pre-built UI components in `components/ui/`. When adding new components, use:
```bash
npx shadcn@latest add <component-name>
```

The configuration in `components.json` ensures components are added to the correct directories with proper aliases.

**Client Components**: Most feature components use `"use client"` directive as they include interactivity (buttons, links, etc.).

### Key Configuration Notes

1. **Images**: Unoptimized images enabled (`images.unoptimized: true`) in next.config.mjs
2. **TypeScript**: Strict mode on, but build errors ignored for production builds
3. **Fonts**: Uses Geist and Geist Mono from Google Fonts
4. **Language**: Site is in Chinese (`lang="zh-CN"` in layout.tsx)
5. **Analytics**: Vercel Analytics integrated in root layout

## Adding New UI Components

To add a shadcn/ui component:
```bash
npx shadcn@latest add button  # Example
```

This will automatically:
- Add the component to `components/ui/`
- Use the configured aliases from `components.json`
- Apply the New York style variant
- Include necessary dependencies

## Working with Styles

When adding custom styles:
1. Use Tailwind utility classes first
2. Use CSS variables for theme colors (e.g., `bg-background`, `text-foreground`)
3. Add global styles to `app/globals.css` in the `@layer base` section if needed
4. Use the `cn()` utility from `@/lib/utils` to merge className strings conditionally

## Forms and Validation

The project includes:
- `react-hook-form` for form management
- `@hookform/resolvers` for validation
- `zod` for schema validation

When creating forms, follow the pattern of combining these three libraries for type-safe form handling.
