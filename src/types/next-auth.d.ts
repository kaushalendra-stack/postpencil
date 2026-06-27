import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    provider?: string;
  }
}

interface Window {
  turnstile?: {
    render: (container: HTMLElement | string, options: Record<string, unknown>) => string
    remove: (widgetId: string) => void
    reset: (widgetId: string) => void
  }
}
