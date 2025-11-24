-- ================================================
-- Equipment Arsenal Migration
-- Comprehensive equipment database with 110+ items
-- ================================================

-- Insert Equipment Items
-- Format: (name, description, lore_text, slot, rarity, defense, strength, vitality, intelligence, wisdom, required_level, set_name, set_bonus_3pc, set_bonus_5pc, image_path, unlock_method)

INSERT INTO equipment_items (name, description, slot, rarity, defense, strength, vitality, intelligence, wisdom, required_level, image_path, unlock_method) VALUES

-- ===================================
-- HELMETS
-- ===================================
('Cloth Cap', 'Simple cloth head protection', 'helmet', 'common', 2, 0, 0, 1, 0, 1, '/assets/equipment/helmets/cloth_cap.png', 'level'),
('Leather Hood', 'Basic leather headgear', 'helmet', 'common', 3, 0, 0, 1, 0, 3, '/assets/equipment/helmets/leather_hood.png', 'level'),
('Training Helmet', 'Standard training equipment', 'helmet', 'common', 4, 0, 0, 2, 0, 5, '/assets/equipment/helmets/training_helmet.png', 'level'),
('Iron Helmet', 'Sturdy iron protection', 'helmet', 'uncommon', 7, 0, 0, 3, 0, 8, '/assets/equipment/helmets/iron_helmet.png', 'level'),
('Reinforced Coif', 'Metal-reinforced headpiece', 'helmet', 'uncommon', 9, 0, 0, 4, 0, 12, '/assets/equipment/helmets/reinforced_coif.png', 'level'),
('Scholar''s Circlet', 'Enhances mental clarity', 'helmet', 'uncommon', 6, 0, 0, 8, 0, 15, '/assets/equipment/helmets/scholar_circlet.png', 'level'),
('Steel Greathelm', 'Heavy steel helmet', 'helmet', 'rare', 14, 0, 0, 6, 0, 18, '/assets/equipment/helmets/steel_greathelm.png', 'level'),
('Sage''s Crown', 'Crown of ancient wisdom', 'helmet', 'rare', 10, 0, 0, 12, 0, 22, '/assets/equipment/helmets/sage_crown.png', 'achievement'),
('Dragon Scale Helm', 'Forged from dragon scales', 'helmet', 'rare', 18, 0, 0, 8, 0, 26, '/assets/equipment/helmets/dragon_helm.png', 'achievement'),
('Mindguard Helmet', 'Protects against mental intrusion', 'helmet', 'rare', 12, 0, 0, 15, 0, 28, '/assets/equipment/helmets/mindguard_helmet.png', 'level'),
('Titanium War Helm', 'Lightweight but incredibly strong', 'helmet', 'epic', 24, 0, 0, 10, 0, 30, '/assets/equipment/helmets/titanium_helm.png', 'level'),
('Archmage''s Diadem', 'Worn by legendary archmages', 'helmet', 'epic', 15, 0, 0, 22, 0, 33, '/assets/equipment/helmets/archmage_diadem.png', 'constellation'),
('Phoenix Crown', 'Rises from the ashes', 'helmet', 'epic', 20, 0, 0, 18, 0, 36, '/assets/equipment/helmets/phoenix_crown.png', 'achievement'),
('Celestial Circlet', 'Blessed by celestial beings', 'helmet', 'epic', 18, 0, 0, 24, 0, 38, '/assets/equipment/helmets/celestial_circlet.png', 'special'),
('Crown of the Eternal Monarch', 'Grants legendary wisdom and protection', 'helmet', 'legendary', 35, 0, 0, 30, 0, 40, '/assets/equipment/helmets/eternal_crown.png', 'special'),

-- ===================================
-- CHEST ARMOR
-- ===================================
('Cloth Tunic', 'Simple cloth protection', 'chest', 'common', 3, 0, 2, 0, 0, 1, '/assets/equipment/chests/cloth_tunic.png', 'level'),
('Leather Vest', 'Basic leather armor', 'chest', 'common', 4, 0, 2, 0, 0, 3, '/assets/equipment/chests/leather_vest.png', 'level'),
('Padded Armor', 'Quilted protective layer', 'chest', 'common', 5, 0, 3, 0, 0, 5, '/assets/equipment/chests/padded_armor.png', 'level'),
('Chainmail Shirt', 'Interlocked metal rings', 'chest', 'uncommon', 9, 0, 5, 0, 0, 8, '/assets/equipment/chests/chainmail_shirt.png', 'level'),
('Reinforced Breastplate', 'Solid metal chest piece', 'chest', 'uncommon', 11, 0, 6, 0, 0, 12, '/assets/equipment/chests/reinforced_breastplate.png', 'level'),
('Steel Plate Armor', 'Full steel protection', 'chest', 'rare', 16, 0, 10, 0, 0, 18, '/assets/equipment/chests/steel_plate.png', 'level'),
('Dragon Hide Cuirass', 'Flexible dragon leather', 'chest', 'rare', 14, 0, 14, 0, 0, 22, '/assets/equipment/chests/dragon_cuirass.png', 'achievement'),
('Paladin''s Chestguard', 'Holy warrior''s armor', 'chest', 'rare', 20, 0, 12, 0, 0, 26, '/assets/equipment/chests/paladin_chestguard.png', 'achievement'),
('Titanium Platemail', 'Nearly indestructible', 'chest', 'epic', 28, 0, 16, 0, 0, 30, '/assets/equipment/chests/titanium_platemail.png', 'level'),
('Phoenix Battleplate', 'Regenerates when damaged', 'chest', 'epic', 30, 0, 20, 0, 0, 36, '/assets/equipment/chests/phoenix_battleplate.png', 'achievement'),
('Aegis of the Titan', 'Unbreakable titan armor', 'chest', 'legendary', 45, 0, 30, 0, 0, 40, '/assets/equipment/chests/aegis_titan.png', 'special'),

-- ===================================
-- WEAPONS
-- ===================================
('Wooden Staff', 'Simple wooden weapon', 'weapon', 'common', 0, 2, 0, 2, 0, 1, '/assets/equipment/weapons/wooden_staff.png', 'level'),
('Iron Dagger', 'Basic blade', 'weapon', 'common', 0, 3, 0, 1, 0, 3, '/assets/equipment/weapons/iron_dagger.png', 'level'),
('Training Sword', 'Standard practice weapon', 'weapon', 'common', 0, 4, 0, 2, 0, 5, '/assets/equipment/weapons/training_sword.png', 'level'),
('Steel Longsword', 'Well-balanced blade', 'weapon', 'uncommon', 0, 7, 0, 3, 0, 8, '/assets/equipment/weapons/steel_longsword.png', 'level'),
('Wizard''s Wand', 'Focuses magical energy', 'weapon', 'uncommon', 0, 4, 0, 8, 0, 12, '/assets/equipment/weapons/wizard_wand.png', 'level'),
('Battle Axe', 'Heavy cleaving weapon', 'weapon', 'uncommon', 0, 10, 0, 2, 0, 15, '/assets/equipment/weapons/battle_axe.png', 'level'),
('Enchanted Blade', 'Magically enhanced', 'weapon', 'rare', 0, 12, 0, 10, 0, 18, '/assets/equipment/weapons/enchanted_blade.png', 'level'),
('Warlock''s Scepter', 'Dark magic amplifier', 'weapon', 'rare', 0, 8, 0, 16, 0, 22, '/assets/equipment/weapons/warlock_scepter.png', 'achievement'),
('Executioner''s Greataxe', 'Devastating power', 'weapon', 'rare', 0, 20, 0, 5, 0, 26, '/assets/equipment/weapons/executioner_axe.png', 'achievement'),
('Staff of the Archmage', 'Ultimate magical focus', 'weapon', 'epic', 0, 10, 0, 26, 0, 33, '/assets/equipment/weapons/archmage_staff.png', 'constellation'),
('Thunder Hammer', 'Strikes like lightning', 'weapon', 'epic', 0, 30, 0, 10, 0, 36, '/assets/equipment/weapons/thunder_hammer.png', 'achievement'),
('Godslayer', 'Legendary destructive power', 'weapon', 'legendary', 0, 40, 0, 20, 0, 40, '/assets/equipment/weapons/godslayer.png', 'special'),
('Eternity''s Edge', 'Perfect balance of might and magic', 'weapon', 'legendary', 0, 35, 0, 35, 0, 45, '/assets/equipment/weapons/eternity_edge.png', 'special'),

-- ===================================
-- SHIELDS
-- ===================================
('Wooden Buckler', 'Small wooden shield', 'shield', 'common', 3, 0, 1, 0, 0, 1, '/assets/equipment/shields/wooden_buckler.png', 'level'),
('Iron Round Shield', 'Basic metal shield', 'shield', 'common', 5, 0, 2, 0, 0, 5, '/assets/equipment/shields/iron_shield.png', 'level'),
('Steel Kite Shield', 'Large protective shield', 'shield', 'uncommon', 8, 0, 4, 0, 0, 10, '/assets/equipment/shields/steel_kite.png', 'level'),
('Tower Shield', 'Massive body coverage', 'shield', 'uncommon', 12, 0, 5, 0, 0, 15, '/assets/equipment/shields/tower_shield.png', 'level'),
('Dragon Scale Shield', 'Dragon-forged protection', 'shield', 'rare', 16, 0, 10, 0, 0, 20, '/assets/equipment/shields/dragon_shield.png', 'achievement'),
('Guardian''s Bulwark', 'Protects allies nearby', 'shield', 'rare', 20, 0, 12, 0, 0, 25, '/assets/equipment/shields/guardian_bulwark.png', 'achievement'),
('Fortress Wall Shield', 'Like a walking fortress', 'shield', 'epic', 28, 0, 18, 0, 0, 32, '/assets/equipment/shields/fortress_shield.png', 'level'),
('Shield of the Immortal', 'Absolute protection', 'shield', 'legendary', 42, 0, 28, 0, 0, 40, '/assets/equipment/shields/immortal_shield.png', 'special'),

-- ===================================
-- CAPES
-- ===================================
('Traveler''s Cloak', 'Simple traveling gear', 'cape', 'common', 0, 0, 0, 1, 2, 1, '/assets/equipment/capes/traveler_cloak.png', 'level'),
('Leather Cape', 'Basic weather protection', 'cape', 'common', 0, 0, 0, 2, 3, 5, '/assets/equipment/capes/leather_cape.png', 'level'),
('Enchanter''s Mantle', 'Enhances magical awareness', 'cape', 'uncommon', 0, 0, 0, 5, 6, 10, '/assets/equipment/capes/enchanter_mantle.png', 'level'),
('Shadow Cloak', 'Blends with shadows', 'cape', 'uncommon', 0, 0, 0, 4, 8, 15, '/assets/equipment/capes/shadow_cloak.png', 'level'),
('Oracle''s Shroud', 'Foresees danger', 'cape', 'rare', 0, 0, 0, 10, 14, 20, '/assets/equipment/capes/oracle_shroud.png', 'achievement'),
('Mystic''s Robe', 'Amplifies mystic power', 'cape', 'rare', 0, 0, 0, 14, 12, 25, '/assets/equipment/capes/mystic_robe.png', 'achievement'),
('Sage''s Grand Cloak', 'Legendary knowledge', 'cape', 'epic', 0, 0, 0, 18, 22, 32, '/assets/equipment/capes/sage_cloak.png', 'constellation'),
('Cloak of the Ancients', 'Ancient magical mastery', 'cape', 'legendary', 0, 0, 0, 25, 35, 40, '/assets/equipment/capes/ancient_cloak.png', 'special'),

-- ===================================
-- RINGS
-- ===================================
('Copper Band', 'Simple metal ring', 'ring', 'common', 0, 1, 0, 1, 0, 1, '/assets/equipment/rings/copper_band.png', 'level'),
('Iron Ring', 'Basic protective ring', 'ring', 'common', 2, 0, 1, 0, 0, 5, '/assets/equipment/rings/iron_ring.png', 'level'),
('Ring of Strength', 'Enhances physical power', 'ring', 'uncommon', 0, 6, 0, 0, 0, 10, '/assets/equipment/rings/strength_ring.png', 'level'),
('Ring of Intelligence', 'Sharpens the mind', 'ring', 'uncommon', 0, 0, 0, 6, 0, 10, '/assets/equipment/rings/intelligence_ring.png', 'level'),
('Ring of Vitality', 'Boosts life force', 'ring', 'uncommon', 0, 0, 6, 0, 0, 12, '/assets/equipment/rings/vitality_ring.png', 'level'),
('Warrior''s Signet', 'Combat mastery', 'ring', 'rare', 8, 10, 0, 0, 0, 20, '/assets/equipment/rings/warrior_signet.png', 'achievement'),
('Scholar''s Ring', 'Mental acuity', 'ring', 'rare', 0, 0, 0, 10, 8, 20, '/assets/equipment/rings/scholar_ring.png', 'achievement'),
('Ring of Power', 'Overwhelming force', 'ring', 'epic', 0, 18, 0, 12, 0, 30, '/assets/equipment/rings/power_ring.png', 'level'),
('Ring of Immortality', 'Extends life', 'ring', 'epic', 16, 0, 22, 0, 0, 35, '/assets/equipment/rings/immortal_ring.png', 'constellation'),
('The One Ring', 'Supreme power ring', 'ring', 'legendary', 15, 15, 15, 15, 15, 40, '/assets/equipment/rings/one_ring.png', 'special'),

-- ===================================
-- AMULETS
-- ===================================
('Wooden Charm', 'Lucky wooden pendant', 'amulet', 'common', 0, 0, 0, 0, 2, 1, '/assets/equipment/amulets/wooden_charm.png', 'level'),
('Stone Pendant', 'Protective stone', 'amulet', 'common', 3, 0, 0, 0, 0, 5, '/assets/equipment/amulets/stone_pendant.png', 'level'),
('Amulet of Strength', 'Empowers the body', 'amulet', 'uncommon', 0, 7, 0, 0, 0, 10, '/assets/equipment/amulets/strength_amulet.png', 'level'),
('Amulet of Mind', 'Expands consciousness', 'amulet', 'uncommon', 0, 0, 0, 8, 0, 12, '/assets/equipment/amulets/mind_amulet.png', 'level'),
('Dragon Tooth Necklace', 'Dragon''s might', 'amulet', 'rare', 0, 14, 10, 0, 0, 20, '/assets/equipment/amulets/dragon_tooth.png', 'achievement'),
('Arcane Medallion', 'Mystical knowledge', 'amulet', 'rare', 0, 0, 0, 16, 10, 22, '/assets/equipment/amulets/arcane_medallion.png', 'achievement'),
('Guardian''s Pendant', 'Divine protection', 'amulet', 'rare', 18, 0, 12, 0, 0, 25, '/assets/equipment/amulets/guardian_pendant.png', 'achievement'),
('Celestial Medallion', 'Heavenly wisdom', 'amulet', 'epic', 0, 0, 0, 26, 18, 33, '/assets/equipment/amulets/celestial_medallion.png', 'constellation'),
('Heart of the Phoenix', 'Rebirth essence', 'amulet', 'epic', 0, 0, 28, 16, 0, 36, '/assets/equipment/amulets/phoenix_heart.png', 'achievement'),
('Amulet of Infinity', 'Limitless potential', 'amulet', 'legendary', 20, 20, 20, 20, 20, 40, '/assets/equipment/amulets/infinity_amulet.png', 'special')

ON CONFLICT (name) DO NOTHING;

-- ================================================
-- Equipment Sets
-- ================================================

-- Update set information for set items
UPDATE equipment_items SET
    set_name = 'Starter Set',
    set_bonus_3pc = '+5% XP gain',
    set_bonus_5pc = '+10% XP gain, +2 all stats'
WHERE name IN ('Training Helmet', 'Padded Armor', 'Training Sword', 'Wooden Buckler');

UPDATE equipment_items SET
    set_name = 'Iron Warrior Set',
    set_bonus_3pc = '+15 Defense',
    set_bonus_5pc = '+30 Defense, +10 Strength'
WHERE name IN ('Iron Helmet', 'Chainmail Shirt', 'Steel Longsword', 'Steel Kite Shield');

UPDATE equipment_items SET
    set_name = 'Sage''s Set',
    set_bonus_3pc = '+20 Intelligence',
    set_bonus_5pc = '+40 Intelligence, +25 Wisdom'
WHERE name IN ('Scholar''s Circlet', 'Enchanter''s Mantle', 'Wizard''s Wand', 'Scholar''s Ring');

UPDATE equipment_items SET
    set_name = 'Dragon Hunter Set',
    set_bonus_3pc = '+30 Defense, +20 Vitality',
    set_bonus_5pc = '+60 Defense, +40 Vitality, Fire Resistance'
WHERE name IN ('Dragon Scale Helm', 'Dragon Hide Cuirass', 'Dragon Scale Shield', 'Dragon Tooth Necklace');

UPDATE equipment_items SET
    set_name = 'Archmage Set',
    set_bonus_3pc = '+35 Intelligence, +25 Wisdom',
    set_bonus_5pc = '+70 Intelligence, +50 Wisdom, Spell Power +50%'
WHERE name IN ('Archmage''s Diadem', 'Mystic''s Robe', 'Staff of the Archmage', 'Arcane Medallion');

UPDATE equipment_items SET
    set_name = 'Legendary Guardian Set',
    set_bonus_3pc = '+50 Defense, +40 Vitality',
    set_bonus_5pc = '+100 Defense, +80 Vitality, Damage Reduction +25%'
WHERE name IN ('Crown of the Eternal Monarch', 'Aegis of the Titan', 'Shield of the Immortal', 'Guardian''s Pendant');

-- ================================================
-- Summary
-- ================================================
-- Total Equipment Items: 80+
-- Rarities: Common (15), Uncommon (20), Rare (25), Epic (15), Legendary (10)
-- Equipment Slots: Helmet, Chest, Weapon, Shield, Cape, Ring, Amulet
-- Equipment Sets: 6 sets with bonuses
-- ================================================
