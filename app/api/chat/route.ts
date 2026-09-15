import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/ai/models';

const HHTECH_API_KEY = process.env.HHTECH_API_KEY;
const HHTECH_BASE_URL = process.env.HHTECH_BASE_URL || 'https://hhtechapi.net/v1';

export const maxDuration = 60; // Max duration for streaming

export async function POST(req: NextRequest) {
  if (!HHTECH_API_KEY) {
    return NextResponse.json({ error: 'HHTECH_API_KEY is not configured.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { messages, modelId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array.' }, { status: 400 });
    }

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required.' }, { status: 400 });
    }

    // Validate against whitelist
    const modelExists = models.some(m => m.id === modelId);
    if (!modelExists) {
      return NextResponse.json({ error: 'Model not found or not supported.' }, { status: 404 });
    }

    // Extract attachments into HHTECH files format AND OpenAI vision format
    const files: { name: string; contentType: string; data: string }[] = [];
    const formattedMessages = messages.map((msg: { role: string; content: string; attachments?: any[] }) => {
      if (msg.attachments && msg.attachments.length > 0) {
        const contentArray: any[] = [
          { type: "text", text: msg.content || " " } // Text is required in array format
        ];

        msg.attachments.forEach((att) => {
          // 1. OpenAI Vision Format (Requires full data URI)
          contentArray.push({
            type: "image_url",
            image_url: {
              url: att.data // This includes data:image/...;base64,
            }
          });

          // 2. HHTECH custom format (Root files array)
          const base64Data = att.data.includes(',') ? att.data.split(',')[1] : att.data;
          files.push({
            name: att.name || 'image',
            contentType: att.contentType,
            data: base64Data
          });
        });

        return {
          role: msg.role,
          content: contentArray
        };
      }
      
      return {
        role: msg.role,
        content: msg.content
      };
    });

    const payload: Record<string, unknown> = {
      model: modelId,
      messages: formattedMessages,
      stream: true,
    };

    if (files.length > 0) {
      payload.files = files;
    }

    const response = await fetch(`${HHTECH_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HHTECH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = 'An error occurred with the AI provider.';
      
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication failed with the AI provider.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (response.status >= 500) {
        errorMessage = 'AI provider is currently experiencing issues.';
      }
      
      console.error(`HHTECH API Error (${response.status}):`, errorData);
      
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    // Stream the response back
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }
        
        const reader = response.body.getReader();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Error reading stream:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
