"use client";

import { SessionProvider } from "next-auth/react";

// SessionProvider uses React Context so it must live inside a client component
// layout.tsx is a server component by default so I wrap SessionProvider here
// and import this Providers component into the layout
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}