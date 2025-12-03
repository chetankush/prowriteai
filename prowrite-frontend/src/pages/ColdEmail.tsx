/**
 * Cold Email module page
 * Specialized AI chat interface for cold email expert
 * Requirements: 1.1, 5.1
 */
import { ChatContainer } from '@/components/chat';

// Cold Email Expert introduction message
const COLD_EMAIL_INTRO = `Hey! I'm your Cold Email Expert. I've helped generate millions in pipeline through strategic outreach.

Tell me about who you're reaching out to and what you're offering - I'll craft emails that actually get responses, and explain exactly why each element works.

What's your target? (Role, company type, and what problem you solve for them)`;

export function ColdEmailPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Cold Email Expert</h1>
        <p className="text-muted-foreground">
          Chat with your AI cold email strategist to craft high-converting outreach
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatContainer
          moduleType="cold_email"
          introMessage={COLD_EMAIL_INTRO}
        />
      </div>
    </div>
  );
}

export default ColdEmailPage;
