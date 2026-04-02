[![Netlify Status](https://api.netlify.com/api/v1/badges/29afd6fc-8952-4273-93c8-aed676e22ca6/deploy-status)](https://app.netlify.com/projects/lunim-v3-progress/deploys)

# Lunim.io

**Lunim.io** is a modern digital innovation and technology consulting company website that showcases services across multiple domains including AI automation, digital transformation, film & media production, and technology consulting..

## Table of Contents

- [Lunim.io](#lunimio)
  - [Table of Contents](#table-of-contents)
  - [🌟 What is Lunim.io?](#-what-is-lunimio)
    - [Core Features](#core-features)
    - [Website Sections](#website-sections)
  - [🚀 Tech Stack](#-tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
  - [🎯 Key Features Explained](#-key-features-explained)
    - [Luna AI Assistant](#luna-ai-assistant)
    - [Prismic CMS Architecture](#prismic-cms-architecture)
    - [Blog System](#blog-system)
    - [Academy \& Course Management](#academy--course-management)
    - [Portfolio Showcases](#portfolio-showcases)
    - [Contact System](#contact-system)
    - [SEO \& Performance](#seo--performance)
  - [📁 Project Structure](#-project-structure)
  - [🌐 Subdomain Routing Architecture](#-subdomain-routing-architecture)
    - [How It Works](#how-it-works)
    - [Adding a New Subdomain](#adding-a-new-subdomain)
      - [1. Update Middleware](#1-update-middleware)
      - [2. Create Nested Layout](#2-create-nested-layout)
      - [3. Create Page Routes](#3-create-page-routes)
      - [4. Update Prismic Link Resolver](#4-update-prismic-link-resolver)
      - [5. Update RootLayout](#5-update-rootlayout)
      - [6. Update Breadcrumbs](#6-update-breadcrumbs)
      - [7. Update SubdomainAwarePrismicLink](#7-update-subdomainawareprismiclink)
      - [8. Setup Prismic CMS](#8-setup-prismic-cms)
      - [9. Configure DNS](#9-configure-dns)
      - [10. Local Testing](#10-local-testing)
    - [Architecture Diagram](#architecture-diagram)
    - [Key Files Reference](#key-files-reference)
    - [Troubleshooting](#troubleshooting)
  - [🔌 API Endpoints Reference](#-api-endpoints-reference)
    - [Luna AI Endpoints](#luna-ai-endpoints)
    - [Content \& Communication](#content--communication)
    - [Site Management](#site-management)
  - [🛠️ Development Workflow](#️-development-workflow)
    - [Working with Prismic](#working-with-prismic)
    - [Adding New Features](#adding-new-features)
    - [Database Operations](#database-operations)
    - [Deployment](#deployment)
    - [Code Quality](#code-quality)
  - [📚 Additional Resources](#-additional-resources)

## 🌟 What is Lunim.io?

Lunim combines a sophisticated marketing website with an AI-powered assistant to help businesses discover and implement digital transformation solutions. The platform features:

### Core Features

- 🎨 **Prismic CMS Integration** - Fully headless content management with 28+ reusable slices for flexible page building
- 🌐 **Multi-Brand Subdomain System** - Dedicated experiences for different service lines (e.g., `ai.lunim.io` for AI services, `video.lunim.io` for media production)
- 🤖 **Luna AI Assistant** - Voice-first conversational AI that helps users discover solutions, with privacy modes, action plan generation, and PDF export
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS and smooth animations (Framer Motion, GSAP)
- 📊 **Content Analytics** - Blog view tracking and usage analytics
- 📧 **Contact Management** - Integrated contact forms with email notifications
- 🎓 **Academy Integration** - Course catalog with EventBrite integration
- 🎬 **Portfolio Showcases** - Digital projects and film/media work galleries

### Website Sections

- **Homepage** - Company overview and service highlights
- **Digital Portfolio** (`/digital`) - Showcase of digital transformation and software development projects
- **Media Portfolio** (`/media`) - Film production, video, and creative work
- **Blog** (`/blog`) - Articles on technology, AI, and digital innovation with view counters
- **Team** (`/our-team`) - Company team and leadership
- **Academy** (`/academy`) - Educational courses and training programs
- **Luna AI** - Interactive AI assistant accessible throughout the site

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.7 (App Router) with React 19.1.0 and Turbopack
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4.1.14
- **CMS**: Prismic (headless content management)
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI (GPT-4, Whisper, TTS)
- **Email**: Resend API
- **Deployment**: Netlify with Next.js plugin
- **Animation**: Framer Motion 12.23.22, GSAP 3.13.0

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Prismic account
- Supabase project (optional, for Luna features)

### Installation

```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Preview production build
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Prismic CMS
NEXT_PUBLIC_PRISMIC_ENVIRONMENT=your-repo-name

# Supabase Database (for Luna conversations and blog analytics)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI (for Luna AI features)
OPENAI_API_KEY=your-openai-key

# Email Service (for contact forms)
RESEND_API_KEY=your-resend-key

# EventBrite (for Academy courses)
EVENTBRITE_API_KEY=your-eventbrite-key
EVENTBRITE_ORGANIZATION_ID=your-org-id

# Site Configuration
NEXT_PUBLIC_WEBSITE_URL=https://lunim.io
```

## 🎯 Key Features Explained

### Luna AI Assistant

Luna is the standout feature of Lunim.io - a sophisticated voice-first conversational AI assistant that helps users discover digital transformation solutions.

**Location**: [src/components/Luna/](src/components/Luna/)

**Capabilities**:

- **Voice Interaction**: Speech-to-text (OpenAI Whisper) and text-to-speech (OpenAI TTS)
- **Conversational AI**: Powered by OpenAI GPT-4 with custom system prompts
- **Privacy Modes**:
  - **On-the-Record**: Conversations saved to Supabase for future reference
  - **Confidential**: Ephemeral sessions with no data persistence
- **Action Plans**: Generates structured plans with key insights and next steps
- **Clarification**: Asks follow-up questions to better understand user needs
- **Export**: Download conversation history as PDF
- **Analytics**: Usage tracking for insights and improvements

**User Flow**:

1. User opens Luna portal (floating button on all pages)
2. Selects privacy mode (on-the-record or confidential)
3. Engages via voice or text input
4. Luna provides relevant information and suggestions
5. Generates actionable plan based on conversation
6. User can export or save conversation

**Technical Implementation**:

- State management via `useReducer` with [lunaReducer.ts](src/components/Luna/lunaReducer.ts)
- API endpoints in [src/app/api/luna/](src/app/api/luna/)
- Database schema in Supabase (`luna_conversations` table)

### Prismic CMS Architecture

The entire website is content-managed through Prismic, using a component-based "Slices" architecture.

**Slices** (28+ components):

- Hero sections, testimonials, FAQ, CTAs
- Blog lists, project showcases, service grids
- Navigation menus, footers, breadcrumbs
- Video players, image galleries, stats displays

**Content Types**:

- Pages: `page`, `blog_post`, `digital_page`, `media_page`, etc.
- Navigation: `primary_navigation`, `primary_navigation_generic`
- Components: `author`, `footer`, `footer_generic`

**Workflow**:

1. Edit content in Prismic dashboard
2. Content delivered via Prismic API
3. Pages composed dynamically using SliceZone
4. ISR (Incremental Static Regeneration) for optimal performance

**Key Files**:

- [src/prismicio.ts](src/prismicio.ts) - Client setup and routing
- [src/slices/](src/slices/) - Slice components
- [customtypes/](customtypes/) - Type definitions

### Blog System

Dynamic blog with advanced features:

- **View Tracking**: Each post tracks unique views via Supabase
- **Reading Time**: Automatically calculated based on word count
- **Author Profiles**: Linked to Prismic author documents
- **Categories & Tags**: Content organization
- **SEO Optimized**: Dynamic metadata and Open Graph images
- **Responsive Images**: Next.js Image optimization

**Endpoints**:

- [src/app/blog/[uid]/page.tsx](src/app/blog/[uid]/page.tsx) - Individual posts
- [src/app/api/views/route.ts](src/app/api/views/route.ts) - View counter API

### Academy & Course Management

Integrated learning platform with EventBrite:

- **Course Catalog**: Fetched from EventBrite API
- **Event Details**: Dates, pricing, registration links
- **Dynamic Pages**: Course pages generated from EventBrite data
- **Registration**: Direct links to EventBrite checkout

**Endpoints**:

- [src/app/api/eventbrite/course/route.ts](src/app/api/eventbrite/course/route.ts) - Course data API

### Portfolio Showcases

Two dedicated portfolio sections:

**Digital Portfolio** (`/digital`):

- Software development projects
- Web applications and platforms
- AI/ML implementations
- Client success stories

**Media Portfolio** (`/media`):

- Film and video production work
- Creative campaigns
- Documentary projects
- Commercial content

Both use Prismic custom types with rich media support (images, videos, case studies).

### Contact System

Integrated contact forms throughout the site:

- **Forms**: Contact page, service inquiries, consultation requests
- **Email Service**: Resend API for reliable delivery
- **Validation**: Client and server-side validation
- **Confirmation**: Auto-response emails to users

**Endpoint**: [src/app/api/contact/route.ts](src/app/api/contact/route.ts)

### SEO & Performance

**SEO Features**:

- Dynamic metadata generation per page
- Open Graph images via [src/app/api/og/route.ts](src/app/api/og/route.ts)
- Sitemap auto-generation [src/app/sitemap.ts](src/app/sitemap.ts)
- Robots.txt configuration
- JSON-LD structured data

**Performance Optimizations**:

- ISR (Incremental Static Regeneration) with tag-based revalidation
- Next.js Image optimization
- Turbopack for faster builds
- Code splitting and lazy loading
- Netlify CDN and edge functions

## 📁 Project Structure

```
lunim-io/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (15 endpoints)
│   │   │   ├── luna/         # Luna AI endpoints
│   │   │   ├── contact/      # Contact form
│   │   │   ├── views/        # Blog view counter
│   │   │   ├── eventbrite/   # Academy integration
│   │   │   ├── og/           # Open Graph images
│   │   │   └── ...
│   │   ├── (subdomains)/     # Subdomain routes
│   │   │   ├── ai-automation/
│   │   │   └── video/
│   │   ├── academy/          # Course pages
│   │   ├── blog/             # Blog pages
│   │   ├── digital/          # Digital portfolio
│   │   ├── media/            # Media portfolio
│   │   ├── our-team/         # Team page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── Luna/            # Luna AI assistant
│   │   └── ...
│   ├── slices/              # Prismic slices (28+)
│   │   ├── Hero/
│   │   ├── NavigationMenu/
│   │   ├── Footer/
│   │   ├── BlogList/
│   │   └── ...
│   ├── lib/                 # Utilities and clients
│   │   ├── supabaseServer.ts
│   │   └── prismicImage.ts
│   ├── utils/               # Helper functions
│   ├── hooks/               # Custom React hooks
│   ├── assets/              # Static assets
│   ├── middleware.ts        # Subdomain routing
│   └── prismicio.ts         # Prismic config
├── customtypes/             # Prismic type definitions
├── public/                  # Public static files
├── netlify.toml            # Netlify config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

## 🌐 Subdomain Routing Architecture

This application supports multi-tenant subdomain routing, allowing brand-specific experiences on different subdomains (e.g., `ai.lunim.io` for AI Automation).

### How It Works

The subdomain routing system uses a combination of:

1. **Next.js Middleware** ([src/middleware.ts](src/middleware.ts)) - Detects subdomain and rewrites URLs internally
2. **Domain-Aware Layouts** ([src/app/layout.tsx](src/app/layout.tsx)) - Fetches subdomain-specific navigation/footer from Prismic
3. **Nested Layouts** - Brand-specific CSS per subdomain
4. **Link Transformation** ([src/components/SubdomainAwarePrismicLink.tsx](src/components/SubdomainAwarePrismicLink.tsx)) - Clean URLs on subdomains

**Example Flow:**

```
User visits: ai.lunim.io/page
         ↓
Middleware rewrites to: /ai-automation/page (internal routing)
         ↓
Next.js renders: src/app/(subdomains)/ai-automation/[uid]/page.tsx
         ↓
Links on page strip prefix: /page (displayed in browser)
```

### Adding a New Subdomain

Follow these steps to add a new subdomain (e.g., `web3.lunim.io`):

#### 1. Update Middleware

Edit [src/middleware.ts](src/middleware.ts:12-14):

```typescript
const subdomainRoutes: Record<string, string> = {
  "ai": "/ai-automation",
  "web3": "/web3-services", // Add new mapping
};
```

#### 2. Create Nested Layout

Create `src/app/(subdomains)/web3-services/layout.tsx`:

```typescript
import "./brand.css";

export default function Web3ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

Create `src/app/(subdomains)/web3-services/brand.css`:

```css
:root {
  --web3-brand-primary: #ff6b00;
  --web3-brand-secondary: #00ff88;
  /* Add your brand colors */
}
```

#### 3. Create Page Routes

**Homepage** - `src/app/(subdomains)/web3-services/page.tsx`:

```typescript
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { generateMetaDataInfo, pickBaseMetadata } from "@/utils/metadataHelpers";

export default async function Web3ServicesPage() {
  const client = createClient();
  const doc = await client.getSingle("web3_services").catch(() => null);

  if (!doc) notFound();

  return (
    <main className="bg-black">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client.getSingle("web3_services").catch(() => null);

  if (!doc) {
    return { title: "Web3 Services", description: "..." };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, true);
}
```

**Dynamic Pages** - `src/app/(subdomains)/web3-services/[uid]/page.tsx`:

```typescript
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { generateMetaDataInfo, pickBaseMetadata } from "@/utils/metadataHelpers";

type Params = { uid: string };

export default async function Web3ServicesDynamicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;
  const client = createClient();
  const doc = await client
    .getByUID("web3_services_page", uid)
    .catch(() => null);

  if (!doc) notFound();

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={doc.data?.slices} components={components} />
    </main>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType("web3_services_page");
  return docs.map((d) => ({ uid: d.uid! }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client
    .getByUID("web3_services_page", uid)
    .catch(() => null);

  if (!doc) {
    return { title: "Web3 Services", description: "..." };
  }

  return generateMetaDataInfo(
    doc.data,
    parentMetaData,
    false,
    false,
    ["web3-services", uid]
  );
}
```

#### 4. Update Prismic Link Resolver

Edit [src/prismicio.ts](src/prismicio.ts:47-90):

```typescript
export const linkResolver: LinkResolverFunction = (link) => {
  // ... existing routes

  // Add Web3 routes
  if (link.type === "web3_services_page") {
    if (link.uid) return `/web3-services/${encodeURIComponent(link.uid)}`;
  }
  if (link.type === "web3_services") {
    return "/web3-services";
  }

  return undefined;
};

const routes: Route[] = [
  // ... existing routes
  { type: "web3_services", path: "/web3-services" },
  { type: "web3_services_page", path: "/web3-services/:uid" },
];
```

#### 5. Update RootLayout

Edit [src/app/layout.tsx](src/app/layout.tsx:50-69):

**In `getSiteKey()` function**:

```typescript
function getSiteKey(hostname: string): "main" | "ai" | "web3" {
  const subdomain = hostname.split(".")[0];
  if (subdomain === "ai" && !hostname.startsWith("www")) {
    return "ai";
  }
  if (subdomain === "web3" && !hostname.startsWith("www")) {
    return "web3";
  }
  return "main";
}
```

**In `generateMetadata()` function**:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "lunim.io";
  const siteKey = getSiteKey(hostname);

  let baseUrl: string;
  let siteName: string;

  if (siteKey === "ai") {
    baseUrl = `https://${hostname}`;
    siteName = "Lunim AI Automation";
  } else if (siteKey === "web3") {
    baseUrl = `https://${hostname}`;
    siteName = "Lunim Web3 Services";
  } else {
    baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "https://lunim.io";
    siteName = "Lunim";
  }

  // ... rest of metadata
}
```

**In `RootLayout()` function**:

```typescript
const domainMap: Record<string, string> = {
  "ai": "ai-automation",
  "web3": "web3-services", // Add mapping
};
```

#### 6. Update Breadcrumbs

Edit [src/slices/Breadcrumbs/index.tsx](src/slices/Breadcrumbs/index.tsx:27-33):

**In `getSiteKey()` function**:

```typescript
function getSiteKey(hostname: string): "main" | "ai" | "web3" {
  const subdomain = hostname.split(".")[0];
  if (subdomain === "ai" && !hostname.startsWith("www")) {
    return "ai";
  }
  if (subdomain === "web3" && !hostname.startsWith("www")) {
    return "web3";
  }
  return "main";
}
```

**Update domain mapping**:

```typescript
const domainMap: Record<string, string> = {
  "ai": "ai-automation",
  "web3": "web3-services", // Add mapping
};
```

Edit [src/slices/Breadcrumbs/BreadcrumbsClient.tsx](src/slices/Breadcrumbs/BreadcrumbsClient.tsx:102-107):

```typescript
const homeConfig = useMemo(() => {
  if (siteKey === "ai") {
    return { href: "/ai-automation", label: "Home" };
  }
  if (siteKey === "web3") {
    return { href: "/web3-services", label: "Home" };
  }
  return { href: "/", label: "Home" };
}, [siteKey]);
```

#### 7. Update SubdomainAwarePrismicLink

Edit [src/components/SubdomainAwarePrismicLink.tsx](src/components/SubdomainAwarePrismicLink.tsx:24-45):

```typescript
const hostname = window.location.hostname;
const subdomain = hostname.split(".")[0];

// Define prefix mapping
const subdomainPrefixMap: Record<string, string> = {
  "ai": "/ai-automation",
  "web3": "/web3-services",
};

// Only transform for known subdomains
if (!(subdomain in subdomainPrefixMap) || hostname.startsWith("www")) {
  return props;
}

const prefix = subdomainPrefixMap[subdomain];
const url = asLink(props.field);
if (!url || typeof url !== "string") return props;

// Strip prefix if present
if (url.startsWith(prefix)) {
  const newUrl = url.replace(new RegExp(`^${prefix}`), "") || "/";

  return {
    ...props,
    field: { ...props.field, url: newUrl },
  } as PrismicNextLinkProps;
}
```

#### 8. Setup Prismic CMS

In your Prismic repository:

1. **Create Custom Types**:
   - `web3_services` (singleton) - Homepage for Web3 subdomain
   - `web3_services_page` (repeatable) - Dynamic pages for Web3 subdomain
   - `primary_navigation_generic` (if not exists) - For subdomain navigation
   - `footer_generic` (if not exists) - For subdomain footer

2. **Add Domain Field**:
   - In `primary_navigation_generic` and `footer_generic` custom types
   - Add a "Key Text" field named `domain`
   - Set value to match your internal routing prefix (e.g., "web3-services")

3. **Create Documents**:
   - Create navigation document with `domain = "web3-services"`
   - Create footer document with `domain = "web3-services"`
   - Create homepage document (web3_services singleton)
   - Create child pages (web3_services_page documents)

#### 9. Configure DNS

Add DNS record for your subdomain:

```
Type: CNAME
Name: web3
Value: yourdomain.netlify.app (or your hosting provider)
TTL: Auto
```

For production on custom domains, consult your DNS provider's documentation.

#### 10. Local Testing

Add to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 web3.localhost
```

Then visit: `http://web3.localhost:3000`

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│  User Request: web3.lunim.io/products                   │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Middleware (src/middleware.ts)                         │
│  • Detects subdomain: "web3"                            │
│  • Rewrites to: /web3-services/products                 │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  RootLayout (src/app/layout.tsx)                        │
│  • getSiteKey() → "web3"                                │
│  • Fetches navigation where domain="web3-services"      │
│  • Fetches footer where domain="web3-services"          │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Nested Layout                                          │
│  (src/app/(subdomains)/web3-services/layout.tsx)        │
│  • Imports brand.css with Web3 brand colors             │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Page Component                                         │
│  (src/app/(subdomains)/web3-services/[uid]/page.tsx)    │
│  • Fetches web3_services_page where uid="products"      │
│  • Renders SliceZone with page content                  │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  SubdomainAwarePrismicLink                              │
│  • Strips /web3-services prefix from URLs               │
│  • User sees: /products (not /web3-services/products)   │
└─────────────────────────────────────────────────────────┘
```

### Key Files Reference

- **[src/middleware.ts](src/middleware.ts)** - Subdomain detection and URL rewriting
- **[src/app/layout.tsx](src/app/layout.tsx)** - Domain-aware navigation/footer fetching
- **[src/prismicio.ts](src/prismicio.ts)** - Link resolver and route definitions
- **[src/components/SubdomainAwarePrismicLink.tsx](src/components/SubdomainAwarePrismicLink.tsx)** - Clean URL transformation
- **[src/slices/Breadcrumbs/](src/slices/Breadcrumbs/)** - Subdomain-aware breadcrumbs
- **[src/slices/NavigationMenu/NavigationMenuClient.tsx](src/slices/NavigationMenu/NavigationMenuClient.tsx)** - Navigation using clean links

### Troubleshooting

**Issue**: Navigation links not working on subdomain

**Solution**: Ensure you added routes to both `linkResolver` and `routes` array in [src/prismicio.ts](src/prismicio.ts)

---

**Issue**: Breadcrumbs showing duplicate home links

**Solution**: Check that `getSiteKey()` correctly identifies subdomain and returns appropriate home config

---

**Issue**: URLs showing doubled prefix (e.g., `/web3-services/web3-services/page`)

**Solution**: Verify `SubdomainAwarePrismicLink` includes your subdomain in `subdomainPrefixMap`

---

**Issue**: Main domain redirecting incorrectly

**Solution**: Middleware only redirects when pathname starts with subdomain prefix AND user is on main domain

## 🔌 API Endpoints Reference

### Luna AI Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/luna/conversation` | POST | Persist conversation history to Supabase |
| `/api/luna/plan` | POST | Generate action plans from conversation |
| `/api/luna/clarify` | POST | Get clarification questions |
| `/api/luna/whisper` | POST | Speech-to-text transcription |
| `/api/luna/tts` | POST | Text-to-speech generation |
| `/api/luna/analytics` | POST | Track Luna usage analytics |

### Content & Communication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contact` | POST | Handle contact form submissions via Resend |
| `/api/views` | GET/POST | Blog post view counter (Supabase) |
| `/api/eventbrite/course` | POST | Fetch EventBrite course data |

### Site Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/og` | GET | Generate dynamic Open Graph images |
| `/api/preview` | GET | Enable Prismic draft preview mode |
| `/api/exit-preview` | GET | Disable Prismic preview mode |
| `/api/revalidate` | POST | Trigger ISR revalidation |

## 🛠️ Development Workflow

### Working with Prismic

1. **Making Content Changes**:

   ```bash
   # No code changes needed - just edit in Prismic dashboard
   # Changes appear immediately in development (5s revalidation)
   # Production uses ISR with tag-based revalidation
   ```

2. **Creating New Slices**:

   ```bash
   npm run slicemachine  # Open Slice Machine editor
   # Create slice in UI
   # Implement component in /src/slices/[SliceName]/index.tsx
   ```

### Adding New Features

**Adding a New Page**:

1. Create custom type in Prismic (if needed)
2. Update route resolver in [src/prismicio.ts](src/prismicio.ts)
3. Create page component in `/src/app/`
4. Implement `generateMetadata()` for SEO
5. Use `SliceZone` to render Prismic content

**Adding a New API Endpoint**:

1. Create `/src/app/api/[route]/route.ts`
2. Export `GET`, `POST`, etc. as needed
3. Handle errors appropriately
4. Add CORS headers if needed for external access

**Adding Client-Side Interactivity**:

1. Create component with `"use client"` directive
2. Use hooks (useState, useEffect, etc.)
3. Consider server-side data fetching with client hydration
4. Optimize with React.lazy() for code splitting

### Database Operations

**Supabase Tables**:

- `luna_conversations` - Luna chat history
- `blog_views` - Blog view counts

**Making Schema Changes**:

1. Update schema in Supabase dashboard
2. Update TypeScript types if needed
3. Test locally before deploying

### Deployment

The site auto-deploys via Netlify on push to `production` branch:

1. **Development**: Work on feature branches (`dev_*`)
2. **Testing**: Test locally with `npm run build && npm start`
3. **Pull Request**: Create PR to `main` branch
4. **Deploy Preview**: Netlify generates preview URL
5. **Merge**: Auto-deploys to production

**Manual Revalidation**:

```bash
# Trigger ISR revalidation via webhook
curl -X POST https://lunim.io/api/revalidate?secret=YOUR_SECRET
```

### Code Quality

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Format code (if Prettier is configured)
npm run format
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Prismic Documentation](https://prismic.io/docs/nextjs) - Prismic with Next.js
- [Supabase Documentation](https://supabase.com/docs) - Database and auth
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling utilities
- [OpenAI API](https://platform.openai.com/docs) - AI integration
- [Netlify Docs](https://docs.netlify.com/) - Deployment and hosting
