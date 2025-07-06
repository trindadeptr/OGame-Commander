#!/bin/bash

set -e

echo "🔧 Installing Java 21..."

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  if ! command -v brew >/dev/null 2>&1; then
    echo "❌ Homebrew not found. Please install Homebrew first: https://brew.sh"
    exit 1
  fi

  brew install --cask temurin21

  export JAVA_HOME=$(/usr/libexec/java_home -v 21)
  export PATH="$JAVA_HOME/bin:$PATH"
  echo "✅ Java 21 installed and JAVA_HOME set to: $JAVA_HOME"

elif [[ -f /etc/debian_version ]]; then
  # Debian/Ubuntu
  sudo apt update
  sudo apt install -y openjdk-21-jdk

  JAVA_HOME=$(update-java-alternatives -l | grep 'java-1.21' | awk '{print $3}')
  if [ -z "$JAVA_HOME" ]; then
    JAVA_HOME=$(dirname "$(dirname "$(readlink -f "$(which javac)")")")
  fi

  export JAVA_HOME
  export PATH="$JAVA_HOME/bin:$PATH"
  echo "✅ Java 21 installed and JAVA_HOME set to: $JAVA_HOME"

else
  echo "❌ Unsupported OS. Please install Java 21 manually."
  exit 1
fi

# Verify
java -version

