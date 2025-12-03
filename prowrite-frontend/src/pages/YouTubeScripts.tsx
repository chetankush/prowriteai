/**
 * YouTube Scripts module page
 * Specialized AI chat interface for YouTube content strategist
 * Requirements: 3.1, 5.1
 */
import { ChatContainer } from '@/components/chat';

// YouTube Script Expert introduction message
const YOUTUBE_SCRIPTS_INTRO = `Hey creator! I'm your YouTube Script Expert. I've helped channels generate hundreds of millions of views through strategic scripting.

I don't just write scripts - I engineer them for retention, engagement, and growth. Every hook, every transition, every CTA is designed with the algorithm and human psychology in mind.

What video are you working on? Tell me the topic and your channel's niche, and let's create something that actually performs.`;

export function YouTubeScriptsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">YouTube Script Expert</h1>
        <p className="text-muted-foreground">
          Chat with your AI content strategist to create engaging video scripts
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatContainer
          moduleType="youtube_scripts"
          introMessage={YOUTUBE_SCRIPTS_INTRO}
        />
      </div>
    </div>
  );
}

export default YouTubeScriptsPage;
