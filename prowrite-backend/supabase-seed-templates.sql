-- Seed default templates for ProWrite AI
-- Run this in Supabase SQL Editor after creating the schema

-- Cold Email Templates
INSERT INTO templates (workspace_id, module_type, name, description, system_prompt, input_schema, output_format, tags, is_custom)
VALUES 
(NULL, 'cold_email', 'Initial Outreach', 'First contact email for cold outreach campaigns',
'You are an expert B2B sales copywriter. Generate a compelling cold outreach email that:
- Opens with a personalized hook based on the recipient''s company or role
- Clearly articulates the value proposition
- Keeps the email concise (under 150 words)
- Ends with a clear, low-friction call to action
- Maintains a professional tone throughout

Format the output as:
SUBJECT: [subject line]
BODY:
[email body]',
'{"fields": [
  {"name": "recipient_name", "label": "Recipient Name", "type": "text", "required": true, "placeholder": "John Smith"},
  {"name": "recipient_company", "label": "Company", "type": "text", "required": true, "placeholder": "Acme Corp"},
  {"name": "recipient_title", "label": "Job Title", "type": "text", "required": true, "placeholder": "VP of Sales"},
  {"name": "value_proposition", "label": "Value Proposition", "type": "textarea", "required": true, "placeholder": "Describe what you offer and the key benefit"},
  {"name": "tone", "label": "Tone", "type": "select", "required": true, "options": ["professional", "casual", "friendly", "formal"]}
]}',
'SUBJECT: [subject]\nBODY:\n[body]',
ARRAY['outreach', 'sales', 'b2b'],
false),

(NULL, 'cold_email', 'Follow-Up Email', 'Follow-up email for prospects who haven''t responded',
'You are an expert B2B sales copywriter. Generate a follow-up email that:
- References the previous outreach without being pushy
- Provides additional value or a new angle
- Keeps the email brief (under 100 words)
- Includes a clear call to action

Format the output as:
SUBJECT: [subject line]
BODY:
[email body]',
'{"fields": [
  {"name": "recipient_name", "label": "Recipient Name", "type": "text", "required": true, "placeholder": "John Smith"},
  {"name": "recipient_company", "label": "Company", "type": "text", "required": true, "placeholder": "Acme Corp"},
  {"name": "previous_context", "label": "Previous Email Context", "type": "textarea", "required": true, "placeholder": "What was your previous email about?"},
  {"name": "new_value", "label": "New Value/Angle", "type": "textarea", "required": false, "placeholder": "Any new information to share?"}
]}',
'SUBJECT: [subject]\nBODY:\n[body]',
ARRAY['follow-up', 'sales', 'b2b'],
false);

-- Website Copy Templates
INSERT INTO templates (workspace_id, module_type, name, description, system_prompt, input_schema, output_format, tags, is_custom)
VALUES 
(NULL, 'website_copy', 'Landing Page', 'Complete landing page copy with headline, benefits, and CTA',
'You are an expert conversion copywriter. Generate landing page copy that:
- Has a compelling headline that captures attention
- Includes a clear subheadline that explains the value
- Lists 3-5 key benefits with brief descriptions
- Has a strong call-to-action
- Includes an SEO meta description (under 160 characters)

Format the output as:
HEADLINE: [headline]
SUBHEADLINE: [subheadline]
BENEFITS:
- [benefit 1]: [description]
- [benefit 2]: [description]
- [benefit 3]: [description]
CTA: [call to action text]
META_DESCRIPTION: [SEO meta description]',
'{"fields": [
  {"name": "product_name", "label": "Product/Service Name", "type": "text", "required": true, "placeholder": "ProWrite AI"},
  {"name": "product_description", "label": "Product Description", "type": "textarea", "required": true, "placeholder": "Describe your product or service"},
  {"name": "target_audience", "label": "Target Audience", "type": "text", "required": true, "placeholder": "Small business owners"},
  {"name": "key_benefits", "label": "Key Benefits", "type": "textarea", "required": true, "placeholder": "List 3-5 main benefits"},
  {"name": "unique_selling_point", "label": "Unique Selling Point", "type": "text", "required": false, "placeholder": "What makes you different?"}
]}',
'HEADLINE: [headline]\nSUBHEADLINE: [subheadline]\nBENEFITS:\n[benefits]\nCTA: [cta]\nMETA_DESCRIPTION: [meta]',
ARRAY['landing-page', 'conversion', 'marketing'],
false),

(NULL, 'website_copy', 'Product Description', 'Compelling product description for e-commerce',
'You are an expert product copywriter. Generate a product description that:
- Highlights key features and benefits
- Addresses the target audience''s pain points
- Uses persuasive language without being pushy
- Is scannable with clear sections

Format the output as:
TITLE: [product title]
TAGLINE: [short tagline]
DESCRIPTION: [main description - 2-3 paragraphs]
FEATURES:
- [feature 1]
- [feature 2]
- [feature 3]',
'{"fields": [
  {"name": "product_name", "label": "Product Name", "type": "text", "required": true, "placeholder": "Wireless Headphones"},
  {"name": "product_details", "label": "Product Details", "type": "textarea", "required": true, "placeholder": "Describe the product features"},
  {"name": "target_audience", "label": "Target Audience", "type": "text", "required": true, "placeholder": "Music lovers, remote workers"},
  {"name": "price_point", "label": "Price Point", "type": "text", "required": false, "placeholder": "$99"}
]}',
'TITLE: [title]\nTAGLINE: [tagline]\nDESCRIPTION: [description]\nFEATURES:\n[features]',
ARRAY['product', 'e-commerce', 'description'],
false);

-- YouTube Scripts Templates
INSERT INTO templates (workspace_id, module_type, name, description, system_prompt, input_schema, output_format, tags, is_custom)
VALUES 
(NULL, 'youtube_scripts', 'Tutorial Video Script', 'Script for educational/tutorial YouTube videos',
'You are an expert YouTube content creator. Generate a tutorial video script that:
- Has a hook in the first 10 seconds to grab attention
- Clearly explains the topic step by step
- Includes timestamps for sections
- Has a strong call to action at the end
- Is engaging and conversational

Format the output as:
TITLE: [video title]
HOOK: [opening hook - first 10 seconds]
INTRO: [introduction - who you are, what they''ll learn]
SECTIONS:
[00:00] Hook & Intro
[00:30] [section 1 title]
[content for section 1]
[02:00] [section 2 title]
[content for section 2]
OUTRO: [closing and CTA - subscribe, like, comment]',
'{"fields": [
  {"name": "topic", "label": "Video Topic", "type": "text", "required": true, "placeholder": "How to build a REST API"},
  {"name": "target_audience", "label": "Target Audience", "type": "text", "required": true, "placeholder": "Beginner developers"},
  {"name": "key_points", "label": "Key Points to Cover", "type": "textarea", "required": true, "placeholder": "List the main points you want to cover"},
  {"name": "video_length", "label": "Target Length (minutes)", "type": "number", "required": false, "placeholder": "10"},
  {"name": "channel_name", "label": "Channel Name", "type": "text", "required": false, "placeholder": "Your channel name"}
]}',
'TITLE: [title]\nHOOK: [hook]\nINTRO: [intro]\nSECTIONS:\n[sections]\nOUTRO: [outro]',
ARRAY['tutorial', 'educational', 'youtube'],
false),

(NULL, 'youtube_scripts', 'Product Review Script', 'Script for product review videos',
'You are an expert YouTube content creator. Generate a product review script that:
- Opens with an attention-grabbing hook
- Provides honest, balanced review
- Covers pros and cons
- Includes personal experience/opinion
- Has clear verdict and recommendation

Format the output as:
TITLE: [video title]
HOOK: [opening hook]
OVERVIEW: [product overview]
PROS:
- [pro 1]
- [pro 2]
- [pro 3]
CONS:
- [con 1]
- [con 2]
VERDICT: [final verdict and recommendation]
CTA: [call to action]',
'{"fields": [
  {"name": "product_name", "label": "Product Name", "type": "text", "required": true, "placeholder": "iPhone 15 Pro"},
  {"name": "product_category", "label": "Product Category", "type": "text", "required": true, "placeholder": "Smartphone"},
  {"name": "key_features", "label": "Key Features", "type": "textarea", "required": true, "placeholder": "List main features to review"},
  {"name": "price", "label": "Price", "type": "text", "required": false, "placeholder": "$999"},
  {"name": "overall_rating", "label": "Your Rating (1-10)", "type": "number", "required": false, "placeholder": "8"}
]}',
'TITLE: [title]\nHOOK: [hook]\nOVERVIEW: [overview]\nPROS:\n[pros]\nCONS:\n[cons]\nVERDICT: [verdict]\nCTA: [cta]',
ARRAY['review', 'product', 'youtube'],
false);

-- HR Docs Templates
INSERT INTO templates (workspace_id, module_type, name, description, system_prompt, input_schema, output_format, tags, is_custom)
VALUES 
(NULL, 'hr_docs', 'Job Description', 'Professional job description with responsibilities and requirements',
'You are an expert HR professional. Generate a job description that:
- Has a clear, searchable job title
- Describes the role and its impact
- Lists key responsibilities (5-7 bullet points)
- Specifies required and preferred qualifications
- Reflects the company culture
- Is inclusive and avoids biased language

Format the output as:
TITLE: [job title]
ABOUT_US: [brief company description]
ABOUT_THE_ROLE: [role description and impact]
RESPONSIBILITIES:
- [responsibility 1]
- [responsibility 2]
- [responsibility 3]
REQUIREMENTS:
- [requirement 1]
- [requirement 2]
PREFERRED:
- [preferred qualification 1]
- [preferred qualification 2]
BENEFITS: [key benefits]',
'{"fields": [
  {"name": "job_title", "label": "Job Title", "type": "text", "required": true, "placeholder": "Senior Software Engineer"},
  {"name": "department", "label": "Department", "type": "text", "required": true, "placeholder": "Engineering"},
  {"name": "company_name", "label": "Company Name", "type": "text", "required": true, "placeholder": "Acme Corp"},
  {"name": "responsibilities", "label": "Key Responsibilities", "type": "textarea", "required": true, "placeholder": "List main responsibilities"},
  {"name": "requirements", "label": "Requirements", "type": "textarea", "required": true, "placeholder": "List required qualifications"},
  {"name": "location", "label": "Location", "type": "text", "required": false, "placeholder": "Remote / New York, NY"}
]}',
'TITLE: [title]\nABOUT_US: [about]\nABOUT_THE_ROLE: [role]\nRESPONSIBILITIES:\n[responsibilities]\nREQUIREMENTS:\n[requirements]\nPREFERRED:\n[preferred]\nBENEFITS: [benefits]',
ARRAY['job-description', 'hiring', 'recruitment'],
false),

(NULL, 'hr_docs', 'Offer Letter', 'Professional job offer letter',
'You are an expert HR professional. Generate a professional offer letter that:
- Congratulates the candidate warmly
- Clearly states the position and start date
- Outlines compensation and benefits
- Includes next steps and deadline to respond
- Maintains a warm but professional tone

Format the output as:
SUBJECT: [email subject line]
BODY:
[Full offer letter body with proper formatting]',
'{"fields": [
  {"name": "candidate_name", "label": "Candidate Name", "type": "text", "required": true, "placeholder": "Jane Smith"},
  {"name": "job_title", "label": "Position Title", "type": "text", "required": true, "placeholder": "Senior Software Engineer"},
  {"name": "company_name", "label": "Company Name", "type": "text", "required": true, "placeholder": "Acme Corp"},
  {"name": "start_date", "label": "Start Date", "type": "text", "required": true, "placeholder": "January 15, 2025"},
  {"name": "salary", "label": "Annual Salary", "type": "text", "required": true, "placeholder": "$120,000"},
  {"name": "benefits", "label": "Key Benefits", "type": "textarea", "required": false, "placeholder": "Health insurance, 401k, PTO"}
]}',
'SUBJECT: [subject]\nBODY:\n[body]',
ARRAY['offer-letter', 'hiring', 'onboarding'],
false);

-- Verify insertion
SELECT module_type, COUNT(*) as count FROM templates GROUP BY module_type;
