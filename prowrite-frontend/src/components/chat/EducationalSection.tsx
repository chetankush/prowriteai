import * as React from 'react';
import { ChevronDown, ChevronRight, Lightbulb, Target, BookOpen, BarChart3, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EducationalSection as EducationalSectionType } from '@/lib/parseEducationalContent';

export interface EducationalSectionProps {
  section: EducationalSectionType;
  defaultExpanded?: boolean;
}

const TYPE_STYLES: Record<EducationalSectionType['type'], string> = {
  explanation: 'border-l-blue-500/50 bg-blue-500/5',
  improvement: 'border-l-amber-500/50 bg-amber-500/5',
  framework: 'border-l-violet-500/50 bg-violet-500/5',
  analysis: 'border-l-emerald-500/50 bg-emerald-500/5',
  checklist: 'border-l-cyan-500/50 bg-cyan-500/5',
};

const TYPE_ICONS: Record<EducationalSectionType['type'], React.ReactNode> = {
  explanation: <Lightbulb className="h-4 w-4 text-blue-400" />,
  improvement: <Target className="h-4 w-4 text-amber-400" />,
  framework: <BookOpen className="h-4 w-4 text-violet-400" />,
  analysis: <BarChart3 className="h-4 w-4 text-emerald-400" />,
  checklist: <CheckSquare className="h-4 w-4 text-cyan-400" />,
};

function highlightFrameworkCitations(content: string): React.ReactNode {
  const frameworkPatterns = /\b(AIDA|PAS|BAB|QVC|PPP|OKR|CRO|SEO|CTR|CTA|MEDDIC|SPIN|Challenger Sale|Sandler|Problem-Agitate-Solution|Before-After-Bridge|Zeigarnik effect|social proof|scarcity|urgency|reciprocity|authority|commitment|liking)\b/gi;
  
  const parts = content.split(frameworkPatterns);
  
  return parts.map((part, index) => {
    if (frameworkPatterns.test(part)) {
      frameworkPatterns.lastIndex = 0;
      return (
        <span
          key={index}
          className="inline-flex items-center rounded-md bg-violet-500/20 px-1.5 py-0.5 text-xs font-semibold text-violet-300"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function formatImprovementContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
      const bulletContent = trimmedLine.slice(1).trim();
      return (
        <div key={index} className="flex items-start gap-2 py-1">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
          <span>{highlightFrameworkCitations(bulletContent)}</span>
        </div>
      );
    }
    
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

  const isFramework = section.type === 'framework';
  const isImprovement = section.type === 'improvement';

  return (
    <div
      className={cn(
        'mt-3 rounded-xl border-l-4 transition-all duration-200',
        TYPE_STYLES[section.type],
        isFramework && 'ring-1 ring-violet-500/20'
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-white/5 rounded-r-xl transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {TYPE_ICONS[section.type]}
          <span className={cn(
            'text-sm font-medium text-foreground',
            isFramework && 'text-violet-300'
          )}>
            {section.title}
          </span>
          {isFramework && (
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
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
        <div className="border-t border-white/5 px-3 pb-3 pt-2">
          <div className="text-sm leading-relaxed text-muted-foreground">
            {isImprovement ? (
              formatImprovementContent(section.content)
            ) : isFramework ? (
              <div className="font-medium text-violet-300">
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

  const explanations = sections.filter(s => s.type === 'explanation');
  const improvements = sections.filter(s => s.type === 'improvement');
  const frameworks = sections.filter(s => s.type === 'framework');
  const analyses = sections.filter(s => s.type === 'analysis');
  const checklists = sections.filter(s => s.type === 'checklist');

  const orderedSections = [
    ...frameworks,
    ...explanations,
    ...analyses,
    ...checklists,
    ...improvements,
  ];

  return (
    <div className="space-y-2">
      {frameworks.length > 0 && (
        <div className="mb-2 flex items-center gap-2 text-xs text-violet-400">
          <BookOpen className="h-3 w-3" />
          <span>Framework-based response with expert insights below</span>
        </div>
      )}
      
      {orderedSections.map((section, index) => (
        <EducationalSection
          key={`${section.type}-${index}`}
          section={section}
          defaultExpanded={section.type === 'framework' || section.type === 'explanation'}
        />
      ))}
      
      {improvements.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
          <Target className="h-3 w-3" />
          <span>Review improvement suggestions above to enhance your content</span>
        </div>
      )}
    </div>
  );
}
