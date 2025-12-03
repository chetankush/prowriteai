/**
 * Software Documentation page
 * AI assistant for developers, QA, PMs, and tech writers
 */
import { ChatContainer } from '@/components/chat/ChatContainer';

const INTRO_MESSAGE = `👋 I'm your Software Documentation Expert!

I can help you create professional technical documentation including:

**For Developers:**
• PR descriptions & commit messages
• README files & code documentation
• Architecture Decision Records (ADRs)

**For QA/Testers:**
• Test cases (Given-When-Then format)
• Bug reports & test plans
• QA sign-off documents

**For Product Managers:**
• PRDs & feature specifications
• User stories with acceptance criteria
• Release notes & changelogs

**For Engineering Managers:**
• Sprint summaries & postmortems
• Performance review templates
• 1:1 meeting notes

**For DevOps:**
• Runbooks & incident reports
• Infrastructure documentation

Just tell me what you need, and I'll create documentation that follows industry best practices!

**Example requests:**
- "Write a PR description for adding user authentication"
- "Create test cases for a login feature"
- "Generate release notes for version 2.0"
- "Write a postmortem for yesterday's outage"`;

export function SoftwareDocsPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <ChatContainer
        moduleType="software_docs"
        introMessage={INTRO_MESSAGE}
      />
    </div>
  );
}

export default SoftwareDocsPage;
