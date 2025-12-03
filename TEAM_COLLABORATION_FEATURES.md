# ProWrite AI - Team Collaboration Features

## What Makes ProWrite AI Different from ChatGPT

This document outlines the key differentiators implemented for sales, content, copywriting, and HR teams.

---

## 1. Team Collaboration (ChatGPT: ❌ | ProWrite: ✅)

**Problem ChatGPT has:** Single-user only. Teams can't share prompts, templates, or outputs.

**ProWrite Solution:**
- **Team Members:** Invite colleagues to your workspace
- **Role-Based Permissions:**
  - `Owner` - Full access, cannot be removed
  - `Admin` - Can manage team and all content
  - `Editor` - Can create and edit content
  - `Viewer` - Can only view content
- **Invitation System:** Email-based invitations with 7-day expiry

**API Endpoints:**
- `GET /api/team/members` - List team members
- `POST /api/team/invite` - Invite new member
- `PUT /api/team/members/:id/role` - Update role
- `DELETE /api/team/members/:id` - Remove member

---

## 2. Asset Library / Content Repository (ChatGPT: ❌ | ProWrite: ✅)

**Problem ChatGPT has:** Outputs disappear. Teams re-create the same content repeatedly.

**ProWrite Solution:**
- **Save to Library:** One-click save from chat to asset library
- **Organize by Type:** Email, Job Description, Offer Letter, Script, Landing Page, etc.
- **Status Workflow:** Draft → Pending Review → Approved → Archived
- **Tags & Search:** Full-text search and tag filtering
- **Version History:** Track all changes with ability to restore previous versions

**API Endpoints:**
- `GET /api/team/assets` - List assets with filters
- `POST /api/team/assets` - Create new asset
- `PUT /api/team/assets/:id` - Update asset
- `GET /api/team/assets/:id/versions` - Get version history
- `POST /api/team/assets/:id/restore/:versionId` - Restore version

---

## 3. Approval Workflows (ChatGPT: ❌ | ProWrite: ✅)

**Problem ChatGPT has:** No review process. Content goes live without approval.

**ProWrite Solution:**
- **Submit for Review:** Request approval on any asset
- **Assign Reviewers:** Route to specific team members
- **Approval Actions:**
  - ✅ Approve - Content is ready
  - ❌ Reject - Content is not suitable
  - 🔄 Request Revision - Needs changes with feedback
- **Audit Trail:** Full history of all approval decisions

**API Endpoints:**
- `GET /api/team/approvals` - List approval requests
- `GET /api/team/approvals/my-pending` - My pending reviews
- `POST /api/team/approvals` - Submit for approval
- `PUT /api/team/approvals/:id` - Approve/Reject/Request revision

---

## 4. Mail Merge / Bulk Personalization (ChatGPT: ❌ | ProWrite: ✅)

**Problem ChatGPT has:** Can't do bulk personalization. One email at a time.

**ProWrite Solution:**
- **Template Variables:** Use `{{first_name}}`, `{{company}}`, `{{pain_point}}` syntax
- **CSV Upload:** Upload recipient data via CSV file
- **Bulk Generation:** Generate 1000+ personalized versions instantly
- **Export Results:** Download all personalized content as CSV
- **Variable Extraction:** Auto-detect variables in templates

**API Endpoints:**
- `POST /api/team/personalize/extract-variables` - Find variables in template
- `POST /api/team/personalize/parse-csv` - Parse CSV data
- `POST /api/team/personalize/bulk` - Generate personalized versions
- `GET /api/team/personalization-sets` - Saved variable sets

---

## Database Schema

Run `supabase-team-collaboration.sql` in your Supabase SQL Editor to create:

- `team_members` - Team membership with roles
- `team_invitations` - Pending invitations
- `assets` - Content library
- `asset_versions` - Version history
- `comments` - Team comments on content
- `approval_requests` - Approval workflow
- `personalization_sets` - Saved variable sets

---

## Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Team Management | `/team` | Invite members, manage roles |
| Asset Library | `/assets` | Browse, search, save content |
| Approvals | `/approvals` | Review and approve content |
| Mail Merge | `/personalization` | Bulk personalization tool |

---

## Use Cases by Team

### Sales Teams
- Save winning cold email templates to library
- Bulk personalize outreach for 100s of prospects
- Get manager approval before sending campaigns
- Share best-performing templates with team

### HR Teams
- Store approved JD templates
- Version control for offer letters
- Compliance approval workflow
- Team access to standard documents

### Content Teams
- Collaborate on scripts and copy
- Review process for brand consistency
- Asset library for reusable content blocks
- Track content versions over time

### Marketing Teams
- Bulk generate product descriptions
- Approval workflow for landing pages
- Shared template library
- Personalized campaign content

---

## Summary: ChatGPT vs ProWrite AI

| Feature | ChatGPT | ProWrite AI |
|---------|---------|-------------|
| Team Collaboration | ❌ | ✅ |
| Role-Based Permissions | ❌ | ✅ |
| Asset Library | ❌ | ✅ |
| Version History | ❌ | ✅ |
| Approval Workflows | ❌ | ✅ |
| Bulk Personalization | ❌ | ✅ |
| CSV Mail Merge | ❌ | ✅ |
| Industry Templates | ❌ | ✅ |
| Brand Voice Training | ❌ | ✅ |
| Save to Library | ❌ | ✅ |
