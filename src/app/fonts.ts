import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

export const fontSans = localFont({
  src: [
    {
      path: "../fonts/switzer-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/switzer-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/switzer-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/switzer-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
