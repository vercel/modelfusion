#!/bin/bash

# Define the repository URL
REPO_URL="https://github.com/ggerganov/llama.cpp.git"

# Define the directory where the repository will be cloned
DIR="lib/llamacpp"

# If the directory already exists, pull the latest changes
if [ -d "$DIR" ]; then
  echo "Directory $DIR exists."
  echo "Pulling latest changes..."
  cd "$DIR" && git pull origin master
else
  # If the directory does not exist, clone the repository
  echo "Directory $DIR does not exist."
  echo "Cloning repository..."
  git clone "$REPO_URL" "$DIR"
fi