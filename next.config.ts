import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    rewrites: async () => {
        return [
            {
                source: "/flask/:path*",
                destination:
                    process.env.NODE_ENV === "development"
                        ? "http://127.0.0.1:5328/flask/:path*"
                        : "https://songup-flask-api.azurewebsites.net/flask/:path*",
            },
            {
                source: "/relay-iljT/static/:path*",
                destination: "https://eu-assets.i.posthog.com/static/:path*",
            },
            {
                source: "/relay-iljT/:path*",
                destination: "https://eu.i.posthog.com/:path*",
            },
        ]
    },
    images: {
        remotePatterns: [
            {
                hostname: "*.googleusercontent.com",
            },
        ],
    },
    skipTrailingSlashRedirect: true,
    allowedDevOrigins: ["karaoke.culverson.me"],
}

export default nextConfig
