-- Seed templates for Software Documentation module
-- Run this after supabase-add-software-docs.sql

-- PR Description Template
INSERT INTO templates (
  workspace_id,
  module_type,
  name,
  description,
  system_prompt,
  input_schema,
  output_format,
  tags,
  is_custom
) VALUES (
  NULL,
  'software_docs',
  'PR Description',
  'Generate a comprehensive pull request description',
  'Generate a professional PR description with: Summary, Changes Made, Testing Done, Screenshots (if applicable), and Checklist.',
  '[
    {"name": "pr_title", "label": "PR Title", "type": "text", "required": true, "placeholder": "Add user authentication"},
    {"name": "changes", "label": "What changes were made?", "type": "textarea", "required": true, "placeholder": "Added JWT authentication, login/logout endpoints..."},
    {"name": "why", "label": "Why were these changes needed?", "type": "textarea", "required": true, "placeholder": "Users need to securely access their accounts..."},
    {"name": "testing", "label": "How was this tested?", "type": "textarea", "required": false, "placeholder": "Unit tests, manual testing..."},
    {"name": "breaking_changes", "label": "Any breaking changes?", "type": "text", "required": false, "placeholder": "None / Yes - describe"}
  ]',
  'Markdown formatted PR description with sections',
  ARRAY['pr', 'github', 'developer'],
  false
);

-- Test Cases Template
INSERT INTO templates (
  workspace_id,
  module_type,
  name,
  description,
  system_prompt,
  input_schema,
  output_format,
  tags,
  is_custom
) VALUES (
  NULL,
  'software_docs',
  'Test Cases (Given-When-Then)',
  'Generate test cases in Given-When-Then format',
  'Generate comprehensive test cases using the Given-When-Then format. Include positive, negative, and edge cases.',
  '[
    {"name": "feature", "label": "Feature Name", "type": "text", "required": true, "placeholder": "User Login"},
    {"name": "description", "label": "Feature Description", "type": "textarea", "required": true, "placeholder": "Users can log in with email and password..."},
    {"name": "acceptance_criteria", "label": "Acceptance Criteria", "type": "textarea", "required": false, "placeholder": "User should see dashboard after login..."},
    {"name": "num_cases", "label": "Number of Test Cases", "type": "select", "required": true, "options": ["5", "10", "15", "20"]}
  ]',
  'Test cases in Given-When-Then format',
  ARRAY['qa', 'testing', 'bdd'],
  false
);

-- Bug Report Template
INSERT INTO templates (
  workspace_id,
  module_type,
  name,
  description,
  system_prompt,
  input_schema,
  output_format,
  tags,
  is_custom
) VALUES (
  NULL,
  'software_docs',
  'Bug Report',
  'Generate a detailed bug report',
  'Generate a professional bug report with clear steps to reproduce, expected vs actual behavior, and environment details.',
  '[
    {"name": "title", "label": "Bug Title", "type": "text", "required": true, "placeholder": "Login button not responding on mobile"},
    {"name": "description", "label": "Bug Description", "type": "textarea", "required": true, "placeholder": "When clicking the login button on mobile..."},
    {"name": "steps", "label": "Steps to Reproduce", "type": "textarea", "required": true, "placeholder": "1. Open app on mobile\n2. Enter credentials\n3. Click login"},
    {"name": "expected", "label": "Expected Behavior", "type": "textarea", "required": true, "placeholder": "User should be logged in"},
    {"name": "actual", "label": "Actual Behavior", "type": "textarea", "required": true, "placeholder": "Nothing happens"},
    {"name": "environment", "label": "Environment", "type": "text", "required": false, "placeholder": "iOS 17, Safari"}
  ]',
  'Structured bug report',
  ARRAY['qa', 'bug', 'issue'],
  false
);

-- Release Notes Template
INSERT INTO templates (
  workspace_id,
  module_type,
  name,
  description,
  system_prompt,
  input_schema,
  output_format,
  tags,
  is_custom
) VALUES (
  NULL,
  'software_docs',
  'Release Notes',
  'Generate professional release notes',
  'Generate user-friendly release notes organized by: New Features, Improvements, Bug Fixes, and Breaking Changes.',
  '[
    {"name": "version", "label": "Version Number", "type": "text", "required": true, "placeholder": "2.0.0"},
    {"name": "release_date", "label": "Release Date", "type": "text", "required": true, "placeholder": "December 1, 2025"},
    {"name": "features", "label": "New Features", "type": "textarea", "required": false, "placeholder": "- Added dark mode\n- New dashboard"},
    {"name": "improvements", "label": "Improvements", "type": "textarea", "required": false, "placeholder": "- Faster loading\n- Better mobile support"},
    {"name": "bug_fixes", "label": "Bug Fixes", "type": "textarea", "required": false, "placeholder": "- Fixed login issue\n- Fixed crash on startup"},
    {"name": "breaking_changes", "label": "Breaking Changes", "type": "textarea", "required": false, "placeholder": "- API v1 deprecated"}
  ]',
  'Formatted release notes',
  ARRAY['release', 'changelog', 'pm'],
  false
);

-- User Story Template
INSERT INTO templates (
  workspace_id,
  module_type,
  name,
  description,
  system_prompt,
  input_schema,
  output_format,
  tags,
  is_custom
) VALUES (
  NULL,
  'software_docs',
  'User Story with Acceptance Criteria',
  'Generate a user story with detailed acceptance criteria',
  'Generate a user story in the format "As a [user], I want [goal], so that [benefit]" with detailed acceptance criteria and edge cases.',
  '[
    {"name": "user_type", "label": "User Type", "type": "text", "required": true, "placeholder": "registered user"},
    {"name": "goal", "label": "What does the user want?", "type": "textarea", "required": true, "placeholder": "reset my password"},
    {"name": "benefit", "label": "Why do they want it?", "type": "textarea", "required": true, "placeholder": "I can regain access to my account"},
    {"name": "context", "label": "Additional Context", "type": "textarea", "required": false, "placeholder": "Should work via email link"}
  ]',
  'User story with acceptance criteria',
  ARRAY['pm', 'agile', 'story'],
  false
);

-- README Template
INSERT INTO templates (
  workspace_id,
  module_type,
  name,
  description,
  system_prompt,
  input_schema,
  output_format,
  tags,
  is_custom
) VALUES (
  NULL,
  'software_docs',
  'README File',
  'Generate a comprehensive README for your project',
  'Generate a professional README with: Project description, Features, Installation, Usage, Configuration, Contributing, and License sections.',
  '[
    {"name": "project_name", "label": "Project Name", "type": "text", "required": true, "placeholder": "MyAwesomeApp"},
    {"name": "description", "label": "Project Description", "type": "textarea", "required": true, "placeholder": "A tool that helps developers..."},
    {"name": "tech_stack", "label": "Tech Stack", "type": "text", "required": true, "placeholder": "React, Node.js, PostgreSQL"},
    {"name": "features", "label": "Key Features", "type": "textarea", "required": true, "placeholder": "- Feature 1\n- Feature 2"},
    {"name": "installation", "label": "Installation Steps", "type": "textarea", "required": false, "placeholder": "npm install"},
    {"name": "license", "label": "License", "type": "select", "required": true, "options": ["MIT", "Apache 2.0", "GPL 3.0", "BSD 3-Clause", "Proprietary"]}
  ]',
  'Complete README.md file',
  ARRAY['readme', 'documentation', 'github'],
  false
);

-- Postmortem Template
INSERT INTO templates (
  workspace_id,
  module_type,
  name,
  description,
  system_prompt,
  input_schema,
  output_format,
  tags,
  is_custom
) VALUES (
  NULL,
  'software_docs',
  'Incident Postmortem',
  'Generate a blameless postmortem report',
  'Generate a blameless postmortem with: Summary, Impact, Timeline, Root Cause Analysis, Action Items, and Lessons Learned.',
  '[
    {"name": "incident_title", "label": "Incident Title", "type": "text", "required": true, "placeholder": "Database outage on 2025-12-01"},
    {"name": "summary", "label": "Incident Summary", "type": "textarea", "required": true, "placeholder": "Production database became unavailable..."},
    {"name": "impact", "label": "Impact", "type": "textarea", "required": true, "placeholder": "Users unable to login for 2 hours..."},
    {"name": "timeline", "label": "Timeline of Events", "type": "textarea", "required": true, "placeholder": "10:00 - Alert triggered\n10:05 - Team notified..."},
    {"name": "root_cause", "label": "Root Cause", "type": "textarea", "required": true, "placeholder": "Disk space exhausted due to log rotation failure"},
    {"name": "resolution", "label": "How was it resolved?", "type": "textarea", "required": true, "placeholder": "Cleared old logs, increased disk space"}
  ]',
  'Blameless postmortem document',
  ARRAY['incident', 'postmortem', 'devops'],
  false
);

-- Sprint Summary Template
INSERT INTO templates (
  workspace_id,
  module_type,
  name,
  description,
  system_prompt,
  input_schema,
  output_format,
  tags,
  is_custom
) VALUES (
  NULL,
  'software_docs',
  'Sprint Summary',
  'Generate a sprint summary report',
  'Generate a sprint summary with: Completed Items, In Progress, Blockers, Metrics, and Next Sprint Goals.',
  '[
    {"name": "sprint_name", "label": "Sprint Name/Number", "type": "text", "required": true, "placeholder": "Sprint 23"},
    {"name": "dates", "label": "Sprint Dates", "type": "text", "required": true, "placeholder": "Nov 18 - Dec 1, 2025"},
    {"name": "completed", "label": "Completed Items", "type": "textarea", "required": true, "placeholder": "- User authentication\n- Dashboard redesign"},
    {"name": "in_progress", "label": "In Progress", "type": "textarea", "required": false, "placeholder": "- Payment integration"},
    {"name": "blockers", "label": "Blockers", "type": "textarea", "required": false, "placeholder": "- Waiting for API access"},
    {"name": "velocity", "label": "Story Points Completed", "type": "text", "required": false, "placeholder": "34"}
  ]',
  'Sprint summary report',
  ARRAY['sprint', 'agile', 'scrum'],
  false
);
