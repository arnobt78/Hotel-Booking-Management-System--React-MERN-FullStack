# AI Chatbot Implementation Guide - Complete Reference

**A production-ready, multi-provider AI chatbot with robust fallback chain and message normalization.**

---

## 📋 Table of Contents

1. [Quick Start (5-Minute Setup)](#quick-start-5-minute-setup)
2. [Overview](#overview)
3. [Architecture](#architecture)
4. [Setup & Configuration](#setup--configuration)
5. [File Structure](#file-structure)
6. [Complete Code Implementation](#complete-code-implementation)
7. [Implementation Checklist](#implementation-checklist)
8. [Code Snippets Reference](#code-snippets-reference)
9. [Usage Examples](#usage-examples)
10. [Troubleshooting](#troubleshooting)
11. [Customization](#customization)

---

## Quick Start (5-Minute Setup)

### Step 1: Install Dependencies

```bash
npm install @google/generative-ai @ai-sdk/openai @ai-sdk/groq ai @upstash/redis
```

### Step 2: Set Environment Variables

Create `.env.local`:

```bash
# Required: At least one AI provider
GOOGLE_GEMINI_API_KEY=your_key_here

# Optional: Fallback providers (recommended)
OPENROUTER_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
HUGGING_FACE_API_KEY=your_key_here

# Required: Redis for sessions
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token
```

### Step 3: Copy Files

Copy these files to your project:

- `lib/ai.ts` - AI provider logic
- `lib/redis.ts` - Session management
- `app/api/chat/route.ts` - API endpoint
- `hooks/use-chat.ts` - React hook

### Step 4: Use in Component

```typescript
import { useChat } from "@/hooks/use-chat";

function Chatbot() {
  const { messages, isLoading, sendMessage } = useChat();
  // ... your UI code
}
```

---

## Overview

This guide provides a complete, production-ready implementation of a multi-provider AI chatbot with:

- **5 AI Provider Fallback Chain**: Gemini → OpenRouter → Groq → Hugging Face → OpenAI
- **Robust Message Normalization**: 5 layers ensuring string format (handles array/object formats)
- **RAG (Retrieval Augmented Generation)**: FAQ-based context retrieval
- **Session Management**: Redis-based chat history with normalization
- **Streaming Support**: Real-time response streaming
- **Fast Rate Limit Handling**: Skips remaining models immediately on 429 errors
- **Deep Validation**: Prevents mutation and ensures type safety
- **Type-Safe**: Full TypeScript implementation

---

## Architecture

### Fallback Chain Flow

```bash
User Message
    ↓
Gemini (Primary) → Rate Limited? → Skip remaining Gemini models immediately
    ↓
OpenRouter (Fallback 1) → Failed? → Try next
    ↓
Groq (Fallback 2) → Failed? → Try next
    ↓
Hugging Face (Fallback 3) → Try 20+ models → Failed? → Try next
    ↓
OpenAI Direct (Fallback 4) → Final backup
    ↓
Response to User
```

### System Architecture Diagram

```bash
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                    (React Component/Hook)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ POST /api/chat
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Route Handler                          │
│                   (app/api/chat/route.ts)                       │
│  1. Get/Create Session (from cookies)                           │
│  2. Add User Message                                            │
│  3. Search FAQs (RAG) → Context                                 │
│  4. Call getAIResponse()                                         │
│  5. Stream Response                                             │
│  6. Save Assistant Message                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ getAIResponse(messages, context)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Provider Logic                            │
│                      (lib/ai.ts)                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Message Normalization Layers                     │  │
│  │  1. normalizeContentToString() helper                    │  │
│  │  2. Initial normalization (normalizedMessages)          │  │
│  │  3. Double-check (fullMessages loop)                     │  │
│  │  4. Final verification (invalidMessages check)           │  │
│  │  5. prepareAIMessages() helper                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Fallback Chain                               │  │
│  │  Primary: Gemini → OpenRouter → Groq → HF → OpenAI      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ Response
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Session Management                           │
│                      (lib/redis.ts)                             │
│  getSession() → Normalize Messages (CRITICAL)                   │
│  saveSession() → Store in Redis                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Message Normalization Layers

**5 Critical Layers:**

1. **Redis Retrieval** (`lib/redis.ts`): Normalize when loading from Redis
   - Array format → String
   - Object format → Extract text
   - Already string → Keep

2. **Initial Processing** (`lib/ai.ts`): Normalize all incoming messages
   - Uses `normalizeContentToString()` helper
   - Handles string, array, object formats

3. **Double-Check** (`lib/ai.ts`): Verify all messages are strings
   - Loops through `fullMessages`
   - Normalizes any non-string content

4. **Final Verification** (`lib/ai.ts`): Force normalize if needed
   - Checks for invalid messages
   - Force normalizes all invalid messages

5. **Runtime Validation** (`lib/ai.ts`): Deep validation for OpenRouter
   - Deep clone messages
   - Ensure string content
   - Final check before sending

### Error Handling Flow

```bash
Gemini API Call
    ↓
Rate Limit (429)? → Fast Skip → Try OpenRouter immediately
    ↓
Other Error? → Try Next Gemini Model
    ↓
All Gemini Failed? → Try OpenRouter
    ↓
OpenRouter Failed? → Try Groq
    ↓
Groq Failed? → Try Hugging Face (20+ models)
    ↓
All Hugging Face Failed? → Try OpenAI
    ↓
All Failed? → Throw Error
```

---

## Setup & Configuration

### 1. Environment Variables

Create `.env.local` file:

```bash
# Primary AI Provider
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Fallback 1: OpenRouter (supports multiple models)
OPENROUTER_API_KEY=your_openrouter_api_key_here
# Alternative env var name (optional)
# OpenRouter_API_KEY=your_openrouter_api_key_here

# Fallback 2: Groq (fast, free tier available)
GROQ_API_KEY=your_groq_api_key_here
# Alternative env var name (optional)
# Groq_Llama_API_KEY=your_groq_api_key_here

# Fallback 3: Hugging Face (free models)
HUGGING_FACE_API_KEY=your_huggingface_api_key_here
# Alternative env var name (optional)
# Hugging_Face_Inference_API_KEY=your_huggingface_api_key_here

# Fallback 4: OpenAI Direct (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Redis Configuration (for session & vector storage)
UPSTASH_REDIS_URL=your_redis_url_here
UPSTASH_REDIS_TOKEN=your_redis_token_here

# Optional: Session TTL (default: 2592000 = 30 days)
SESSION_TTL=2592000

# Optional: Public URLs for OpenRouter headers
NEXT_PUBLIC_CHATBOT_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Install Dependencies

```bash
npm install @google/generative-ai @ai-sdk/openai @ai-sdk/groq ai @upstash/redis
```

### 3. Required Packages

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "@ai-sdk/openai": "^3.0.12",
    "@ai-sdk/groq": "^3.0.11",
    "ai": "^6.0.42",
    "@upstash/redis": "^1.36.1"
  }
}
```

---

## File Structure

```bash
your-project/
├── lib/
│   ├── ai.ts              # AI provider logic with fallback chain
│   ├── redis.ts           # Redis session & vector management
│   ├── rag.ts             # RAG context retrieval (optional)
│   └── embeddings.ts      # Vector embeddings generation (optional)
├── app/
│   └── api/
│       └── chat/
│           └── route.ts    # Chat API endpoint
├── hooks/
│   └── use-chat.ts        # React hook for chat functionality
└── components/
    └── chatbot/
        ├── chatbot-widget.tsx
        └── message-skeleton.tsx
```

---

## Complete Code Implementation

### File 1: `lib/ai.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";

// Message type for AI SDK
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// AI Model fallback chain: Gemini (primary) → OpenRouter → Groq → Hugging Face → OpenAI (backup)
interface MessageContent {
  text?: string;
  content?: string;
  message?: string;
}

export async function getAIResponse(
  messages: Array<{
    role: string;
    content: string | unknown[] | MessageContent;
  }>,
  context?: string,
  stream: boolean = true,
) {
  const systemPrompt = `You are a helpful assistant. Be friendly, professional, and concise. Use the FAQ context to give accurate answers. If you don't know something, say so.`;

  // Helper function to normalize a single message content to string (defined early for reuse)
  const normalizeContentToString = (content: unknown): string => {
    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      // Handle array format: [{ type: 'output_text', text: '...' }] or [{ type: 'input_text', text: '...' }]
      return (content as unknown[])
        .map((item: unknown) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const itemObj = item as {
              text?: string;
              content?: string;
              message?: string;
              type?: string;
            };
            // Extract text from various object formats
            return itemObj.text || itemObj.content || itemObj.message || "";
          }
          return String(item || "");
        })
        .filter((text: string) => text.length > 0)
        .join(" ");
    }

    if (content && typeof content === "object") {
      // Handle object format: { text: '...' } or { content: '...' }
      const contentObj = content as {
        text?: string;
        content?: string;
        message?: string;
      };
      return contentObj.text || contentObj.content || contentObj.message || "";
    }

    return String(content || "");
  };

  // Normalize messages: ensure content is always a string
  // CRITICAL: Normalize ALL messages before processing
  const normalizedMessages: Message[] = messages
    .slice(-6) // Last 6 messages for context
    .map((msg) => {
      // Force normalization - handle any format (string, array, object)
      const content = normalizeContentToString(msg.content);

      // Filter out empty messages
      if (!content || content.trim().length === 0) {
        return null;
      }

      // Ensure role is valid
      const role =
        msg.role === "assistant"
          ? "assistant"
          : msg.role === "system"
            ? "system"
            : "user";
      return {
        role: role as "system" | "user" | "assistant",
        content: content.trim(),
      };
    })
    .filter((msg): msg is Message => msg !== null); // Remove null messages

  // Build full messages array - ensure system message is also normalized
  const fullMessages: Message[] = [
    {
      role: "system",
      content: systemPrompt + (context ? `\n\nFAQ Context:\n${context}` : ""),
    },
    ...normalizedMessages,
  ];

  // CRITICAL: Double-check that all messages in fullMessages have string content
  // This is a safety net in case normalization failed above
  for (let i = 0; i < fullMessages.length; i++) {
    const msg = fullMessages[i];
    if (typeof msg.content !== "string") {
      console.warn(
        `Message ${i} has non-string content, normalizing:`,
        typeof msg.content,
        Array.isArray(msg.content),
        JSON.stringify(msg.content).substring(0, 100),
      );
      fullMessages[i] = {
        ...msg,
        content: normalizeContentToString(msg.content),
      };
    }
  }

  // Final verification: ensure all messages are strings
  const invalidMessages = fullMessages.filter(
    (msg) => typeof msg.content !== "string",
  );
  if (invalidMessages.length > 0) {
    console.error(
      "ERROR: Some messages in fullMessages still have non-string content:",
      invalidMessages,
    );
    // Force normalize all invalid messages
    for (let i = 0; i < fullMessages.length; i++) {
      if (typeof fullMessages[i].content !== "string") {
        fullMessages[i] = {
          ...fullMessages[i],
          content: normalizeContentToString(fullMessages[i].content),
        };
      }
    }
  }

  // Debug: Log fullMessages to see what we're working with
  console.log("fullMessages count:", fullMessages.length);
  console.log(
    "fullMessages content types:",
    fullMessages.map((msg, i) => ({
      index: i,
      role: msg.role,
      contentType: typeof msg.content,
      isArray: Array.isArray(msg.content),
    })),
  );

  // Helper function to prepare AI SDK messages (for OpenAI-compatible APIs)
  // This ensures all content is normalized to strings, handling array formats from chat history
  const prepareAIMessages = () => {
    const aiMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [];

    // Process all messages, ensuring content is always a string
    // Even though fullMessages should already be normalized, we double-check here for safety
    for (const msg of fullMessages) {
      // Normalize content to string (handles edge cases where normalization might have failed)
      const contentStr = normalizeContentToString(msg.content);

      // Only add non-empty messages
      if (contentStr && contentStr.trim().length > 0) {
        // Ensure role is valid
        const role =
          msg.role === "system"
            ? "system"
            : msg.role === "assistant"
              ? "assistant"
              : "user";

        aiMessages.push({
          role: role as "system" | "user" | "assistant",
          content: contentStr.trim(),
        });
      }
    }

    return aiMessages;
  };

  // Primary: Gemini (reliable and free)
  // Use stable model names from deprecation table (gemini-2.5-flash, gemini-2.5-pro)
  const geminiModels = ["gemini-2.5-flash", "gemini-2.5-pro"];
  let geminiRateLimited = false;

  for (const modelName of geminiModels) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Build prompt with system message and context
      let prompt =
        systemPrompt + (context ? `\n\nFAQ Context:\n${context}` : "") + "\n\n";
      prompt += normalizedMessages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");

      const result = await model.generateContentStream(prompt);

      // Convert Gemini stream to AI SDK format
      if (stream) {
        return {
          textStream: (async function* () {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) yield text;
            }
          })(),
        };
      } else {
        const response = await result.response;
        return { text: response.text() };
      }
    } catch (error: unknown) {
      // Check if it's a rate limit error (429) - skip remaining Gemini models
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("429") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("Too Many Requests")
      ) {
        console.log(
          `Gemini model ${modelName} rate limited, skipping remaining Gemini models...`,
        );
        geminiRateLimited = true;
        break; // Exit Gemini loop immediately
      }
      console.log(`Gemini model ${modelName} failed, trying next...`, error);
    }
  }

  // If all Gemini models failed (or rate limited), try fallbacks
  if (geminiRateLimited) {
    console.log("Gemini rate limited, trying OpenRouter...");
  } else {
    console.log("All Gemini models failed, trying OpenRouter...");
  }

  // Fallback 1: OpenRouter GPT
  // Support both OPENROUTER_API_KEY and OpenRouter_API_KEY env var names
  const openRouterApiKey =
    process.env.OPENROUTER_API_KEY || process.env.OpenRouter_API_KEY;
  if (openRouterApiKey) {
    try {
      console.log("Trying OpenRouter GPT...");
      const openaiClient = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: openRouterApiKey,
        headers: {
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_CHATBOT_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            "https://yourdomain.com",
          "X-Title": "Chatbot",
        },
      });

      // Force use of Chat Completions API (not Responses API) by using .chat() method
      const model = openaiClient.chat("openai/gpt-4o-mini");

      const aiMessages = prepareAIMessages();

      // CRITICAL: Final runtime validation - ensure ALL content is strings
      // Create deep copies to prevent mutation and ensure string content
      const validatedMessages = aiMessages.map((msg, index) => {
        // Deep clone to prevent mutation
        const clonedMsg = JSON.parse(JSON.stringify(msg));

        // Ensure content is a string
        if (typeof clonedMsg.content !== "string") {
          console.error(
            `ERROR: Message ${index} has non-string content:`,
            typeof clonedMsg.content,
            Array.isArray(clonedMsg.content),
            clonedMsg,
          );
          // Force normalize
          clonedMsg.content = normalizeContentToString(clonedMsg.content);
        }

        // Final check - ensure it's a string
        if (typeof clonedMsg.content !== "string") {
          console.error(
            `CRITICAL: Message ${index} still has non-string content after normalization!`,
            clonedMsg,
          );
          clonedMsg.content = String(clonedMsg.content || "");
        }

        return {
          role: clonedMsg.role as "system" | "user" | "assistant",
          content: String(clonedMsg.content), // Force string conversion
        };
      });

      // Verify all messages have string content after validation
      const hasArrayContent = validatedMessages.some(
        (msg) => Array.isArray(msg.content) || typeof msg.content !== "string",
      );
      if (hasArrayContent) {
        console.error(
          "ERROR: Some messages still have non-string content after validation!",
          validatedMessages.filter(
            (msg) =>
              Array.isArray(msg.content) || typeof msg.content !== "string",
          ),
        );
        throw new Error(
          "Message normalization failed: some messages still have array content",
        );
      }

      if (stream) {
        const result = streamText({
          model: model,
          messages: validatedMessages as Array<{
            role: "system" | "user" | "assistant";
            content: string;
          }>,
          temperature: 0.7,
        });
        console.log("✅ OpenRouter GPT responding successfully");
        return result;
      } else {
        const result = await generateText({
          model: model,
          messages: validatedMessages as Array<{
            role: "system" | "user" | "assistant";
            content: string;
          }>,
          temperature: 0.7,
        });
        console.log("✅ OpenRouter GPT responding successfully");
        return result;
      }
    } catch (error) {
      console.error("OpenRouter failed, trying Groq...", error);
    }
  }

  // Fallback 2: Groq (fast and free tier available)
  // Support both GROQ_API_KEY and Groq_Llama_API_KEY env var names
  const groqApiKey = process.env.GROQ_API_KEY || process.env.Groq_Llama_API_KEY;
  if (groqApiKey) {
    try {
      console.log("Trying Groq...");
      const groq = createGroq({
        apiKey: groqApiKey,
      });

      const aiMessages = prepareAIMessages();

      if (stream) {
        return streamText({
          model: groq("llama-3.3-70b-versatile"), // Updated from llama-3.1-70b-versatile (deprecated Jan 24, 2025)
          messages: aiMessages,
          temperature: 0.7,
        });
      } else {
        return await generateText({
          model: groq("llama-3.3-70b-versatile"), // Updated from llama-3.1-70b-versatile (deprecated Jan 24, 2025)
          messages: aiMessages,
          temperature: 0.7,
        });
      }
    } catch (error) {
      console.error("Groq failed, trying Hugging Face...", error);
    }
  }

  // Fallback 3: Hugging Face Inference API (trying multiple models)
  // Support both HUGGING_FACE_API_KEY and Hugging_Face_Inference_API_KEY env var names
  const huggingFaceApiKey =
    process.env.HUGGING_FACE_API_KEY ||
    process.env.Hugging_Face_Inference_API_KEY;
  if (huggingFaceApiKey) {
    // List of models to try in order (prioritize smaller/faster models first)
    const models = [
      // Small/fast models first (for speed)
      "Qwen/Qwen3-0.6B", // 0.8B - very fast
      "google/gemma-2b-it", // 2B - fast
      "google/gemma-2b", // 2B - fast
      "microsoft/phi-1_5", // Small and fast
      "LiquidAI/LFM2.5-1.2B-Thinking", // 1B - fast
      "LiquidAI/LFM2.5-1.2B-Instruct", // 1B - fast
      // Medium models (good balance)
      "meta-llama/Llama-3.1-8B-Instruct", // 8B - reliable
      "tiiuae/falcon-7b-instruct", // 7B
      "mistralai/Mistral-7B-Instruct-v0.3", // 7B
      "HuggingFaceH4/zephyr-7b-beta", // 7B
      "google/gemma-7b", // 7B
      "NousResearch/Hermes-2-Pro-Mistral-7B", // 7B
      "NousResearch/NousCoder-14B", // 14B
      // Larger models (slower but better quality) - try last
      "zai-org/GLM-4.7-Flash", // 31B - works but slower
      "Qwen/Qwen3-Coder-30B-A3B-Instruct", // 31B
      "openai/gpt-oss-20b", // 22B
      "openai/gpt-oss-120b", // 120B - very slow
      // Legacy fallbacks
      "mistralai/Mistral-7B-Instruct-v0.2",
      "tiiuae/falcon-7b",
      "HuggingFaceH4/zephyr-7b-alpha",
    ];

    const failedModels: string[] = [];
    const aiMessages = prepareAIMessages();

    for (const model of models) {
      try {
        console.log(`Trying Hugging Face model: ${model}...`);

        // Use OpenAI-compatible router endpoint (like multi-ai-chatbot)
        const response = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${huggingFaceApiKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: aiMessages,
              max_tokens: 512,
              temperature: 0.7,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();

          // Extract generated text from OpenAI-compatible format
          let generatedText = "";
          if (data?.choices?.[0]?.message?.content) {
            generatedText = data.choices[0].message.content.trim();
          } else if (data?.choices?.[0]?.text) {
            generatedText = data.choices[0].text.trim();
          } else if (data?.output?.[0]?.content?.[0]?.text) {
            // Alternative format
            generatedText = data.output[0].content[0].text.trim();
          }

          if (generatedText) {
            console.log(`✅ Success with Hugging Face model: ${model}`);

            if (stream) {
              return {
                textStream: (async function* () {
                  // Simulate streaming by yielding chunks
                  const words = generatedText.split(" ");
                  for (const word of words) {
                    yield word + " ";
                    // Small delay to simulate streaming
                    await new Promise((resolve) => setTimeout(resolve, 10));
                  }
                })(),
              };
            } else {
              return { text: generatedText };
            }
          }
        }

        // If this model failed, try next one
        failedModels.push(`${model} (${response.status})`);
        console.warn(
          `${model} failed (${response.status}), trying next model...`,
        );
      } catch (error: unknown) {
        failedModels.push(model);
        console.warn(`${model} error:`, error);
        continue;
      }
    }

    // If all models failed
    console.error(`All Hugging Face models failed: ${failedModels.join(", ")}`);
    // Don't throw error here, continue to next fallback (OpenAI)
  }

  // Fallback 4: OpenAI Direct (if API key is available)
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log("Trying OpenAI direct...");
      const openaiClient = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });

      const aiMessages = prepareAIMessages();

      if (stream) {
        return streamText({
          model: openaiClient("gpt-4o-mini"),
          messages: aiMessages,
          temperature: 0.7,
        });
      } else {
        return await generateText({
          model: openaiClient("gpt-4o-mini"),
          messages: aiMessages,
          temperature: 0.7,
        });
      }
    } catch (error) {
      console.error("OpenAI direct failed:", error);
    }
  }

  throw new Error("All AI models failed");
}
```

### File 2: `lib/redis.ts`

```typescript
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Message type for chat sessions
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Session type
export interface Session {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// FAQ metadata type
export interface FAQMetadata {
  question: string;
  answer: string;
}

// Session management
export async function getSession(sessionId: string): Promise<Session | null> {
  const data = await redis.get(`chat:session:${sessionId}`);
  if (!data) return null;

  // Parse JSON if it's a string, otherwise use as-is
  let session: Session;
  if (typeof data === "string") {
    try {
      session = JSON.parse(data) as Session;
    } catch (e) {
      console.error("Failed to parse session data:", e);
      return null;
    }
  } else {
    session = data as Session;
  }

  // CRITICAL: Normalize message content to ensure it's always a string (handle legacy array format)
  // This prevents array-formatted content from being passed to AI APIs
  if (session.messages && Array.isArray(session.messages)) {
    session.messages = session.messages.map((msg) => {
      // If content is an array, normalize it to string
      if (Array.isArray(msg.content)) {
        const normalizedContent = (msg.content as unknown[])
          .map((item: unknown) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object") {
              const itemObj = item as {
                text?: string;
                content?: string;
                message?: string;
              };
              return itemObj.text || itemObj.content || itemObj.message || "";
            }
            return String(item || "");
          })
          .filter((text: string) => text.length > 0)
          .join(" ");
        return { ...msg, content: normalizedContent };
      }
      // If content is an object, extract text
      if (
        msg.content &&
        typeof msg.content === "object" &&
        !Array.isArray(msg.content)
      ) {
        const contentObj = msg.content as {
          text?: string;
          content?: string;
          message?: string;
        };
        const normalizedContent =
          contentObj.text ||
          contentObj.content ||
          contentObj.message ||
          String(msg.content);
        return { ...msg, content: normalizedContent };
      }
      // Already a string or convert to string
      return {
        ...msg,
        content:
          typeof msg.content === "string"
            ? msg.content
            : String(msg.content || ""),
      };
    });
  }

  return session;
}

export async function saveSession(
  sessionId: string,
  messages: ChatMessage[],
  ttl: number = parseInt(process.env.SESSION_TTL || "2592000"),
): Promise<Session> {
  const session: Session = {
    id: sessionId,
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await redis.setex(`chat:session:${sessionId}`, ttl, JSON.stringify(session));
  return session;
}

// Vector storage for RAG
export async function storeVector(
  id: string,
  vector: number[],
  metadata: FAQMetadata,
): Promise<void> {
  await redis.hset(`chat:vectors:${id}`, {
    vector: JSON.stringify(vector),
    metadata: JSON.stringify(metadata),
  });
}

// Vector search result type
export interface VectorSearchResult {
  similarity: number;
  metadata: FAQMetadata;
}

export async function searchVectors(
  queryVector: number[],
  topK: number = 3,
): Promise<VectorSearchResult[]> {
  // Simple cosine similarity search (for production, use a proper vector DB)
  // This is a simplified version - for better performance, use Redis with RediSearch or Qdrant
  const keys = await redis.keys("chat:vectors:*");
  const results: VectorSearchResult[] = [];

  for (const key of keys) {
    try {
      const data = await redis.hgetall(key);
      if (data?.vector && data?.metadata) {
        // Safely parse JSON with error handling
        let vector: number[];
        let metadata: FAQMetadata;

        try {
          const vectorStr =
            typeof data.vector === "string"
              ? data.vector
              : JSON.stringify(data.vector);
          vector = JSON.parse(vectorStr) as number[];
        } catch (e) {
          console.error(`Failed to parse vector for ${key}:`, e);
          continue;
        }

        try {
          const metadataStr =
            typeof data.metadata === "string"
              ? data.metadata
              : JSON.stringify(data.metadata);
          metadata = JSON.parse(metadataStr) as FAQMetadata;
        } catch (e) {
          console.error(`Failed to parse metadata for ${key}:`, e);
          continue;
        }

        const similarity = cosineSimilarity(queryVector, vector);
        results.push({
          similarity,
          metadata,
        });
      }
    } catch (error) {
      console.error(`Error processing vector ${key}:`, error);
      continue;
    }
  }

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### File 3: `app/api/chat/route.ts`

```typescript
import { NextRequest } from "next/server";
import { getSession, saveSession, type ChatMessage } from "@/lib/redis";
import { searchFAQ } from "@/lib/rag";
import { getAIResponse } from "@/lib/ai";

export const runtime = "edge"; // Use Edge Runtime for faster responses

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { message?: string };
    const { message } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get or create session from cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/chatbot_session=([^;]+)/);
    let sessionId: string = match?.[1] || "";
    let session = sessionId ? await getSession(sessionId) : null;

    if (!session) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      session = {
        id: sessionId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message.trim(),
      timestamp: Date.now(),
    };
    session.messages.push(userMessage);

    // RAG: Search for relevant FAQs
    const context = await searchFAQ(message);

    // Get AI response with streaming
    const result = await getAIResponse(session.messages, context, true);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          // AI SDK's streamText returns StreamTextResult with .textStream property
          interface StreamResult {
            textStream?: AsyncIterable<string>;
            text?: string;
          }
          const streamResult = result as StreamResult;
          const textStream = streamResult?.textStream;

          if (
            textStream &&
            typeof textStream[Symbol.asyncIterator] === "function"
          ) {
            // It's an async iterable - stream it
            for await (const chunk of textStream) {
              if (chunk) {
                fullResponse += chunk;
                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify({ response: chunk })}\n\n`,
                  ),
                );
              }
            }
          } else if (streamResult?.text) {
            // Non-streaming response
            fullResponse = streamResult.text;
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ response: fullResponse })}\n\n`,
              ),
            );
          } else {
            throw new Error("No textStream or text found in AI response");
          }

          // Save assistant message and session
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: fullResponse,
            timestamp: Date.now(),
          };
          session!.messages.push(assistantMessage);
          session!.updatedAt = Date.now();
          await saveSession(sessionId!, session!.messages);

          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          // Send error message to client
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ error: error instanceof Error ? error.message : "Streaming failed" })}\n\n`,
            ),
          );
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    // Get origin for CORS
    const origin = req.headers.get("origin");
    const allowedOrigin = origin || "*";

    // Set cookie if new session
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Cookie",
    });

    if (!match) {
      headers.set(
        "Set-Cookie",
        `chatbot_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
      );
    }

    return new Response(stream, { headers });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigin = origin || "*";
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Cookie",
    },
  });
}
```

### File 4: `hooks/use-chat.ts`

```typescript
import { useState, useCallback } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: Message = {
        role: "user",
        content: message.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage: Message = {
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.response) {
                    assistantMessage.content += parsed.response;
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (
                        lastMessage?.role === "assistant" &&
                        !lastMessage.timestamp
                      ) {
                        newMessages[newMessages.length - 1] = assistantMessage;
                      } else {
                        newMessages.push(assistantMessage);
                      }
                      return newMessages;
                    });
                  } else if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Chat error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
```

---

## Implementation Checklist

Use this checklist when implementing in a new project:

### Pre-Implementation

- [ ] Review this guide completely
- [ ] Understand the fallback chain architecture
- [ ] Gather all required API keys
- [ ] Set up Redis instance (Upstash recommended)

### Environment Setup

- [ ] Create `.env.local` file
- [ ] Add `GOOGLE_GEMINI_API_KEY`
- [ ] Add `OPENROUTER_API_KEY` (recommended)
- [ ] Add `GROQ_API_KEY` (recommended)
- [ ] Add `HUGGING_FACE_API_KEY` (optional)
- [ ] Add `OPENAI_API_KEY` (optional)
- [ ] Add `UPSTASH_REDIS_URL`
- [ ] Add `UPSTASH_REDIS_TOKEN`
- [ ] Add `SESSION_TTL` (optional, default: 2592000)
- [ ] Add `NEXT_PUBLIC_CHATBOT_URL` (optional)

### Dependencies

- [ ] Install `@google/generative-ai`
- [ ] Install `@ai-sdk/openai`
- [ ] Install `@ai-sdk/groq`
- [ ] Install `ai`
- [ ] Install `@upstash/redis`

### File Implementation

- [ ] Create `lib/ai.ts` with complete implementation
- [ ] Create `lib/redis.ts` with message normalization
- [ ] Create `app/api/chat/route.ts` with streaming support
- [ ] Create `hooks/use-chat.ts` React hook

### Code Verification

- [ ] `normalizeContentToString` function exists in `lib/ai.ts`
- [ ] Message normalization in `lib/redis.ts` `getSession` function
- [ ] Double-check loop in `lib/ai.ts` for `fullMessages`
- [ ] Final verification check before processing
- [ ] Deep cloning in OpenRouter validation
- [ ] Gemini primary implementation with fast skip
- [ ] OpenRouter fallback with deep validation
- [ ] Groq fallback implementation
- [ ] Hugging Face fallback with multiple models
- [ ] OpenAI direct fallback
- [ ] Rate limit detection (429 errors)
- [ ] Fast skip on Gemini rate limits
- [ ] Error logging for each provider
- [ ] Graceful fallback to next provider

### Testing

- [ ] Test with Gemini (primary)
- [ ] Test fallback to OpenRouter (disable Gemini)
- [ ] Test fallback to Groq (disable Gemini & OpenRouter)
- [ ] Test fallback to Hugging Face (disable others)
- [ ] Test message normalization (array format)
- [ ] Test message normalization (object format)
- [ ] Test session persistence
- [ ] Test streaming responses
- [ ] Test error handling

---

## Code Snippets Reference

### Message Normalization Helper

```typescript
const normalizeContentToString = (content: unknown): string => {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return (content as unknown[])
      .map((item: unknown) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const itemObj = item as {
            text?: string;
            content?: string;
            message?: string;
          };
          return itemObj.text || itemObj.content || itemObj.message || "";
        }
        return String(item || "");
      })
      .filter((text: string) => text.length > 0)
      .join(" ");
  }

  if (content && typeof content === "object") {
    const contentObj = content as {
      text?: string;
      content?: string;
      message?: string;
    };
    return contentObj.text || contentObj.content || contentObj.message || "";
  }

  return String(content || "");
};
```

### Fast Skip on Rate Limit

```typescript
catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
    console.log(`Gemini model ${modelName} rate limited, skipping remaining Gemini models...`);
    geminiRateLimited = true;
    break; // Exit Gemini loop immediately
  }
}
```

### OpenRouter Deep Validation

```typescript
const validatedMessages = aiMessages.map((msg, index) => {
  const clonedMsg = JSON.parse(JSON.stringify(msg)); // Deep clone

  if (typeof clonedMsg.content !== "string") {
    clonedMsg.content = normalizeContentToString(clonedMsg.content);
  }

  if (typeof clonedMsg.content !== "string") {
    clonedMsg.content = String(clonedMsg.content || "");
  }

  return {
    role: clonedMsg.role as "system" | "user" | "assistant",
    content: String(clonedMsg.content), // Force string conversion
  };
});

// Verify all messages have string content
const hasArrayContent = validatedMessages.some(
  (msg) => Array.isArray(msg.content) || typeof msg.content !== "string",
);
if (hasArrayContent) {
  throw new Error(
    "Message normalization failed: some messages still have array content",
  );
}
```

---

## Usage Examples

### Basic Usage in Component

```typescript
'use client';

import { useChat } from '@/hooks/use-chat';
import { useState } from 'react';

export default function Chatbot() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="chatbot-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
      <button onClick={clearMessages}>Clear</button>
    </div>
  );
}
```

---

## Troubleshooting

### Issue: "invalid_union" or "expected string, received array" errors

**Solution:**

- Ensure `lib/redis.ts` normalizes messages on retrieval
- Check that `normalizeContentToString` is called on all messages
- Verify deep cloning in OpenRouter validation
- Check all 5 normalization layers are implemented

### Issue: Slow responses

**Solution:**

- Check if Gemini is rate-limited (should skip quickly)
- Verify Hugging Face models are ordered (smaller first)
- Check network connectivity
- Review console logs for specific delays

### Issue: All providers failing

**Solution:**

- Check environment variables are set correctly
- Verify API keys are valid
- Check network connectivity
- Review console logs for specific error messages
- Test each provider individually

### Issue: Messages not persisting

**Solution:**

- Verify Redis connection (UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN)
- Check session cookie is being set
- Verify `saveSession` is being called after responses
- Check Redis TTL settings

---

## Customization

### Change System Prompt

Edit `systemPrompt` in `lib/ai.ts`:

```typescript
const systemPrompt = `Your custom system prompt here...`;
```

### Add More Hugging Face Models

Add to the `models` array in `lib/ai.ts`:

```typescript
const models = [
  // ... existing models
  "your-model/name-here",
];
```

### Change Fallback Order

Reorder the fallback sections in `lib/ai.ts`:

```typescript
// Change the order of Fallback 1, 2, 3, 4
```

### Adjust Temperature

Change `temperature` parameter in all AI calls:

```typescript
temperature: 0.7, // Change to your preferred value (0.0 - 1.0)
```

### Change Session TTL

Set `SESSION_TTL` in `.env.local`:

```bash
SESSION_TTL=604800  # 7 days in seconds
```

---

## Key Implementation Points

### 1. Message Normalization Strategy

**Why it's critical:**

- AI APIs expect string content, not arrays or objects
- Redis may store messages in different formats
- Prevents runtime errors and API failures

**Implementation layers:**

1. **Redis retrieval** (`lib/redis.ts`): Normalize when loading from Redis
2. **Initial processing** (`lib/ai.ts`): Normalize all incoming messages
3. **Double-check**: Verify all messages are strings
4. **Runtime validation**: Final check before sending to APIs (especially OpenRouter)

### 2. Fast Skip on Rate Limits

**Why it's important:**

- Reduces wait time when Gemini is rate-limited
- Immediately tries fallback providers
- Better user experience

**Implementation:**

```typescript
if (errorMessage.includes("429") || errorMessage.includes("quota")) {
  geminiRateLimited = true;
  break; // Skip remaining Gemini models immediately
}
```

### 3. Deep Validation for OpenRouter

**Why it's needed:**

- OpenRouter uses Chat Completions API which requires strict string format
- Prevents `invalid_union` errors
- Ensures message content is never mutated

**Implementation:**

```typescript
const validatedMessages = aiMessages.map((msg) => {
  const clonedMsg = JSON.parse(JSON.stringify(msg)); // Deep clone
  // Ensure string content
  // Final check
  return { role, content: String(clonedMsg.content) };
});
```

### 4. Hugging Face Model Fallback

**Why multiple models:**

- Some models may be unavailable (410 Gone)
- Different models have different speeds
- Ensures reliability

**Implementation:**

- Try smaller models first (faster)
- Fall back to larger models if needed
- Continue to next provider if all fail

---

## Best Practices

1. **Always normalize messages** at multiple layers
2. **Use deep cloning** for OpenRouter validation
3. **Log errors** for debugging
4. **Handle edge cases** (empty messages, invalid formats)
5. **Test fallback chain** by disabling primary provider
6. **Monitor API usage** to avoid rate limits
7. **Cache frequently asked questions** for faster responses

---

## API Key Setup Links

- **Gemini**: <https://ai.google.dev/>
- **OpenRouter**: <https://openrouter.ai/>
- **Groq**: <https://console.groq.com/>
- **Hugging Face**: <https://huggingface.co/settings/tokens>
- **OpenAI**: <https://platform.openai.com/api-keys>
- **Upstash Redis**: <https://console.upstash.com/>

---

## Support

For issues or questions:

1. Check console logs for specific error messages
2. Verify all environment variables are set
3. Test each provider individually
4. Review this guide's troubleshooting section
5. Ensure all 5 normalization layers are implemented

---

**Last Updated**: January 2025  
**Version**: 1.0.0
