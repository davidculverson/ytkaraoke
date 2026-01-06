# SongUp Karaoke

A self-hosted, open-source karaoke queue management system with YouTube integration.

## 🎉 What is SongUp?

SongUp is a collaborative karaoke queue system that allows hosts to manage a central display while participants add songs to the queue. Perfect for parties, karaoke nights, and events.

## ✨ Features

- **🎵 YouTube Integration**
  Direct integration with YouTube for video playback and automatic playlist management.

- **🔓 Anonymous Access**
  No login required for basic participation - just enter a room code and start adding songs.

- **📺 Dual Display Modes**
  - **Display Mode**: Full-screen view for TVs/projectors showing current and upcoming songs
  - **Controller Mode**: Queue management interface for hosts and participants

- **🎤 Smart Queue Management**
  - Set maximum songs per user
  - Real-time queue updates across all devices
  - Automatic YouTube playlist synchronization

- **📱 Mobile Friendly**
  Responsive design works on phones, tablets, and desktops.

- **🔐 Optional YouTube OAuth**
  Connect your YouTube account for enhanced playlist management and Premium playback benefits.

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x
- Bun package manager
- Convex account (backend)
- YouTube Data API credentials (optional, for playlist features)

### Environment Setup

Create a `.env.local` file:

```env
# Convex Backend
CONVEX_DEPLOYMENT=your-deployment-url
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# YouTube Data API (optional)
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-client-secret
YOUTUBE_API_KEY=your-api-key

# Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Install dependencies
bun install

# Start Convex backend and Next.js dev server
bun run dev

# Run tests
bun run test

# Run e2e tests
bun run test:e2e
```

### Production Deployment

#### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build
```

#### Manual Deployment

```bash
# Build the application
bun run build

# Start production server
bun run start
```

The app will be available on port 3000.

## 📖 Usage

### For Hosts

1. Navigate to `/poc/playlist`
2. Create a new session with a unique room code
3. Share the room code with participants
4. Optionally connect YouTube account for automatic playlist management
5. Use Display Mode on your main screen
6. Manage queue from Controller Mode

### For Participants

1. Enter the room code
2. Browse or search for songs
3. Add songs to the queue (subject to per-user limits set by host)
4. See your position in the queue in real-time

## 🏗️ Architecture

- **Frontend**: Next.js 16 with React 19
- **Backend**: Convex (serverless)
- **Authentication**: Convex Auth with anonymous support
- **Video**: YouTube Data API v3
- **Styling**: Tailwind CSS with shadcn/ui
- **Testing**: Vitest + Playwright

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable React components
│   ├── convex/          # Convex backend functions
│   ├── features/        # Feature-specific code
│   └── lib/             # Utilities and helpers
├── tests/               # Test files
├── public/              # Static assets
└── infra/              # Infrastructure as code (Azure Bicep)
```

## 🧪 Testing

```bash
# Unit tests
bun run test

# E2E tests
bun run test:e2e

# Watch mode
bun run test:watch
```

## 🐳 Docker Support

The application includes Docker configuration for containerized deployment:

- **Dockerfile**: Multi-stage build optimized for production
- **docker-compose.yml**: Includes app + Caddy reverse proxy
- **Caddyfile**: Automatic HTTPS configuration

## 🔧 Configuration

### YouTube Integration

To enable YouTube features:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Add credentials to `.env.local`

### Convex Setup

1. Install Convex CLI: `bun add -g convex`
2. Run `bunx convex dev` to set up your backend
3. Deploy schema and functions automatically

## 📜 License

This project is licensed under the [AGPL-3.0 License](https://www.gnu.org/licenses/agpl-3.0.html).

## 🙏 Acknowledgments

Built with Next.js, Convex, and YouTube Data API.
