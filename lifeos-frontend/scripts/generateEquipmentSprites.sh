#!/bin/bash

# Equipment Sprite Generator using PixelLab API
# Generates sprites for comprehensive equipment arsenal

API_KEY="sk-pixellab-fca76ab2-bd66-4d73-a57a-19c1e58b5eaa"
OUTPUT_DIR="public/assets/equipment"

# Create directories
mkdir -p "$OUTPUT_DIR/helmets"
mkdir -p "$OUTPUT_DIR/chests"
mkdir -p "$OUTPUT_DIR/weapons"
mkdir -p "$OUTPUT_DIR/shields"
mkdir -p "$OUTPUT_DIR/capes"
mkdir -p "$OUTPUT_DIR/rings"
mkdir -p "$OUTPUT_DIR/amulets"

echo "🎨 Starting Equipment Sprite Generation..."
echo "================================================"

# Function to generate equipment sprite
generate_equipment() {
    local name="$1"
    local description="$2"
    local category="$3"
    local filename="$4"

    echo "Generating: $name ($category)"

    curl -X POST "https://api.pixellab.ai/map-objects" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"description\": \"$description\",
            \"width\": 64,
            \"height\": 64,
            \"view\": \"high top-down\",
            \"detail\": \"high detail\",
            \"shading\": \"detailed shading\",
            \"outline\": \"single color outline\"
        }" > "/tmp/${filename}_response.json"

    # Extract object_id
    object_id=$(cat "/tmp/${filename}_response.json" | grep -o '"object_id":"[^"]*' | cut -d'"' -f4)

    if [ -n "$object_id" ]; then
        echo "  ✓ Queued with ID: $object_id"
        echo "$object_id|$name|$category|$filename" >> "/tmp/equipment_queue.txt"
    else
        echo "  ✗ Failed to queue"
    fi

    sleep 1
}

# Clear queue file
> /tmp/equipment_queue.txt

echo ""
echo "📋 Queueing Equipment Generation..."
echo "================================================"

# HELMETS
generate_equipment "Cloth Cap" "simple white cloth cap headwear" "helmets" "cloth_cap"
generate_equipment "Leather Hood" "brown leather hood medieval style" "helmets" "leather_hood"
generate_equipment "Training Helmet" "basic iron training helmet" "helmets" "training_helmet"
generate_equipment "Iron Helmet" "sturdy iron medieval helmet" "helmets" "iron_helmet"
generate_equipment "Reinforced Coif" "metal reinforced chainmail coif" "helmets" "reinforced_coif"
generate_equipment "Scholar's Circlet" "magical silver circlet with gem" "helmets" "scholar_circlet"
generate_equipment "Steel Greathelm" "heavy steel full face helmet" "helmets" "steel_greathelm"
generate_equipment "Sage's Crown" "ornate wisdom crown with crystals" "helmets" "sage_crown"
generate_equipment "Dragon Scale Helm" "blue dragon scale helmet with horns" "helmets" "dragon_helm"
generate_equipment "Mindguard Helmet" "psychic protection helmet glowing runes" "helmets" "mindguard_helmet"
generate_equipment "Titanium War Helm" "futuristic titanium war helmet" "helmets" "titanium_helm"
generate_equipment "Archmage's Diadem" "purple magical archmage crown floating gems" "helmets" "archmage_diadem"
generate_equipment "Phoenix Crown" "orange phoenix feather crown flames" "helmets" "phoenix_crown"
generate_equipment "Celestial Circlet" "holy white celestial circlet stars" "helmets" "celestial_circlet"
generate_equipment "Crown of the Eternal Monarch" "legendary golden crown massive gems divine light" "helmets" "eternal_crown"

# CHEST ARMOR
generate_equipment "Cloth Tunic" "simple beige cloth tunic" "chests" "cloth_tunic"
generate_equipment "Leather Vest" "brown leather vest medieval" "chests" "leather_vest"
generate_equipment "Padded Armor" "quilted padded armor protection" "chests" "padded_armor"
generate_equipment "Chainmail Shirt" "silver chainmail shirt links" "chests" "chainmail_shirt"
generate_equipment "Reinforced Breastplate" "iron reinforced breastplate" "chests" "reinforced_breastplate"
generate_equipment "Steel Plate Armor" "full steel plate chest armor" "chests" "steel_plate"
generate_equipment "Dragon Hide Cuirass" "red dragon leather cuirass scales" "chests" "dragon_cuirass"
generate_equipment "Paladin's Chestguard" "holy paladin chest armor gold trim" "chests" "paladin_chestguard"
generate_equipment "Titanium Platemail" "advanced titanium full platemail" "chests" "titanium_platemail"
generate_equipment "Phoenix Battleplate" "orange phoenix flame armor wings" "chests" "phoenix_battleplate"
generate_equipment "Aegis of the Titan" "massive legendary titan armor blue runes" "chests" "aegis_titan"

# WEAPONS
generate_equipment "Wooden Staff" "simple brown wooden staff" "weapons" "wooden_staff"
generate_equipment "Iron Dagger" "small iron dagger blade" "weapons" "iron_dagger"
generate_equipment "Training Sword" "basic training longsword" "weapons" "training_sword"
generate_equipment "Steel Longsword" "sharp steel longsword balanced" "weapons" "steel_longsword"
generate_equipment "Wizard's Wand" "magical wand with crystal tip" "weapons" "wizard_wand"
generate_equipment "Battle Axe" "heavy battle axe double blade" "weapons" "battle_axe"
generate_equipment "Enchanted Blade" "glowing blue magical sword runes" "weapons" "enchanted_blade"
generate_equipment "Warlock's Scepter" "dark purple warlock scepter skull" "weapons" "warlock_scepter"
generate_equipment "Executioner's Greataxe" "massive executioner axe intimidating" "weapons" "executioner_axe"
generate_equipment "Arcane Staff" "purple arcane staff floating orb" "weapons" "arcane_staff"
generate_equipment "Staff of the Archmage" "epic purple staff massive crystal ball" "weapons" "archmage_staff"
generate_equipment "Thunder Hammer" "blue lightning hammer electric" "weapons" "thunder_hammer"
generate_equipment "Godslayer" "legendary orange flaming greatsword divine" "weapons" "godslayer"
generate_equipment "Eternity's Edge" "cosmic sword reality warping blade stars" "weapons" "eternity_edge"

# SHIELDS
generate_equipment "Wooden Buckler" "small wooden round buckler" "shields" "wooden_buckler"
generate_equipment "Iron Round Shield" "iron round shield basic" "shields" "iron_shield"
generate_equipment "Steel Kite Shield" "large steel kite shield" "shields" "steel_kite"
generate_equipment "Tower Shield" "massive tower shield full coverage" "shields" "tower_shield"
generate_equipment "Dragon Scale Shield" "blue dragon scale round shield" "shields" "dragon_shield"
generate_equipment "Guardian's Bulwark" "holy guardian shield gold cross" "shields" "guardian_bulwark"
generate_equipment "Fortress Wall Shield" "epic massive wall shield castle" "shields" "fortress_shield"
generate_equipment "Shield of the Immortal" "legendary golden shield eternal runes" "shields" "immortal_shield"

# CAPES
generate_equipment "Traveler's Cloak" "simple brown travel cloak" "capes" "traveler_cloak"
generate_equipment "Leather Cape" "brown leather cape hood" "capes" "leather_cape"
generate_equipment "Enchanter's Mantle" "blue magical enchanter mantle stars" "capes" "enchanter_mantle"
generate_equipment "Shadow Cloak" "dark purple shadow cloak mysterious" "capes" "shadow_cloak"
generate_equipment "Oracle's Shroud" "white oracle robe glowing eyes" "capes" "oracle_shroud"
generate_equipment "Mystic's Robe" "purple mystic robe arcane symbols" "capes" "mystic_robe"
generate_equipment "Sage's Grand Cloak" "epic green sage cloak wisdom aura" "capes" "sage_cloak"
generate_equipment "Cloak of the Ancients" "legendary golden ancient cloak ruins" "capes" "ancient_cloak"

# RINGS
generate_equipment "Copper Band" "simple copper ring band" "rings" "copper_band"
generate_equipment "Iron Ring" "iron ring basic" "rings" "iron_ring"
generate_equipment "Ring of Strength" "red gem strength ring muscles" "rings" "strength_ring"
generate_equipment "Ring of Intelligence" "blue gem intelligence ring mind" "rings" "intelligence_ring"
generate_equipment "Ring of Vitality" "green gem vitality ring life" "rings" "vitality_ring"
generate_equipment "Warrior's Signet" "gold warrior signet ring sword" "rings" "warrior_signet"
generate_equipment "Scholar's Ring" "purple scholar ring book symbol" "rings" "scholar_ring"
generate_equipment "Ring of Power" "epic red power ring energy" "rings" "power_ring"
generate_equipment "Ring of Immortality" "epic white immortal ring eternal" "rings" "immortal_ring"
generate_equipment "The One Ring" "legendary golden ring glowing inscription" "rings" "one_ring"

# AMULETS
generate_equipment "Wooden Charm" "simple wooden charm pendant" "amulets" "wooden_charm"
generate_equipment "Stone Pendant" "gray stone pendant protective" "amulets" "stone_pendant"
generate_equipment "Amulet of Strength" "red gem strength amulet" "amulets" "strength_amulet"
generate_equipment "Amulet of Mind" "blue gem mind amulet brain" "amulets" "mind_amulet"
generate_equipment "Dragon Tooth Necklace" "white dragon tooth necklace fierce" "amulets" "dragon_tooth"
generate_equipment "Arcane Medallion" "purple arcane medallion magical circle" "amulets" "arcane_medallion"
generate_equipment "Guardian's Pendant" "gold guardian pendant shield symbol" "amulets" "guardian_pendant"
generate_equipment "Celestial Medallion" "white celestial medallion stars" "amulets" "celestial_medallion"
generate_equipment "Heart of the Phoenix" "orange phoenix heart amulet flames" "amulets" "phoenix_heart"
generate_equipment "Amulet of Infinity" "legendary rainbow infinity amulet cosmic" "amulets" "infinity_amulet"

echo ""
echo "✅ All equipment queued! ($(wc -l < /tmp/equipment_queue.txt) items)"
echo ""
echo "⏳ Waiting 90 seconds for generation..."
sleep 90

echo ""
echo "📥 Downloading Equipment Sprites..."
echo "================================================"

# Download all generated sprites
while IFS='|' read -r object_id name category filename; do
    if [ -n "$object_id" ]; then
        echo "Downloading: $name"
        curl -s "https://api.pixellab.ai/mcp/map-objects/$object_id/download" \
            -o "$OUTPUT_DIR/$category/${filename}.png"

        if [ -f "$OUTPUT_DIR/$category/${filename}.png" ]; then
            echo "  ✓ Saved to $category/${filename}.png"
        else
            echo "  ✗ Download failed"
        fi
    fi
done < /tmp/equipment_queue.txt

echo ""
echo "================================================"
echo "✨ Equipment Generation Complete!"
echo ""
echo "Generated files:"
find "$OUTPUT_DIR" -name "*.png" | wc -l | xargs echo "Total sprites:"
echo ""
echo "Location: $OUTPUT_DIR"
