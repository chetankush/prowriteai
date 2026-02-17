import * as React from 'react';
import { X, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  DOCUMENT_CATEGORIES,
  HR_TEMPLATES,
  type HRTemplate,
  type DocumentCategory,
} from '@/data/hr-templates';

// ============================================================================
// Component Interfaces
// ============================================================================

export interface HRDocumentPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onTemplateSelect: (template: HRTemplate) => void;
}

export interface CategorySelectorProps {
  categories: DocumentCategory[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string) => void;
}

export interface TemplateCardProps {
  template: HRTemplate;
  onClick: (template: HRTemplate) => void;
}

// ============================================================================
// CategorySelector Component
// ============================================================================

export function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  return (
    <Select value={selectedCategory || ''} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <span className="flex items-center gap-2">
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


// ============================================================================
// TemplateCard Component
// ============================================================================

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <button
      onClick={() => onClick(template)}
      className={cn(
        'w-full text-left p-3 rounded-lg border border-border/50',
        'bg-card/50 hover:bg-card hover:border-border',
        'transition-all duration-200 group cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
            {template.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
      </div>
    </button>
  );
}

// ============================================================================
// HRDocumentPanel Component
// ============================================================================

export function HRDocumentPanel({
  isOpen,
  onToggle,
  onTemplateSelect,
}: HRDocumentPanelProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    DOCUMENT_CATEGORIES[0]?.id || null
  );

  // Filter templates by selected category
  const filteredTemplates = React.useMemo(() => {
    if (!selectedCategory) return [];
    return HR_TEMPLATES.filter((t) => t.categoryId === selectedCategory);
  }, [selectedCategory]);

  // Get current category info
  const currentCategory = React.useMemo(() => {
    return DOCUMENT_CATEGORIES.find((c) => c.id === selectedCategory);
  }, [selectedCategory]);

  const handleTemplateClick = (template: HRTemplate) => {
    onTemplateSelect(template);
    onToggle(); // Auto-close panel after selection
  };

  // Always render for smooth CSS transitions, use visibility for accessibility
  return (
    <div 
      className={cn(
        "w-80 shrink-0 border-l border-border/50 flex flex-col h-full bg-background/95 backdrop-blur-sm shadow-lg",
        !isOpen && "invisible"
      )}
      aria-hidden={!isOpen}
    >
      {/* Panel Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Document Templates</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToggle}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Category Selector */}
      <div className="shrink-0 px-4 py-3 border-b border-border/50">
        <CategorySelector
          categories={DOCUMENT_CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        {currentCategory && (
          <p className="text-xs text-muted-foreground mt-2">
            {currentCategory.description}
          </p>
        )}
      </div>

      {/* Template List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={handleTemplateClick}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No templates available for this category
            </p>
          )}
        </div>
      </div>

      {/* Panel Footer */}
      <div className="shrink-0 px-4 py-3 border-t border-border/50 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Click a template to add it to your chat
        </p>
      </div>
    </div>
  );
}

export default HRDocumentPanel;
