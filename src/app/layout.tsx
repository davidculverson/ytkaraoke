import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import { getURL } from "@/lib/utils"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    metadataBase: new URL(getURL()),
    title: { default: "YouTube Karaoke", template: "%s | YouTube Karaoke" },
    description:
        "YouTube Karaoke - A playlist-based karaoke queue system using YouTube Premium.",
    keywords: ["karaoke", "youtube", "playlist", "music", "queue"],
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers>{children}</Providers>
                <Toaster richColors theme="light" />
            </body>
        </html>
    )
}
