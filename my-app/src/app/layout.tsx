import { SidebarProvider } from "@/components/ui/sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="w-full h-screen flex">
          <SidebarProvider>{children}</SidebarProvider>
        </div>
      </body>
    </html>
  );
}
