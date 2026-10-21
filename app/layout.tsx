import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Be_Vietnam_Pro } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const font = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "Page Builder CRM",
  description: "Quản lý nội dung hiển thị trên website bán hàng",
};

/** Root layout: global styles and client providers. */
const RootLayout = ({ children }: { children: ReactNode }): React.JSX.Element => (
  <html lang="vi">
    <body className={`${font.variable} font-sans`}>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
