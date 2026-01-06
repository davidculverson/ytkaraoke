import { cronJobs } from "convex/server"

const crons = cronJobs()

// Cron jobs can be added here as needed
// For example, to clean up expired karaoke sessions:
// crons.hourly(
//     "clean expired sessions",
//     { minuteUTC: 0 },
//     internal.karaoke.cleanExpiredSessions,
// )

export default crons
