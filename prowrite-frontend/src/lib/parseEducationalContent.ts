/**
 * Parser for educational content sections in AI responses
 * 
 * Extracts structured sections like "WHY THIS WORKS", "IMPROVEMENTS TO CONSIDER",
 * "FRAMEWORK", etc. from AI-generated content for display in collapsible UI elements.
 * 
 * Requirements: 6.1, 6.3 - Parse explanations and display in collapsible elements
 */

export interface EducationalSection {
  type: 'explanation' | 'improvement' | 'framework' | 'analysis' | 'checklist';
  title: string;
  content: string;
  icon?: string;
}

export interface ParsedContent {
  mainContent: string;
  educationalSections: EducationalSection[];
}

// Section patterns to extract from AI responses
const SECTION_PATTERNS: Array<{
  pattern: RegExp;
  type: EducationalSection['type'];
  title: string;
  icon: string;
}> = [
  {
    pattern: /\*\*WHY THIS WORKS:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'explanation',
    title: 'Why This Works',
    icon: '💡',
  },
  {
    pattern: /\*\*IMPROVEMENTS TO CONSIDER:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'improvement',
    title: 'Improvements to Consider',
    icon: '🎯',
  },
  {
    pattern: /\*\*FRAMEWORK:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'framework',
    title: 'Framework Applied',
    icon: '📋',
  },
  {
    pattern: /\*\*INCLUSIVE LANGUAGE CHECK:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'checklist',
    title: 'Inclusive Language Check',
    icon: '✅',
  },
  {
    pattern: /\*\*COMPLIANCE CHECKLIST:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'checklist',
    title: 'Compliance Checklist',
    icon: '📝',
  },
  {
    pattern: /\*\*RETENTION ANALYSIS:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'analysis',
    title: 'Retention Analysis',
    icon: '📊',
  },
  {
    pattern: /\*\*CONVERSION ANALYSIS:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'analysis',
    title: 'Conversion Analysis',
    icon: '📈',
  },
  {
    pattern: /\*\*CANDIDATE APPEAL SCORE:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'analysis',
    title: 'Candidate Appeal Score',
    icon: '⭐',
  },
  {
    pattern: /\*\*JURISDICTION NOTES:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'checklist',
    title: 'Jurisdiction Notes',
    icon: '⚖️',
  },
  {
    pattern: /\*\*SEO ELEMENTS:\*\*\s*([\s\S]*?)(?=\n\n\*\*[A-Z]|\n\n##|\n\n====|$)/gi,
    type: 'analysis',
    title: 'SEO Elements',
    icon: '🔍',
  },
];

/**
 * Parse AI response content to extract educational sections
 */
export function parseEducationalContent(content: string): ParsedContent {
  const educationalSections: EducationalSection[] = [];
  let mainContent = content;

  for (const { pattern, type, title, icon } of SECTION_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const sectionContent = match[1].trim();
      
      if (sectionContent) {
        educationalSections.push({
          type,
          title,
          content: sectionContent,
          icon,
        });
        
        // Remove the matched section from main content
        mainContent = mainContent.replace(match[0], '');
      }
    }
  }

  // Clean up extra whitespace in main content
  mainContent = mainContent
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    mainContent,
    educationalSections,
  };
}

/**
 * Check if content has any educational sections
 */
export function hasEducationalContent(content: string): boolean {
  return SECTION_PATTERNS.some(({ pattern }) => {
    pattern.lastIndex = 0;
    return pattern.test(content);
  });
}
