# This file will be automatically updated by the GitHub Actions workflow
# when a new release is created. Do not edit manually.

class Kubiks < Formula
  desc "CLI tool for managing development workflows with Next.js applications and OpenTelemetry"
  homepage "https://github.com/kubiks-inc/kubiks-cli"
  url "https://github.com/kubiks-inc/kubiks-cli/archive/v1.0.0.tar.gz"
  sha256 "placeholder_sha256"
  license "Apache-2.0"
  head "https://github.com/kubiks-inc/kubiks-cli.git", branch: "main"

  depends_on "go" => :build
  depends_on "node" => :build

  def install
    # Build the instrumentation file
    cd "instrumentation" do
      system "npm", "install"
      system "npm", "run", "build"
    end

    # Build the Go binary
    system "go", "build", *std_go_args(ldflags: "-s -w"), "-o", bin/"kubiks"
    
    # Install the instrumentation file alongside the binary
    (bin/"instrumentation.js").write File.read("instrumentation/dist/instrumentation.bundled.js")
  end

  test do
    assert_match "kubiks", shell_output("#{bin}/kubiks --help")
    
    # Test that instrumentation file exists
    assert_predicate bin/"instrumentation.js", :exist?
  end
end