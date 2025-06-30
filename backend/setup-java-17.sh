#!/bin/bash

set -e

echo "🔍 Looking specifically for Java 17..."

detect_java17_macos() {
  /usr/libexec/java_home -V 2>&1 | while read -r line; do
    if echo "$line" | grep -q '17\.'; then
      path=$(echo "$line" | sed -E 's/.*"(.*)"/\1/')
      echo "$path"
      return
    fi
  done
}

detect_java17_linux() {
  find /usr/lib/jvm -maxdepth 1 -type d \( -name "*jdk*" -o -name "*java*" \) 2>/dev/null | while read -r jdk; do
    [ -x "$jdk/bin/java" ] || continue
    version_output="$("$jdk/bin/java" -version 2>&1)"
    version=$(echo "$version_output" | grep -oP '(?<=version ")([0-9]+)')
    if [[ "$version" == "17" ]]; then
      echo "$jdk"
      return
    fi
  done
}

if [[ "$OSTYPE" == "darwin"* ]]; then
  JAVA_HOME_CANDIDATE=$(detect_java17_macos)
else
  JAVA_HOME_CANDIDATE=$(detect_java17_linux)
fi

if [ -z "$JAVA_HOME_CANDIDATE" ]; then
  echo "❌ Java 17 not found."
  exit 1
fi

export JAVA_HOME="$JAVA_HOME_CANDIDATE"
export PATH="$JAVA_HOME/bin:$PATH"

echo "✅ JAVA_HOME set to: $JAVA_HOME"
java -version

