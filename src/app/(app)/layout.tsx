import { TopBar } from "@/components/TopBar";

// Every page in this folder needs the password: src/proxy.ts sends logged-out
// visitors to /login. The (app) folder name doesn't appear in URLs.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar isLoggedIn />
      <main className="mx-auto w-full max-w-3xl px-6 py-12">{children}</main>
    </>
  );
}
