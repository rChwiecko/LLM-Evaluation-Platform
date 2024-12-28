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
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
