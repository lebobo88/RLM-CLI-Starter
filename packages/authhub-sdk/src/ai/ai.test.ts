/**
 * AuthHub AI Module Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthHubClient } from '../client';

describe('AIModule', () => {
  let client: AuthHubClient;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    client = new AuthHubClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'ak_test_key',
      timeout: 5000,
    });

    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('chat', () => {
    it('should return correct response structure', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1677858242,
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      };

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = await client.ai.chat({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      expect(response).toEqual(mockResponse);
      expect(response.choices[0]?.message.content).toBe('Hello! How can I help you today?');
      expect(response.usage.total_tokens).toBe(25);
    });

    it('should send correct request body', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [], usage: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await client.ai.chat({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }],
        temperature: 0.7,
        max_tokens: 100,
      });

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);

      expect(body).toMatchObject({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }],
        temperature: 0.7,
        max_tokens: 100,
        stream: false,
      });
    });

    it('should throw error when model is missing', async () => {
      await expect(
        client.ai.chat({
          model: '',
          messages: [{ role: 'user', content: 'Hello!' }],
        })
      ).rejects.toThrow('model is required');
    });

    it('should throw error when messages is empty', async () => {
      await expect(
        client.ai.chat({
          model: 'gpt-4',
          messages: [],
        })
      ).rejects.toThrow('messages cannot be empty');
    });

    it('should throw error for invalid message role', async () => {
      await expect(
        client.ai.chat({
          model: 'gpt-4',
          messages: [{ role: 'invalid' as 'user', content: 'Hello!' }],
        })
      ).rejects.toThrow('each message must have a valid role');
    });

    it('should handle API errors', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Invalid model' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        client.ai.chat({
          model: 'invalid-model',
          messages: [{ role: 'user', content: 'Hello!' }],
        })
      ).rejects.toThrow('Invalid model');
    });
  });

  describe('chatStream', () => {
    it('should yield chunks correctly', async () => {
      const sseData = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
        'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ].join('');

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseData));
          controller.close();
        },
      });

      fetchSpy.mockResolvedValueOnce(
        new Response(stream, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        })
      );

      const chunks: Array<{ content: string; finish_reason?: string | null }> = [];
      for await (const chunk of client.ai.chatStream({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }],
      })) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({ content: 'Hello', finish_reason: null });
      expect(chunks[1]).toEqual({ content: ' world', finish_reason: null });
      expect(chunks[2]).toEqual({ content: '', finish_reason: 'stop' });
    });

    it('should handle stream errors', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Rate limit exceeded' } }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const stream = client.ai.chatStream({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      await expect(stream.next()).rejects.toThrow('Rate limit exceeded');
    });

    it('should validate options before streaming', async () => {
      const stream = client.ai.chatStream({
        model: '',
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      await expect(stream.next()).rejects.toThrow('model is required');
    });

    it('should set stream: true in request body', async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      fetchSpy.mockResolvedValueOnce(
        new Response(stream, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        })
      );

      // Consume the stream
      for await (const _ of client.ai.chatStream({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }],
      })) {
        // Just consume
      }

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);

      expect(body.stream).toBe(true);
    });

    it('should handle empty response body', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        })
      );

      const stream = client.ai.chatStream({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      await expect(stream.next()).rejects.toThrow('Response body is null');
    });
  });

  describe('speak - voice validation', () => {
    it('should accept OpenAI voice names', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(new ArrayBuffer(100), {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg' },
        })
      );

      const audio = await client.ai.speak({
        model: 'tts-1',
        input: 'Hello world',
        voice: 'nova',
      });
      expect(audio).toBeInstanceOf(ArrayBuffer);
    });

    it('should accept arbitrary string voice IDs (ElevenLabs)', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(new ArrayBuffer(100), {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg' },
        })
      );

      const audio = await client.ai.speak({
        model: 'eleven_multilingual_v2',
        input: 'Hello from ElevenLabs',
        voice: 'JBFqnCBsd6RMkjVDRZzb',
      });
      expect(audio).toBeInstanceOf(ArrayBuffer);
    });

    it('should reject empty string voice', async () => {
      await expect(
        client.ai.speak({
          model: 'tts-1',
          input: 'Hello',
          voice: '' as any,
        })
      ).rejects.toThrow('voice is required');
    });

    it('should reject undefined voice', async () => {
      await expect(
        client.ai.speak({
          model: 'tts-1',
          input: 'Hello',
          voice: undefined as any,
        })
      ).rejects.toThrow('voice is required');
    });

    it('should reject whitespace-only voice', async () => {
      await expect(
        client.ai.speak({
          model: 'tts-1',
          input: 'Hello',
          voice: '   ' as any,
        })
      ).rejects.toThrow('voice is required');
    });
  });
});
