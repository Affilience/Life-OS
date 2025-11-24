#!/bin/bash

# Script to download generated Nova sprites from PixelLab API
# Usage: ./scripts/downloadNovaSprites.sh

API_URL="https://api.pixellab.ai/mcp/characters"
OUTPUT_DIR="public/assets/nova"
IDS_FILE="$OUTPUT_DIR/character_ids.json"

if [ ! -f "$IDS_FILE" ]; then
  echo "❌ Error: character_ids.json not found!"
  echo "Please run ./scripts/generateNovaSprites.sh first"
  exit 1
fi

echo "🌟 Downloading Nova AI Companion Sprites..."
echo "=========================================="

# Read character IDs
SPARK_ID=$(jq -r '.spark' "$IDS_FILE")
TEEN_ID=$(jq -r '.teen' "$IDS_FILE")
STELLAR_ID=$(jq -r '.stellar' "$IDS_FILE")
COSMOS_ID=$(jq -r '.cosmos' "$IDS_FILE")

# Function to check character status
check_status() {
  local char_id=$1
  local char_name=$2

  echo ""
  echo "📍 Checking $char_name..."

  curl -s "$API_URL/$char_id" > "$OUTPUT_DIR/${char_name}_status.json"

  # Check if character has rotation images
  local south_url=$(jq -r '.rotation_images.south // empty' "$OUTPUT_DIR/${char_name}_status.json")

  if [ -z "$south_url" ]; then
    echo "⏳ Still generating... Please wait and try again"
    return 1
  else
    echo "✅ Ready for download!"
    return 0
  fi
}

# Function to download character
download_character() {
  local char_id=$1
  local char_name=$2

  echo ""
  echo "📥 Downloading $char_name..."

  # Create character directory
  mkdir -p "$OUTPUT_DIR/$char_name"

  # Get character info
  curl -s "$API_URL/$char_id" > "$OUTPUT_DIR/${char_name}_info.json"

  # Download all 4 directions
  for direction in south west east north; do
    local url=$(jq -r ".rotation_images.$direction" "$OUTPUT_DIR/${char_name}_info.json")
    if [ ! -z "$url" ] && [ "$url" != "null" ]; then
      echo "  Downloading $direction..."
      curl -s "$url" -o "$OUTPUT_DIR/$char_name/${direction}.png"
    fi
  done

  echo "✅ $char_name downloaded!"
}

# Check and download Spark
if check_status "$SPARK_ID" "spark"; then
  download_character "$SPARK_ID" "spark"
else
  echo "⏭️  Skipping Spark (not ready)"
fi

# Check and download Teen
if check_status "$TEEN_ID" "teen"; then
  download_character "$TEEN_ID" "teen"
else
  echo "⏭️  Skipping Teen (not ready)"
fi

# Check and download Stellar
if check_status "$STELLAR_ID" "stellar"; then
  download_character "$STELLAR_ID" "stellar"
else
  echo "⏭️  Skipping Stellar (not ready)"
fi

# Check and download Cosmos
if check_status "$COSMOS_ID" "cosmos"; then
  download_character "$COSMOS_ID" "cosmos"
else
  echo "⏭️  Skipping Cosmos (not ready)"
fi

echo ""
echo "=========================================="
echo "✅ Download complete!"
echo ""
echo "Sprites saved to: $OUTPUT_DIR/"
echo ""
echo "Folder structure:"
echo "$OUTPUT_DIR/"
echo "  ├── spark/"
echo "  │   ├── south.png"
echo "  │   ├── west.png"
echo "  │   ├── east.png"
echo "  │   └── north.png"
echo "  ├── teen/"
echo "  ├── stellar/"
echo "  └── cosmos/"
echo ""
