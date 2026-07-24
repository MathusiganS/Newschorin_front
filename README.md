# NewsChorin Frontend

Next.js frontend for the NewsChorin Tamil news portal. It provides the public
home page, latest news page, article detail page, and admin panel UI.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint

## Requirements

- Node.js 20 or newer recommended
- npm
- Backend API running on `http://127.0.0.1:4000`

## Quick Start

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend dev server runs on port `5173`.

## Environment Variables

Create or update `.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000
```

This value is used for backend API calls and image URLs.

`next.config.ts` also rewrites these paths to the backend:

- `/api/:path*` -> backend `/api/:path*`
- `/images/:path*` -> backend `/images/:path*`

For production, set `NEXT_PUBLIC_API_BASE_URL` or `BACKEND_URL` to the deployed
backend URL.

## Available Scripts

```bash
npm run dev
```

Starts the local Next.js dev server on port `5173`.

```bash
npm run build
```

Creates a production build and checks TypeScript.

```bash
npm run start
```

Starts the built Next.js app.

```bash
npm run lint
```

Runs ESLint across the frontend project.

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Home page with featured, latest, trending, and category news |
| `/latest` | Latest approved news, paginated from the backend |
| `/article/[id]` | Full article detail page |
| `/admin` | Admin login and moderation panel |

## Important Source Files

```text
src/app/
  layout.tsx              App shell and metadata
  page.tsx                Home route
  latest/page.tsx         Latest news route
  article/[id]/page.tsx   Article detail route
  admin/page.tsx          Admin route

src/components/
  Header.tsx              Logo, search, desktop nav, mobile category menu
  Footer.tsx              Footer logo and category links

src/views/
  HomePage.tsx            Home page UI and data loading
  LatestPage.tsx          Latest page UI and pagination
  ArticlePage.tsx         Article detail, print behavior, related stories
  AdminPage.tsx           Admin table, filters, approval/rejection workflow

src/lib/
  api.ts                  API helper functions and backend URL normalization
  datetime.ts             Sri Lanka date/time formatting helpers

src/constants/
  tamilCategories.ts      Tamil category names shared by navigation and filters

public/images/
  Logo.jpg                Header/footer/admin logo
  Fav_ICON.png            Browser tab icon
```

## API Usage

The frontend calls the backend through `src/lib/api.ts`.

Main public endpoints used:

- `GET /api/news`
- `GET /api/news/count`
- `GET /api/news/popular`
- `GET /api/news/trending`
- `GET /api/news/{id}`
- `POST /api/news/{id}/view`

Admin endpoints used:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/news`
- `GET /api/admin/news/{id}`
- `PUT /api/admin/news/{id}`
- `POST /api/admin/news/{id}/approve`
- `POST /api/admin/news/{id}/reject`

Admin authentication uses the backend cookie session. API requests include
`credentials: "include"` in `src/lib/api.ts`.

## News Date Display

Public news pages prefer `approved_at` when available. This means users see the
time the admin approved the news. If an older article does not have
`approved_at`, the UI falls back to `created_at`.

All displayed dates are formatted with Sri Lanka time helpers in:

```text
src/lib/datetime.ts
```

## Mobile Responsiveness Notes

The header is responsive:

- Desktop shows the full navigation row.
- Mobile shows the logo, scaled search bar, and hamburger category button.
- Mobile categories open in a dropdown and close after a category is selected.

When editing responsive UI, keep desktop classes intact and adjust mobile-first
classes before `sm`, `md`, or `lg` breakpoints.

## Development Workflow

1. Start the backend on port `4000`.
2. Start the frontend with `npm run dev`.
3. Open `http://localhost:5173`.
4. Make UI changes.
5. Run `npm run build` before handing off production changes.

## Troubleshooting

### API requests fail

Check that the backend is running:

```text
http://127.0.0.1:4000/api/health
```

Also confirm `.env` has:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4000
```

### Images do not load

Images are served by the backend from `/images`. Make sure the backend is
running and article `image` values point to valid backend image paths.

### Admin login does not work

Check backend `.env` values for:

- `ADMIN_USER`
- `ADMIN_PASS` or `ADMIN_PASSWORD_HASH`
- `JWT_SECRET`
- `CORS_ORIGINS`

The frontend origin must be included in backend `CORS_ORIGINS`.

## Production Checklist

- Set the deployed backend URL in environment variables.
- Run `npm run build`.
- Confirm public pages load approved news.
- Confirm article images load from the backend.
- Confirm admin login, approve, reject, pagination, and filters work.
