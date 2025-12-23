import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.test.ts", "tests/youtube-premium/**/*.test.ts"],
        exclude: ["tests/azure/**/*.test.ts", "node_modules"],
        reporters: ["verbose"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/features/youtube-premium/**/*.ts"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
