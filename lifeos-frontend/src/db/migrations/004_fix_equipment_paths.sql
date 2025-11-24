-- ================================================
-- Fix Equipment Image Paths Migration
-- Updates incorrect image paths to match actual files
-- ================================================

-- Fix chest armor paths (singular /chest/ to plural /chests/)
UPDATE equipment_items SET image_path = '/assets/equipment/chests/leather_vest.png' WHERE name = 'Training Vest';
UPDATE equipment_items SET image_path = '/assets/equipment/chests/chainmail_shirt.png' WHERE name = 'Iron Chestplate';
UPDATE equipment_items SET image_path = '/assets/equipment/chests/dragon_cuirass.png' WHERE name = 'Dragon Scale Armor';

-- Fix shield paths
UPDATE equipment_items SET image_path = '/assets/equipment/shields/wooden_buckler.png' WHERE name = 'Wooden Shield';

-- Fix weapon paths (hyphens to underscores)
UPDATE equipment_items SET image_path = '/assets/equipment/weapons/training_sword.png' WHERE name = 'Training Sword';
UPDATE equipment_items SET image_path = '/assets/equipment/weapons/iron_sword.png' WHERE name = 'Iron Sword';
UPDATE equipment_items SET image_path = '/assets/equipment/weapons/dragon_blade.png' WHERE name = 'Dragon Blade';
UPDATE equipment_items SET image_path = '/assets/equipment/weapons/archmage_staff.png' WHERE name = 'Arcane Staff';

-- Verify results
SELECT name, slot, image_path
FROM equipment_items
WHERE name IN ('Training Vest', 'Iron Chestplate', 'Dragon Scale Armor', 'Wooden Shield', 'Training Sword', 'Iron Sword', 'Dragon Blade', 'Arcane Staff')
ORDER BY slot, name;
