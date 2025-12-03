# Implementation Plan

- [x] 1. Database Schema for Chat System






  - [x] 1.1 Create conversations table migration

    - Add conversations table with id, workspace_id, module_type, title, created_at, updated_at
    - Add foreign key to workspaces table
    - _Requirements: 5.1, 5.4_

  - [x] 1.2 Create messages table migration
    - Add messages table with id, conversation_id, role, content, generated_content (JSONB), created_at
    - Add foreign key to conversations table
    - _Requirements: 5.3, 5.4_
  - [ ]* 1.3 Write property test for conversation-message relationship
    - **Property 4: Conversation Context Preservation**
    - **Validates: Requirements 5.4**
-

- [x] 2. Specialized System Prompts




  - [x] 2.1 Create prompt manager service


    - Create PromptManagerService to load and manage specialized prompts
    - Implement getPromptForModule(moduleType) method
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

  - [x] 2.2 Implement Cold Email Expert prompt

    - Create cold-email.prompt.ts with full specialized prompt
    - Include frameworks, response behavior, output format, rules
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 2.3 Implement HR Documents Expert prompt

    - Create hr-docs.prompt.ts with full specialized prompt
    - Include inclusive language guidelines, compliance guidance
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.4 Implement YouTube Scripts Expert prompt

    - Create youtube-scripts.prompt.ts with full specialized prompt
    - Include retention techniques, hook formulas, algorithm optimization
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 2.5 Implement Website Copy Expert prompt

    - Create website-copy.prompt.ts with full specialized prompt
    - Include CRO frameworks, headline formulas, SEO guidance
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ] 2.6 Write property test for agent identity consistency





    - **Property 1: Specialized Agent Identity Consistency**
    - **Validates: Requirements 1.1, 2.1, 3.1, 4.1**

- [x] 3. Chat Backend Service





  - [x] 3.1 Create ChatService with conversation management


    - Implement createConversation, getConversation, listConversations, deleteConversation
    - Handle workspace authorization
    - _Requirements: 5.1, 5.4, 5.5_
  - [x] 3.2 Implement message handling with context building


    - Build conversation context from message history
    - Inject brand voice settings into context
    - Limit context window to prevent token overflow
    - _Requirements: 5.4, 5.6_

  - [x] 3.3 Implement streaming chat response

    - Use Gemini streaming API for real-time responses
    - Parse and store generated content blocks
    - _Requirements: 5.2, 5.3_
  - [x] 3.4 Write property test for brand voice integration






    - **Property 5: Brand Voice Integration**
    - **Validates: Requirements 5.6**

- [x] 4. Chat Controller and DTOs




  - [x] 4.1 Create chat DTOs


    - CreateConversationDto, SendMessageDto, ConversationResponseDto, MessageResponseDto
    - _Requirements: 5.1_

  - [x] 4.2 Implement ChatController endpoints


    - POST /api/chat/conversations - Create new conversation
    - GET /api/chat/conversations - List conversations
    - GET /api/chat/conversations/:id - Get conversation with messages
    - POST /api/chat/conversations/:id/messages - Send message (streaming)
    - DELETE /api/chat/conversations/:id - Delete conversation
    - _Requirements: 5.1, 5.4, 5.5_
  - [x] 4.3 Write property test for module-specific expertise





    - **Property 6: Module-Specific Expertise**
    - **Validates: Requirements 1.1-1.6, 2.1-2.6, 3.1-3.6, 4.1-4.6**
-

- [x] 5. Checkpoint - Backend Tests




  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Frontend Chat Interface Components






  - [x] 6.1 Create ChatMessage component

    - Display user and assistant messages with proper styling
    - Render generated content in formatted blocks
    - Add copy functionality for content blocks
    - _Requirements: 5.3_


  - [x] 6.2 Create ChatInput component
    - Text input with send button
    - Handle Enter key submission
    - Show loading state during generation

    - _Requirements: 5.2_
  - [x] 6.3 Create ConversationList component

    - Display list of conversations for current module
    - Show conversation title and date
    - Handle conversation selection and deletion
    - _Requirements: 5.4, 5.5_
  - [x] 6.4 Create ChatContainer component


    - Combine ChatMessage list, ChatInput, and ConversationList
    - Handle streaming response display
    - Auto-scroll to new messages
    - _Requirements: 5.1, 5.2, 5.3_
-

- [x] 7. Frontend Chat Pages




  - [x] 7.1 Update ColdEmail page with chat interface


    - Replace form-based UI with ChatContainer
    - Initialize with Cold Email Expert introduction
    - Maintain conversation history sidebar
    - _Requirements: 1.1, 5.1_
  - [x] 7.2 Update HRDocs page with chat interface


    - Replace form-based UI with ChatContainer
    - Initialize with HR Expert introduction
    - _Requirements: 2.1, 5.1_
  - [x] 7.3 Update YouTubeScripts page with chat interface


    - Replace form-based UI with ChatContainer
    - Initialize with YouTube Expert introduction
    - _Requirements: 3.1, 5.1_
  - [x] 7.4 Update WebsiteCopy page with chat interface


    - Replace form-based UI with ChatContainer
    - Initialize with Website Copy Expert introduction
    - _Requirements: 4.1, 5.1_
-

- [x] 8. Streaming and Real-time Updates




  - [x] 8.1 Implement SSE (Server-Sent Events) for streaming


    - Create streaming endpoint for chat responses
    - Handle connection management and cleanup
    - _Requirements: 5.2_

  - [x] 8.2 Implement frontend streaming handler

    - Use EventSource or fetch with ReadableStream
    - Update UI in real-time as tokens arrive
    - Handle stream completion and errors
    - _Requirements: 5.2_

  - [x] 8.3 Write property test for framework application transparency


    - **Property 2: Framework Application Transparency**
    - **Validates: Requirements 1.2, 2.2, 3.2, 4.2**
- [x] 9. Educational Content Integration






- [ ] 9. Educational Content Integration


  - [x] 9.1 Implement explanation parsing in responses

    - Parse "WHY THIS WORKS" sections from AI responses
    - Display explanations in collapsible UI elements
    - _Requirements: 6.1, 6.3_

  - [x] 9.2 Add improvement suggestions display

    - Parse and highlight improvement suggestions
    - Show framework citations prominently
    - _Requirements: 6.2, 6.5_
  - [x] 9.3 Write property test for educational content inclusion






    - **Property 3: Educational Content Inclusion**
    - **Validates: Requirements 6.1, 6.3, 6.4**

- [x] 10. Final Integration and Polish





  - [x] 10.1 Add conversation title auto-generation


    - Generate title from first user message
    - Allow manual title editing
    - _Requirements: 5.1_

  - [x] 10.2 Implement new conversation flow

    - Clear button to start fresh conversation
    - Confirmation dialog for clearing context
    - _Requirements: 5.5_


  - [ ] 10.3 Add keyboard shortcuts and UX improvements
    - Cmd/Ctrl+Enter to send
    - Escape to cancel
    - Loading indicators and error states
    - _Requirements: 5.2_

- [ ] 11. Final Checkpoint





  - Ensure all tests pass, ask the user if questions arise.
