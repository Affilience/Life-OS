#!/bin/bash

# Script to generate Nova AI companion sprites using PixelLab API
# Usage: ./scripts/generateNovaSprites.sh

API_URL="https://api.pixellab.ai/mcp/characters"
OUTPUT_DIR="public/assets/nova"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "🌟 Generating Nova AI Companion Sprites..."
echo "=========================================="

# Stage 1: Spark (Baby form - Level 0-9)
echo ""
echo "📍 Stage 1: Spark (Baby Form)"
echo "Generating cute glowing cosmic spirit orb..."

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "cute glowing cosmic spirit orb creature baby form with large expressive eyes, happy friendly expression, ethereal glow, floating, purple and blue gradient colors, magical sparkles",
    "name": "Nova_Spark",
    "n_directions": 4,
    "size": 48,
    "view": "high top-down",
    "detail": "medium detail",
    "shading": "basic shading",
    "outline": "single color black outline",
    "proportions": "{\"type\": \"preset\", \"name\": \"chibi\"}"
  }' > "$OUTPUT_DIR/spark_response.json"

SPARK_ID=$(jq -r '.character_id' "$OUTPUT_DIR/spark_response.json")
echo "✅ Spark queued! Character ID: $SPARK_ID"

# Stage 2: Nova (Teen form - Level 10-24)
echo ""
echo "📍 Stage 2: Nova (Teen Form)"
echo "Generating cosmic sprite companion..."

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "small cute humanoid cosmic sprite creature with star-shaped head, friendly cheerful expression, glowing purple and blue ethereal body, floating magical companion, chibi proportions",
    "name": "Nova_Teen",
    "n_directions": 4,
    "size": 48,
    "view": "high top-down",
    "detail": "medium detail",
    "shading": "medium shading",
    "outline": "single color black outline",
    "proportions": "{\"type\": \"preset\", \"name\": \"chibi\"}"
  }' > "$OUTPUT_DIR/teen_response.json"

TEEN_ID=$(jq -r '.character_id' "$OUTPUT_DIR/teen_response.json")
echo "✅ Teen form queued! Character ID: $TEEN_ID"

# Stage 3: Stellar (Adult form - Level 25-49)
echo ""
echo "📍 Stage 3: Stellar (Adult Form)"
echo "Generating elegant cosmic life coach..."

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "elegant cosmic humanoid life coach character with wise friendly expression, detailed galaxy pattern body, flowing ethereal energy, purple blue and pink gradient, mature proportions, confident pose",
    "name": "Nova_Stellar",
    "n_directions": 4,
    "size": 64,
    "view": "high top-down",
    "detail": "high detail",
    "shading": "detailed shading",
    "outline": "selective outline",
    "proportions": "{\"type\": \"preset\", \"name\": \"stylized\"}"
  }' > "$OUTPUT_DIR/stellar_response.json"

STELLAR_ID=$(jq -r '.character_id' "$OUTPUT_DIR/stellar_response.json")
echo "✅ Stellar form queued! Character ID: $STELLAR_ID"

# Stage 4: Cosmos (Final form - Level 50+)
echo ""
echo "📍 Stage 4: Cosmos (Final Form)"
echo "Generating majestic cosmic entity..."

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "majestic cosmic entity with wise serene expression, flowing robes made of stardust and nebula, radiant aura, crown of stars, purple blue gold gradient, dignified wise mentor appearance",
    "name": "Nova_Cosmos",
    "n_directions": 4,
    "size": 64,
    "view": "high top-down",
    "detail": "high detail",
    "shading": "detailed shading",
    "outline": "selective outline",
    "proportions": "{\"type\": \"preset\", \"name\": \"stylized\"}"
  }' > "$OUTPUT_DIR/cosmos_response.json"

COSMOS_ID=$(jq -r '.character_id' "$OUTPUT_DIR/cosmos_response.json")
echo "✅ Cosmos form queued! Character ID: $COSMOS_ID"

# Save IDs to file for later download
cat > "$OUTPUT_DIR/character_ids.json" << EOF
{
  "spark": "$SPARK_ID",
  "teen": "$TEEN_ID",
  "stellar": "$STELLAR_ID",
  "cosmos": "$COSMOS_ID"
}
EOF

echo ""
echo "=========================================="
echo "✅ All 4 Nova forms queued successfully!"
echo ""
echo "Character IDs saved to: $OUTPUT_DIR/character_ids.json"
echo ""
echo "⏳ Generation takes ~2-3 minutes per character"
echo ""
echo "Next steps:"
echo "1. Wait 3-5 minutes for generation to complete"
echo "2. Run: ./scripts/downloadNovaSprites.sh"
echo ""
