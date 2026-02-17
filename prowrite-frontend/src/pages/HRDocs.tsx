/**
 * HR Docs module page
 * Specialized AI chat interface for HR documentation expert
 * Requirements: 2.1, 5.1, 1.1-1.6, 3.1-3.6
 */
import * as React from 'react';
import { UserCheck, FileText, Sparkles } from 'lucide-react';
import { ChatContainer } from '@/components/chat';
import type { ChatContainerRef } from '@/components/chat';
import { HRDocumentPanel } from '@/components/hr/HRDocumentPanel';
import type { HRTemplate } from '@/data/hr-templates';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// HR Documentation Expert introduction message
const HR_DOCS_INTRO = `Hi! 👋 I'm your HR Documentation Expert. I specialize in creating inclusive, compliant, and compelling HR documents that attract top talent.

Whether you need job descriptions that actually appeal to great candidates, offer letters that close deals, or any other HR documentation - I'll help you get it right and explain the best practices along the way.

What are you working on today? You can also click the "Templates" button to browse pre-built HR document templates.`;

/**
 * Template transfer handler options
 * Requirements: 3.1, 3.2, 3.3, 3.6
 */
interface TemplateTransferState {
  pendingTemplate: HRTemplate | null;
  showConfirmDialog: boolean;
}

export function HRDocsPage() {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [transferState, setTransferState] = React.useState<TemplateTransferState>({
    pendingTemplate: null,
    showConfirmDialog: false,
  });
  const chatContainerRef = React.useRef<ChatContainerRef>(null);

  /**
   * Handle template selection from the panel
   * Requirements: 3.1, 3.2, 3.6
   */
  const handleTemplateSelect = React.useCallback((template: HRTemplate) => {
    const currentInput = chatContainerRef.current?.getInputValue() || inputValue;
    
    // If there's existing text, show confirmation dialog
    if (currentInput.trim()) {
      setTransferState({
        pendingTemplate: template,
        showConfirmDialog: true,
      });
    } else {
      // No existing text, transfer directly
      transferTemplateToInput(template);
    }
  }, [inputValue]);

  /**
   * Transfer template prompt to chat input
   * Requirements: 3.1, 3.2, 3.3, 3.4
   */
  const transferTemplateToInput = React.useCallback((template: HRTemplate) => {
    // Set the input value to the template prompt
    setInputValue(template.prompt);
    
    // Also update via ref for immediate effect
    chatContainerRef.current?.setInputValue(template.prompt);
    
    // Auto-close panel after selection (Requirement 3.3)
    setIsPanelOpen(false);
    
    // Auto-focus on chat input after transfer (Requirement 3.4)
    setTimeout(() => {
      chatContainerRef.current?.focusInput();
    }, 100);
  }, []);

  /**
   * Confirm replacement of existing input
   * Requirements: 3.6
   */
  const handleConfirmReplace = React.useCallback(() => {
    if (transferState.pendingTemplate) {
      transferTemplateToInput(transferState.pendingTemplate);
    }
    setTransferState({
      pendingTemplate: null,
      showConfirmDialog: false,
    });
  }, [transferState.pendingTemplate, transferTemplateToInput]);

  /**
   * Cancel replacement dialog
   */
  const handleCancelReplace = React.useCallback(() => {
    setTransferState({
      pendingTemplate: null,
      showConfirmDialog: false,
    });
  }, []);

  /**
   * Toggle panel open/close state
   * Requirements: 1.1, 1.5
   */
  const handlePanelToggle = React.useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  /**
   * Handle input value changes from ChatContainer
   */
  const handleInputChange = React.useCallback((value: string) => {
    setInputValue(value);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - matching ColdEmail style */}
      <div className="shrink-0 px-4 md:px-6 py-4 flex items-center justify-between border-b border-border/50 bg-background">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
            <UserCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">HR Documentation Expert</h1>
            <p className="text-sm text-muted-foreground">
              Create inclusive, compliant HR documents with AI
            </p>
          </div>
        </div>
        
        {/* Templates button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePanelToggle}
          className={`gap-2 transition-all ${isPanelOpen ? 'bg-primary/10 border-primary/50 text-primary' : ''}`}
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
          <Sparkles className="h-3 w-3 text-amber-400" />
        </Button>
      </div>

      {/* Main content area with responsive layout */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* Chat container - takes full width, panel overlays */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${isPanelOpen ? 'md:mr-80' : ''}`}>
          <ChatContainer
            ref={chatContainerRef}
            moduleType="hr_docs"
            introMessage={HR_DOCS_INTRO}
            inputValue={inputValue}
            onInputChange={handleInputChange}
          />
        </div>
        
        {/* HR Document Panel - slides in from right */}
        <div 
          className={`
            fixed md:absolute right-0 top-0 h-full
            transition-transform duration-300 ease-in-out
            ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
            z-20 md:z-10
          `}
          style={{ top: 'var(--header-height, 0)' }}
        >
          <HRDocumentPanel
            isOpen={isPanelOpen}
            onToggle={handlePanelToggle}
            onTemplateSelect={handleTemplateSelect}
          />
        </div>
        
        {/* Backdrop overlay for mobile when panel is open */}
        {isPanelOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-10"
            onClick={handlePanelToggle}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Confirmation Dialog for Input Replacement */}
      <Dialog 
        open={transferState.showConfirmDialog} 
        onOpenChange={(open) => !open && handleCancelReplace()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replace Current Input?</DialogTitle>
            <DialogDescription>
              You have existing text in the chat input. Do you want to replace it with the selected template?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelReplace}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmReplace}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HRDocsPage;
