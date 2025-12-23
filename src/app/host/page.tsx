import { Metadata } from "next"
import ManageRoomsClient from "./manage"

export const metadata: Metadata = {
    title: "Manage rooms",
}

export default function ManageRoomsPage() {
    // Use client-side querying since anonymous auth happens on client
    return <ManageRoomsClient />
}
