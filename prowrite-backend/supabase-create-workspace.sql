-- Create workspace for existing user
-- Replace YOUR_USER_ID with your actual Supabase user ID
-- You can find your user ID in Supabase Dashboard > Authentication > Users

-- First, check if you have any users
SELECT id, email FROM auth.users;

-- Then create workspace for your user (replace the user_id)
-- Uncomment and run after replacing YOUR_USER_ID:

/*
INSERT INTO workspaces (user_id, name, description, usage_limit, usage_count)
VALUES (
  'YOUR_USER_ID',  -- Replace with your actual user ID from auth.users
  'My Workspace',
  'Default workspace',
  100,
  0
)
RETURNING *;
*/

-- After creating workspace, create subscription for it:
/*
INSERT INTO subscriptions (workspace_id, plan_type, status)
SELECT id, 'free', 'active'
FROM workspaces
WHERE user_id = 'YOUR_USER_ID'  -- Replace with your actual user ID
RETURNING *;
*/

-- Or do it all in one go (replace YOUR_USER_ID):
/*
WITH new_workspace AS (
  INSERT INTO workspaces (user_id, name, description, usage_limit, usage_count)
  VALUES (
    'YOUR_USER_ID',
    'My Workspace', 
    'Default workspace',
    100,
    0
  )
  RETURNING id
)
INSERT INTO subscriptions (workspace_id, plan_type, status)
SELECT id, 'free', 'active' FROM new_workspace;
*/
