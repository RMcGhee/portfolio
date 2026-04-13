# portfolio

A personal portfolio site built with React, Vite, and TypeScript, deployed to Cloudflare Pages.

## Tech Stack

- **Runtime / Package Manager:** [Bun](https://bun.sh/)
- **Build Tool:** [Vite 8](https://vite.dev/) (powered by Rolldown + Oxc)
- **Framework:** [React 18](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Routing:** [TanStack Router](https://tanstack.com/router)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query)
- **UI:** [MUI (Material UI) 5](https://mui.com/)
- **Charts:** [Chart.js](https://www.chartjs.org/) via [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/) via [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## Prerequisites

- [Bun](https://bun.sh/) (v1.3+)
- [Node.js](https://nodejs.org/) (v20.19+ or v22.12+)

## Getting Started

Install dependencies:

```sh
bun install
```

## Available Scripts

### `bun run dev`

Starts the Vite development server with hot module replacement.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `bun run build`

Runs the TypeScript compiler (`tsc -b`) and then builds the app for production using Vite.\
Output is written to the `dist/` directory.

### `bun run preview-local`

Serves the production build locally using Vite's built-in preview server.

### `bun run preview`

Builds the app and serves it locally using Wrangler (Cloudflare Pages dev server).\
Useful for testing the deployment environment locally.

### `bun run deploy`

Builds the app and deploys it to Cloudflare Pages via Wrangler.