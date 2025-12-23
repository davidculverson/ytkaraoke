"use client"

import { api } from "@/convex/_generated/api"
import { useAuthedMutation } from "@/lib/auth"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import posthog from "posthog-js"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { SubmitButton } from "../ui/submit-button"
import { APIPlaylist, PlaylistPicker } from "./playlist-picker"

type PlaybackMode = "embed" | "youtube-premium"

export function CreateRoom({ children }: { children?: React.ReactNode }) {
    const [playlist, setPlaylist] = useState<APIPlaylist | null>(null)
    const [loading, setLoading] = useState(false)
    const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("embed")

    const router = useRouter()

    const createRoom = useAuthedMutation(api.rooms.manage.createRoom)

    async function handleCreateRoom(formData: FormData) {
        await createRoom({
            maxSongsPerUser: Number(formData.get("maxSongsPerUser")),
            fallbackSongs: playlist
                ? playlist.tracks.map((track) => ({
                      videoId: track.videoId,
                      title: track.title,
                      artist: track.artists[0].name,
                      duration: track.duration_seconds,
                  }))
                : undefined,
            playbackMode,
        }).then((data) => {
            toast.success("Room created")
            posthog.capture("room_created", {
                id: data.roomId,
                code: data.code,
                maxSongsPerUser: formData.get("maxSongsPerUser"),
                playbackMode,
                fallbackPlaylist: playlist && {
                    id: playlist.id,
                    title: playlist.title,
                    author: playlist.author.name,
                    description: playlist?.description,
                    trackCount: playlist.trackCount,
                },
            })
            router.push(`/host/${data.code}`)
        })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <PlusIcon className="size-4" /> Create Room
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Room</DialogTitle>
                </DialogHeader>
                <form
                    action={handleCreateRoom}
                    className="flex w-full flex-col gap-4"
                >
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="maxSongsPerUser">
                            Max songs per user
                        </Label>
                        <Input
                            id="maxSongsPerUser"
                            name="maxSongsPerUser"
                            defaultValue="2"
                            min="1"
                            required
                            type="number"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="fallbackPlaylist">
                            Select a fallback playlist
                        </Label>
                        <PlaylistPicker
                            id="fallbackPlaylist"
                            value={playlist}
                            onLoadingChange={setLoading}
                            onChange={setPlaylist}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Playback Mode</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={playbackMode === "embed" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setPlaybackMode("embed")}
                            >
                                Embedded Player
                            </Button>
                            <Button
                                type="button"
                                variant={playbackMode === "youtube-premium" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setPlaybackMode("youtube-premium")}
                            >
                                YouTube Premium
                            </Button>
                        </div>
                        {playbackMode === "youtube-premium" && (
                            <p className="text-sm text-muted-foreground">
                                Uses your YouTube Premium account. No ads, all videos work.
                            </p>
                        )}
                    </div>
                    <SubmitButton disabled={loading}>Create Room</SubmitButton>
                </form>
            </DialogContent>
        </Dialog>
    )
}
