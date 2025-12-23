/* eslint-disable no-restricted-imports */
import {
    internalMutation as rawInternalMutation,
    mutation as rawMutation,
} from "./_generated/server"
/* eslint-enable no-restricted-imports */
import {
    customCtx,
    customMutation,
} from "convex-helpers/server/customFunctions"
import { Triggers } from "convex-helpers/server/triggers"
import { DataModel } from "./_generated/dataModel"

// start using Triggers, with table types from schema.ts
const triggers = new Triggers<DataModel>()

// Cascade delete all songs in a room when the room is deleted
triggers.register("rooms", async (ctx, change) => {
    if (change.operation === "delete") {
        // Delete all queued songs for this room
        for await (const song of ctx.db
            .query("queuedSongs")
            .withIndex("by_room_type", (q) => q.eq("room", change.id))) {
            await ctx.db.delete(song._id)
        }

        // Delete YouTube session for this room
        // Note: The actual YouTube playlist deletion should be handled
        // by a separate scheduled job or API call since it requires
        // external API access which isn't available in triggers
        const youtubeSession = await ctx.db
            .query("youtubeSessions")
            .withIndex("by_room", (q) => q.eq("roomId", change.id))
            .unique()
        if (youtubeSession) {
            await ctx.db.delete(youtubeSession._id)
        }
    }
})

// create wrappers that replace the built-in `mutation` and `internalMutation`
// the wrappers override `ctx` so that `ctx.db.insert`, `ctx.db.patch`, etc. run registered trigger functions
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB))
export const internalMutation = customMutation(
    rawInternalMutation,
    customCtx(triggers.wrapDB),
)
