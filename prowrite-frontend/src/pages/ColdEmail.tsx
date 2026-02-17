import { ChatContainer } from '@/components/chat';
import { Mail } from 'lucide-react';

const COLD_EMAIL_INTRO = `Hey! 👋 I'm your Cold Email Expert. I've helped generate millions in pipeline through strategic outreach.

Tell me about who you're reaching out to and what you're offering — I'll craft emails that actually get responses, and explain exactly why each element works.

What's your target? (Role, company type, and what problem you solve for them)`;

export function ColdEmailPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 md:px-6 py-4 flex items-center gap-3 border-b border-border/50 bg-background">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cold Email Expert</h1>
          <p className="text-sm text-muted-foreground">
            Craft high-converting outreach emails with AI
          </p>
        </div>
      </div>

      {/* Chat Container - fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatContainer
          moduleType="cold_email"
          introMessage={COLD_EMAIL_INTRO}
        />
      </div>
    </div>
  );
}

export default ColdEmailPage;
