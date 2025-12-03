import * as React from 'react';
import { ChevronDown, ChevronRight, Lightbulb, Target, BookOpen, BarChart3, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EducationalSection as EducationalSectionType } from '@/lib/parseEducationalContent';

export interface EducationalSectionProps {
  section: EducationalSectionType;
  defaultExpanded?: boolean;
}

const TYPE_STYLES: Record<EducationalSectionType['type'], string> = {
  explanation: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30',
  improvement: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/30',
  framework: 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/30',
  analysis: 'border-l-green-500 bg-green-50 dark:bg-green-950/30',
  checklist: 'border-l-teal-500 bg-teal-50 dark:bg-teal-950/30',
};

const TYPE_ICONS: Record<EducationalSectionType['type'], React.ReactNode> = {
  explanation: <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
  improvement: <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
  framework: <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
  analysis: <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />,
  checklist: <CheckSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
};

/**
 * Highlight framework citations in content (e.g., AIDA, PAS, BAB)
 */
function highlightFrameworkCitations(content: string): React.ReactNode {
  // Common framework patterns to highlight
  const frameworkPatterns = /\b(AIDA|PAS|BAB|QVC|PPP|OKR|CRO|SEO|CTR|CTA|MEDDIC|SPIN|Challenger Sale|Sandler|Problem-Agitate-Solution|Before-After-Bridge|Zeigarnik effect|social proof|scarcity|urgency|reciprocity|authority|commitment|liking)\b/gi;
  
  const parts = content.split(frameworkPatterns);
  
  return parts.map((part, index) => {
    if (frameworkPatterns.test(part)) {
      // Reset regex lastIndex
      frameworkPatterns.lastIndex = 0;
      return (
        <span
          key={index}
          className="inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

/**
 * Format improvement suggestions with bullet highlighting
 */
function formatImprovementContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    // Check if line starts with a bullet point or dash
    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
      const bulletContent = trimmedLine.slice(1).trim();
      return (
        <div key={index} className="flex items-start gap-2 py-1">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          <span>{highlightFrameworkCitations(bulletContent)}</span>
        </div>
      );
    }
    
    // Regular line
    if (trimmedLine) {
      return (
        <div key={index} className="py-0.5">
          {highlightFrameworkCitations(trimmedLine)}
        </div>
      );
    }
    
    return <div key={index} className="h-2" />;
  });
}

export function EducationalSection({ section, defaultExpanded = false }: EducationalSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  // Framework sections should always be expanded and prominent
  const isFramework = section.type === 'framework';
  const isImprovement = section.type === 'improvement';

  return (
    <div
      className={cn(
        'mt-3 rounded-lg border-l-4 transition-all duration-200',
        TYPE_STYLES[section.type],
        isFramework && 'ring-1 ring-purple-200 dark:ring-purple-800'
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-black/5 dark:hover:bg-white/5"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {TYPE_ICONS[section.type]}
          <span className={cn(
            'text-sm font-medium',
            isFramework && 'text-purple-700 dark:text-purple-300'
          )}>
            {section.title}
          </span>
          {isFramework && (
            <span className="rounded-full bg-purple-200 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-800 dark:text-purple-200">
              Applied
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="border-t border-black/10 px-3 pb-3 pt-2 dark:border-white/10">
          <div className="text-sm leading-relaxed text-muted-foreground">
            {isImprovement ? (
              formatImprovementContent(section.content)
            ) : isFramework ? (
              <div className="font-medium text-purple-700 dark:text-purple-300">
                {highlightFrameworkCitations(section.content)}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">
                {highlightFrameworkCitations(section.content)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface EducationalSectionsListProps {
  sections: EducationalSectionType[];
}

export function EducationalSectionsList({ sections }: EducationalSectionsListProps) {
  if (sections.length === 0) return null;

  // Group sections by type for better organization
  const explanations = sections.filter(s => s.type === 'explanation');
  const improvements = sections.filter(s => s.type === 'improvement');
  const frameworks = sections.filter(s => s.type === 'framework');
  const analyses = sections.filter(s => s.type === 'analysis');
  const checklists = sections.filter(s => s.type === 'checklist');

  // Order: framework first (most prominent), then explanations, analyses, checklists, improvements last
  const orderedSections = [
    ...frameworks,
    ...explanations,
    ...analyses,
    ...checklists,
    ...improvements,
  ];

  return (
    <div className="space-y-2">
      {/* Framework citation banner when present */}
      {frameworks.length > 0 && (
        <div className="mb-2 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
          <BookOpen className="h-3 w-3" />
          <span>Framework-based response with expert insights below</span>
        </div>
      )}
      
      {orderedSections.map((section, index) => (
        <EducationalSection
          key={`${section.type}-${index}`}
          section={section}
          // Framework and explanation sections default to expanded
          defaultExpanded={section.type === 'framework' || section.type === 'explanation'}
        />
      ))}
      
      {/* Improvement suggestions callout when present */}
      {improvements.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <Target className="h-3 w-3" />
          <span>Review improvement suggestions above to enhance your content</span>
        </div>
      )}
    </div>
  );
}
