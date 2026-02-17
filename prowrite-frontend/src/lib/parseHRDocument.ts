/**
 * Parser for HR document blocks in AI responses
 * 
 * Extracts HR documents from AI-generated content, separating the formal document
 * from any explanatory text for proper formatting and copy functionality.
 * 
 * Requirements: 5.4, 6.4, 6.6 - Parse and format HR documents, exclude AI explanations from copyable block
 */

export interface HRDocumentBlock {
  documentContent: string;
  documentType: string;
}

export interface ParsedHRResponse {
  explanationBefore: string;
  documentBlock: HRDocumentBlock | null;
  explanationAfter: string;
}

// HR document type patterns to detect
const HR_DOCUMENT_TYPES = [
  'Offer Letter',
  'Appointment Letter',
  'Joining Letter',
  'Non-Disclosure Agreement',
  'NDA',
  'Probation Confirmation',
  'Salary Increment Letter',
  'Promotion Letter',
  'Role Change Letter',
  'Leave Application',
  'Leave Approval',
  'Work From Home Request',
  'Warning Letter',
  'Show Cause Notice',
  'Resignation Letter',
  'Resignation Acceptance',
  'Termination Letter',
  'Experience Letter',
  'Relieving Letter',
  'Full and Final Settlement',
  'No Dues Certificate',
  'Asset Allocation',
  'Asset Handover',
];

// Pattern to match document headers (date line followed by formal structure)
const DOCUMENT_START_PATTERNS = [
  // Date at start of line (various formats)
  /^(Date:\s*)?(\d{1,2}[\s\/\-\.]\w+[\s\/\-\.]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4}[\-\/]\d{2}[\-\/]\d{2})/m,
  // "To:" or "Dear" addressing
  /^(To:|Dear\s+)/m,
  // Subject line
  /^(Subject:|Re:|Ref:)/mi,
];

// Pattern to detect end of formal document
const DOCUMENT_END_PATTERNS = [
  // Signature blocks
  /^(Sincerely|Regards|Best regards|Yours faithfully|Yours sincerely|Warm regards|With regards|Respectfully),?\s*$/mi,
  // Authorized signatory
  /^(Authorized Signatory|HR Manager|Human Resources|For and on behalf of)/mi,
];

// Patterns that indicate explanatory text (not part of the document)
const EXPLANATION_PATTERNS = [
  /^(Here'?s?|I'?ve|This|The following|Below|Above|Please find|Attached|Note:|Important:|Remember:|Tips?:|Suggestion:|Explanation:|Analysis:)/i,
  /\*\*(WHY THIS WORKS|IMPROVEMENTS|FRAMEWORK|CHECKLIST|NOTES?):\*\*/i,
  /^(Let me|I can|Would you|Do you|Feel free|If you|You can|You may|Please let)/i,
  /^(---+|===+|\*\*\*+)$/,
  // Additional AI explanation patterns
  /^(I hope|Hope this|Is there anything|Would you like me to|Shall I|Should I|Happy to)/i,
  /^(Key (points|highlights|features|sections)|Summary:|Overview:|Breakdown:)/i,
  /^(Make sure|Don't forget|Keep in mind|Consider|Ensure)/i,
  /^(\d+\.\s+\*\*|•\s+\*\*|-\s+\*\*)/, // Bullet points with bold (common in AI explanations)
];

// Pattern to detect markdown code block markers
const CODE_BLOCK_PATTERN = /^```\w*$/;



/**
 * Detect the type of HR document from content
 */
function detectDocumentType(content: string): string {
  const upperContent = content.toUpperCase();
  
  for (const docType of HR_DOCUMENT_TYPES) {
    if (upperContent.includes(docType.toUpperCase())) {
      return docType;
    }
  }
  
  // Check for subject line patterns
  const subjectMatch = content.match(/Subject:\s*(.+?)(?:\n|$)/i);
  if (subjectMatch) {
    const subject = subjectMatch[1].trim();
    for (const docType of HR_DOCUMENT_TYPES) {
      if (subject.toUpperCase().includes(docType.toUpperCase())) {
        return docType;
      }
    }
  }
  
  return 'HR Document';
}

/**
 * Check if content contains a formal HR document structure
 */
export function containsHRDocument(content: string): boolean {
  // Must have at least one document start pattern
  const hasStartPattern = DOCUMENT_START_PATTERNS.some(pattern => pattern.test(content));
  
  // Must have at least one document end pattern
  const hasEndPattern = DOCUMENT_END_PATTERNS.some(pattern => pattern.test(content));
  
  // Must contain HR document type keywords
  const hasDocumentType = HR_DOCUMENT_TYPES.some(type => 
    content.toUpperCase().includes(type.toUpperCase())
  );
  
  return hasStartPattern && hasEndPattern && hasDocumentType;
}

/**
 * Strip markdown code block markers from content
 */
function stripCodeBlockMarkers(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    // Skip markdown code block markers (``` or ```text, etc.)
    if (!CODE_BLOCK_PATTERN.test(line.trim())) {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

/**
 * Check if a line is an explanation line (not part of formal document)
 */
function isExplanationLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return EXPLANATION_PATTERNS.some(p => p.test(trimmed));
}

/**
 * Parse AI response to extract HR document block and separate explanations
 */
export function parseHRDocument(content: string): ParsedHRResponse {
  if (!containsHRDocument(content)) {
    return {
      explanationBefore: content,
      documentBlock: null,
      explanationAfter: '',
    };
  }

  // Pre-process: strip markdown code block markers
  const processedContent = stripCodeBlockMarkers(content);
  const lines = processedContent.split('\n');
  let documentStartIndex = -1;
  let documentEndIndex = -1;
  
  // Find document start - look for date or formal addressing
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines at the start
    if (!line && documentStartIndex === -1) continue;
    
    // Check if this line starts the document
    const isDateLine = DOCUMENT_START_PATTERNS[0].test(line);
    const isAddressing = DOCUMENT_START_PATTERNS[1].test(line);
    const isSubject = DOCUMENT_START_PATTERNS[2].test(line);
    
    // Check if previous lines were explanatory
    if (documentStartIndex === -1 && (isDateLine || isAddressing || isSubject)) {
      // Verify this isn't preceded by explanation text on the same conceptual block
      let isAfterExplanation = false;
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (isExplanationLine(lines[j])) {
          isAfterExplanation = true;
          break;
        }
      }
      
      if (!isAfterExplanation || i === 0) {
        documentStartIndex = i;
      } else if (isDateLine) {
        // Date line is a strong indicator, use it even after explanation
        documentStartIndex = i;
      }
    }
  }
  
  // Find document end - look for signature block
  if (documentStartIndex !== -1) {
    for (let i = documentStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for signature patterns
      for (const pattern of DOCUMENT_END_PATTERNS) {
        if (pattern.test(line)) {
          // Include a few more lines after signature for name/title
          documentEndIndex = Math.min(i + 5, lines.length - 1);
          
          // But stop if we hit explanation text or empty lines followed by explanation
          for (let j = i + 1; j <= documentEndIndex; j++) {
            const currentLine = lines[j].trim();
            // Stop at explanation text
            if (isExplanationLine(lines[j])) {
              documentEndIndex = j - 1;
              break;
            }
            // Stop at separator lines (---) that indicate end of document
            if (/^[-=]{3,}$/.test(currentLine)) {
              documentEndIndex = j - 1;
              break;
            }
          }
          break;
        }
      }
      if (documentEndIndex !== -1) break;
    }
  }
  
  // If we found a document block
  if (documentStartIndex !== -1 && documentEndIndex !== -1 && documentEndIndex > documentStartIndex) {
    const explanationBefore = lines.slice(0, documentStartIndex).join('\n').trim();
    const documentContent = lines.slice(documentStartIndex, documentEndIndex + 1).join('\n').trim();
    const explanationAfter = lines.slice(documentEndIndex + 1).join('\n').trim();
    
    // Clean up explanation after - remove leading separators
    const cleanedExplanationAfter = explanationAfter.replace(/^[-=]{3,}\s*\n?/, '').trim();
    
    return {
      explanationBefore,
      documentBlock: {
        documentContent,
        documentType: detectDocumentType(documentContent),
      },
      explanationAfter: cleanedExplanationAfter,
    };
  }
  
  // Fallback: return content as-is if parsing fails
  return {
    explanationBefore: content,
    documentBlock: null,
    explanationAfter: '',
  };
}

/**
 * Check if the current module is HR docs
 */
export function isHRDocsModule(moduleType?: string): boolean {
  return moduleType === 'hr_docs';
}
