-- SQL Script to grant all equipment to a specific user
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users

-- First, let's create a function to grant all equipment to a user
CREATE OR REPLACE FUNCTION grant_all_equipment_to_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert all equipment items into user_equipment for the specified user
  INSERT INTO user_equipment (user_id, equipment_id, obtained_at)
  SELECT
    target_user_id,
    id,
    NOW()
  FROM equipment_items
  ON CONFLICT (user_id, equipment_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION grant_all_equipment_to_user(UUID) TO authenticated;

-- To use this function after logging in, run:
-- SELECT grant_all_equipment_to_user(auth.uid());
