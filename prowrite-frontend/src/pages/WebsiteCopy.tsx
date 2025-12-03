/**
 * Website Copy module page
 * Specialized AI chat interface for conversion copywriting expert
 * Requirements: 4.1, 5.1
 */
import { ChatContainer } from '@/components/chat';

// Website Copy Expert introduction message
const WEBSITE_COPY_INTRO = `Hi! I'm your Website Copy Expert. I specialize in writing copy that converts visitors into customers.

I don't just write words - I engineer persuasion. Every headline, every CTA, every section is designed based on conversion psychology and real A/B test data.

Tell me about your product or service and who you're trying to reach. Let's create copy that actually converts.`;

export function WebsiteCopyPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Website Copy Expert</h1>
        <p className="text-muted-foreground">
          Chat with your AI conversion copywriter to create high-converting website copy
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatContainer
          moduleType="website_copy"
          introMessage={WEBSITE_COPY_INTRO}
        />
      </div>
    </div>
  );
}

export default WebsiteCopyPage;
