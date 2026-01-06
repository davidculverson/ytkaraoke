#!/bin/bash
# Karaoke App Deployment Script for Alpine Linux
# Run this on a fresh Alpine VM

set -e

echo "=== Karaoke App Deployment ==="

# Enable community repository
echo "Enabling community repository..."
sed -i 's/#.*\/community/\/community/' /etc/apk/repositories

# Update and install Docker
echo "Installing Docker..."
apk update
apk add docker docker-compose git

# Enable and start Docker
echo "Starting Docker..."
rc-update add docker default
service docker start

# Wait for Docker to be ready
sleep 3

# Create app directory
echo "Setting up application..."
mkdir -p /opt/karaoke/certs
cd /opt/karaoke

# If git repo URL is provided, clone it
if [ -n "$1" ]; then
    echo "Cloning repository from $1..."
    git clone "$1" app
    cd app
else
    echo "No git URL provided. Please copy files to /opt/karaoke/app"
    echo "Then run: cd /opt/karaoke/app && docker-compose up -d"
    exit 0
fi

# Copy certificates (user must do this manually)
echo ""
echo "=== IMPORTANT ==="
echo "Copy your TLS certificates to /opt/karaoke/certs/"
echo "  - fullchain.pem"
echo "  - privkey.pem"
echo ""
echo "From Windows, use SCP:"
echo "  scp C:\\Certbot\\live\\karaoke.culverson.me\\fullchain.pem root@<vm-ip>:/opt/karaoke/certs/"
echo "  scp C:\\Certbot\\live\\karaoke.culverson.me\\privkey.pem root@<vm-ip>:/opt/karaoke/certs/"
echo ""

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local template..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_CONVEX_URL=https://earnest-stork-764.convex.cloud
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-client-secret
EOF
    echo "Edit /opt/karaoke/app/.env.local with your values"
fi

echo ""
echo "=== Deployment Ready ==="
echo "After copying certs and editing .env.local, run:"
echo "  cd /opt/karaoke/app"
echo "  docker-compose up -d --build"
echo ""
echo "Your app will be available at https://karaoke.culverson.me"
