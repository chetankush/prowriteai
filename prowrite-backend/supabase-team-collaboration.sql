-- ProWrite AI Team Collaboration Schema
-- Run this in your Supabase SQL Editor to add team collaboration features

-- Team member roles
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Team members table
-- Allows multiple users to belong to a workspace
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Create indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_workspace_id ON team_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Team invitations table
-- Pending invitations for users not yet registered
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for team_invitations
CREATE INDEX IF NOT EXISTS idx_team_invitations_workspace_id ON team_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);

-- Asset library table
-- Stores approved/saved content for reuse
CREATE TYPE asset_status AS ENUM ('draft', 'pending_review', 'approved', 'archived');
CREATE TYPE asset_type AS ENUM ('email', 'job_description', 'offer_letter', 'script', 'landing_page', 'product_description', 'other');

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  asset_type asset_type NOT NULL,
  status asset_status NOT NULL DEFAULT 'draft',
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB,
  source_generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for assets
CREATE INDEX IF NOT EXISTS idx_assets_workspace_id ON assets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON assets(created_by);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets USING GIN(tags);

-- Asset versions table
-- Track version history of assets
CREATE TABLE IF NOT EXISTS asset_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  change_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for asset_versions
CREATE INDEX IF NOT EXISTS idx_asset_versions_asset_id ON asset_versions(asset_id);

-- Comments table
-- Allow team members to comment on assets and generations
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT comment_target_check CHECK (
    (asset_id IS NOT NULL)::int + 
    (generation_id IS NOT NULL)::int + 
    (conversation_id IS NOT NULL)::int = 1
  )
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_asset_id ON comments(asset_id);
CREATE INDEX IF NOT EXISTS idx_comments_generation_id ON comments(generation_id);
CREATE INDEX IF NOT EXISTS idx_comments_conversation_id ON comments(conversation_id);

-- Approval workflows table
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');

CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  status approval_status NOT NULL DEFAULT 'pending',
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for approval_requests
CREATE INDEX IF NOT EXISTS idx_approval_requests_workspace_id ON approval_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_asset_id ON approval_requests(asset_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_assigned_to ON approval_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);

-- Personalization variables table
-- Store reusable variables for mail merge
CREATE TABLE IF NOT EXISTS personalization_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  variables JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for personalization_sets
CREATE INDEX IF NOT EXISTS idx_personalization_sets_workspace_id ON personalization_sets(workspace_id);

-- Add triggers for updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at
  BEFORE UPDATE ON approval_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalization_sets_updated_at
  BEFORE UPDATE ON personalization_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_sets ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is team member of workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members 
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM workspaces 
    WHERE id = ws_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Team members policies
CREATE POLICY "Users can view team members in their workspaces" ON team_members
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Admins can manage team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.workspace_id = team_members.workspace_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin')
    ) OR EXISTS (
      SELECT 1 FROM workspaces w 
      WHERE w.id = team_members.workspace_id 
      AND w.user_id = auth.uid()
    )
  );

-- Team invitations policies
CREATE POLICY "Users can view invitations for their workspaces" ON team_invitations
  FOR SELECT USING (is_workspace_member(workspace_id) OR email = auth.email());

CREATE POLICY "Admins can manage invitations" ON team_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.workspace_id = team_invitations.workspace_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin')
    ) OR EXISTS (
      SELECT 1 FROM workspaces w 
      WHERE w.id = team_invitations.workspace_id 
      AND w.user_id = auth.uid()
    )
  );

-- Assets policies
CREATE POLICY "Team members can view assets" ON assets
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Editors can create assets" ON assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.workspace_id = assets.workspace_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin', 'editor')
    ) OR EXISTS (
      SELECT 1 FROM workspaces w 
      WHERE w.id = assets.workspace_id 
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can update assets" ON assets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.workspace_id = assets.workspace_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin', 'editor')
    ) OR EXISTS (
      SELECT 1 FROM workspaces w 
      WHERE w.id = assets.workspace_id 
      AND w.user_id = auth.uid()
    )
  );

-- Asset versions policies
CREATE POLICY "Team members can view asset versions" ON asset_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assets a 
      WHERE a.id = asset_versions.asset_id 
      AND is_workspace_member(a.workspace_id)
    )
  );

-- Comments policies
CREATE POLICY "Team members can view comments" ON comments
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Team members can create comments" ON comments
  FOR INSERT WITH CHECK (is_workspace_member(workspace_id) AND user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- Approval requests policies
CREATE POLICY "Team members can view approval requests" ON approval_requests
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Editors can create approval requests" ON approval_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.workspace_id = approval_requests.workspace_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin', 'editor')
    ) OR EXISTS (
      SELECT 1 FROM workspaces w 
      WHERE w.id = approval_requests.workspace_id 
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update approval requests" ON approval_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.workspace_id = approval_requests.workspace_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin')
    ) OR EXISTS (
      SELECT 1 FROM workspaces w 
      WHERE w.id = approval_requests.workspace_id 
      AND w.user_id = auth.uid()
    )
  );

-- Personalization sets policies
CREATE POLICY "Team members can view personalization sets" ON personalization_sets
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Editors can manage personalization sets" ON personalization_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.workspace_id = personalization_sets.workspace_id 
      AND tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin', 'editor')
    ) OR EXISTS (
      SELECT 1 FROM workspaces w 
      WHERE w.id = personalization_sets.workspace_id 
      AND w.user_id = auth.uid()
    )
  );
