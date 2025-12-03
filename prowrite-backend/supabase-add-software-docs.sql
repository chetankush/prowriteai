-- Add software_docs to module_type enum
-- Run this in your Supabase SQL Editor

-- Add the new enum value
ALTER TYPE module_type ADD VALUE IF NOT EXISTS 'software_docs';
