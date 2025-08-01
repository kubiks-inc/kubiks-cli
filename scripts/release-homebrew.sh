#!/bin/bash
set -e

# Check if version is provided
if [ -z "$1" ]; then
    echo "Usage: ./release-homebrew.sh v1.0.6"
    exit 1
fi

VERSION=$1
VERSION_NUM=${VERSION#v}

echo "🚀 Building kubiks $VERSION for macOS..."

# Build instrumentation
cd instrumentation
npm install
npm run build
cd ..

# Build binary
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o kubiks .

# Create archive
tar -czf kubiks-darwin.tar.gz kubiks

# Calculate SHA256
SHA256=$(shasum -a 256 kubiks-darwin.tar.gz | cut -d' ' -f1)
echo "📦 SHA256: $SHA256"

# Create GitHub release
echo "📤 Creating GitHub release..."
gh release create $VERSION kubiks-darwin.tar.gz \
    --title "Release $VERSION" \
    --notes "Release $VERSION"

# Update formula
echo "🍺 Updating Homebrew formula..."
cat > /tmp/kubiks.rb << EOF
class Kubiks < Formula
  desc "AI-powered debugging for Next.js with OpenTelemetry and MCP integration"
  homepage "https://github.com/kubiks-inc/kubiks-cli"
  url "https://github.com/kubiks-inc/kubiks-cli/releases/download/$VERSION/kubiks-darwin.tar.gz"
  sha256 "$SHA256"
  version "$VERSION_NUM"

  def install
    bin.install "kubiks"
  end

  test do
    assert_match "kubiks", shell_output("#{bin}/kubiks --help")
  end
end
EOF

echo ""
echo "✅ Release created! Now:"
echo "1. Copy the formula above to your tap repo"
echo "2. Commit and push to kubiks-inc/tap"
echo ""
echo "Or run:"
echo "cp /tmp/kubiks.rb ../tap/Formula/kubiks.rb"
echo "cd ../tap && git add . && git commit -m 'Update to $VERSION' && git push"