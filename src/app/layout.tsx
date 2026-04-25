import { ReactNode } from "react";
import "@/app/globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import Providers from "@/app/providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
