#!/bin/bash

function cocoapods() {
    echo "Installing Cocoapods"
    npm run ios-gems &> /dev/null || npm run ios-gems-m1 &> /dev/null || exit 1
}

# Check if running on Windows
if [[ "$OSTYPE" == "msys" ]]; then
  echo "This script is not intended for Windows."
  exit 1
fi

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  # Check and install Bundler if not present
  if !(gem list bundler -i --version 2.3.26) > /dev/null 2>&1; then
    echo "Installing Bundler"
    gem install bundler --version 2.3.26 || exit 1
  fi

  # Check and install Cocoapods if not present
  if !(gem list cocoapods -i --version 1.14.3) > /dev/null 2>&1; then
    cocoapods
  fi
fi
