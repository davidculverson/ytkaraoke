import { NextResponse } from "next/server"
import { clearAllCache, getCacheStats } from "../search/route"

// GET - Get cache stats
export async function GET() {
    try {
        const stats = getCacheStats()
        return NextResponse.json({
            entries: stats.entries,
            oldestAgeMs: stats.oldestMs,
            newestAgeMs: stats.newestMs,
            oldestAgeHuman: stats.oldestMs ? formatDuration(stats.oldestMs) : null,
            newestAgeHuman: stats.newestMs ? formatDuration(stats.newestMs) : null,
        })
    } catch (error) {
        console.error("Cache stats error:", error)
        return NextResponse.json({ error: "Failed to get cache stats" }, { status: 500 })
    }
}

// DELETE - Clear all cache
export async function DELETE() {
    try {
        const result = clearAllCache()
        return NextResponse.json({
            success: true,
            message: `Cleared ${result.cleared} cached entries`,
            cleared: result.cleared,
        })
    } catch (error) {
        console.error("Cache clear error:", error)
        return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 })
    }
}

function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h ago`
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
}
