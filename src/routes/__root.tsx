import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { DeliveryProvider } from "@/context/delivery-context";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "DocSnap — Foto. Match. Hotovo." },
      { name: "description", content: "Odfoť dodací list, odfoť paletu, dostaneš match report." },
      { name: "theme-color", content: "#0D9488" },
      { property: "og:title", content: "DocSnap — Foto. Match. Hotovo." },
      { property: "og:description", content: "Odfoť dodací list, odfoť paletu, dostaneš match report." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "DocSnap — Foto. Match. Hotovo." },
      { name: "twitter:description", content: "Odfoť dodací list, odfoť paletu, dostaneš match report." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/eU0aQ5bgBkWB2HAdkDQMmdOJG6C2/social-images/social-1779181763490-Logo.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/eU0aQ5bgBkWB2HAdkDQMmdOJG6C2/social-images/social-1779181763490-Logo.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <DeliveryProvider>
        <div className="mx-auto min-h-screen w-full max-w-[480px] bg-background shadow-[0_0_0_1px_var(--color-line)] md:my-4 md:min-h-[calc(100vh-2rem)] md:rounded-2xl md:shadow-xl">
          <Outlet />
        </div>
        <Toaster position="top-center" richColors />
      </DeliveryProvider>
    </QueryClientProvider>
  );
}
