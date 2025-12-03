/**
 * HR Docs module page
 * Specialized AI chat interface for HR documentation expert
 * Requirements: 2.1, 5.1
 */
import { ChatContainer } from '@/components/chat';

// HR Documentation Expert introduction message
const HR_DOCS_INTRO = `Hi! I'm your HR Documentation Expert. I specialize in creating inclusive, compliant, and compelling HR documents that attract top talent.

Whether you need job descriptions that actually appeal to great candidates, offer letters that close deals, or any other HR documentation - I'll help you get it right and explain the best practices along the way.

What are you working on today?`;

export function HRDocsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">HR Documentation Expert</h1>
        <p className="text-muted-foreground">
          Chat with your AI HR specialist to create inclusive, compliant documents
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatContainer
          moduleType="hr_docs"
          introMessage={HR_DOCS_INTRO}
        />
      </div>
    </div>
  );
}

export default HRDocsPage;
