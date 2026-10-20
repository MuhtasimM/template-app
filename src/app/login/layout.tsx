import { TopBar } from "@/components/TopBar";

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return (
    <>
      <TopBar isLoggedIn={false} />
      <main className="mx-auto w-full max-w-3xl px-6 py-12">{children}</main>
    </>
  );
}
