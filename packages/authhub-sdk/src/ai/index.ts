/**
 * AuthHub AI Module
 *
 * Provides AI chat completion, image generation, embeddings,
 * audio transcription, and text-to-speech capabilities through the AuthHub proxy.
 *
 * @module @authhub/sdk/ai
 * @task TASK-521, TASK-526, TASK-531, TASK-536
 * @feature FTR-112, FTR-113, FTR-114, FTR-115
 */

import type {
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatStreamChunk,
  ListModelsResponse,
  ListModelsOptions,
  AIUsageStats,
  GetUsageOptions,
  // Image generation types (FTR-112)
  ImageGenerationOptions,
  ImageGenerationResponse,
  // Embedding types (FTR-113)
  EmbeddingOptions,
  EmbeddingResponse,
  // Transcription types (FTR-114)
  TranscriptionOptions,
  TranscriptionResponse,
  // Speech types (FTR-115)
  SpeechOptions,
} from '../types';

/**
 * Request function type for making authenticated API calls.
 */
type RequestFn = <T>(options: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}) => Promise<T>;

/**
 * Configuration for the AI module.
 */
interface AIModuleConfig {
  request: RequestFn;
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

/**
 * AI module for chat completions, image generation, embeddings,
 * audio transcription, and text-to-speech.
 *
 * @example
 * ```typescript
 * // Chat completion
 * const response = await client.ai.chat({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * console.log(response.choices[0].message.content);
 *
 * // Image generation
 * const images = await client.ai.generateImage({
 *   prompt: 'A beautiful sunset',
 *   model: 'nano-banana-pro',
 * });
 *
 * // Embeddings
 * const embeddings = await client.ai.createEmbedding({
 *   input: 'Hello world',
 * });
 *
 * // Transcription
 * const transcript = await client.ai.transcribe({
 *   file: audioBlob,
 * });
 *
 * // Text-to-speech
 * const audio = await client.ai.speak({
 *   input: 'Hello!',
 *   voice: 'nova',
 * });
 * ```
 */
export class AIModule {
  private readonly config: AIModuleConfig;

  /**
   * Creates a new AI module instance.
   * @internal
   */
  constructor(config: AIModuleConfig) {
    this.config = config;
  }

  /**
   * Send a chat completion request.
   *
   * @param options - Chat completion options (model, messages, etc.)
   * @returns Chat completion response with choices and usage
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * const response = await client.ai.chat({
   *   model: 'gpt-4',
   *   messages: [
   *     { role: 'system', content: 'You are a helpful assistant.' },
   *     { role: 'user', content: 'What is TypeScript?' },
   *   ],
   *   temperature: 0.7,
   *   max_tokens: 500,
   * });
   *
   * console.log(response.choices[0].message.content);
   * console.log(`Tokens used: ${response.usage.total_tokens}`);
   * ```
   */
  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    this.validateChatOptions(options);

    const response = await this.config.request<ChatCompletionResponse>({
      method: 'POST',
      path: '/api/v1/ai/chat/completions',
      body: {
        ...options,
        stream: false,
      },
    });

    return response;
  }

  /**
   * Send a streaming chat completion request.
   *
   * @param options - Chat completion options (model, messages, etc.)
   * @returns Async iterator yielding chat chunks
   * @throws {Error} If the request fails
   *
   * @remarks
   * **Timeout Behavior**: The configured timeout applies only to the initial
   * connection. Once streaming begins, there is no per-chunk timeout. For
   * very long responses, the stream will continue until completion or error.
   *
   * If you need to limit total streaming time, implement your own timeout
   * logic wrapping the async iterator, or use `AbortController`:
   *
   * ```typescript
   * const controller = new AbortController();
   * setTimeout(() => controller.abort(), 120000); // 2 min max
   *
   * try {
   *   for await (const chunk of client.ai.chatStream(options)) {
   *     // Process chunk
   *   }
   * } catch (e) {
   *   if (e.name === 'AbortError') console.log('Stream timed out');
   * }
   * ```
   *
   * @example
   * ```typescript
   * const stream = client.ai.chatStream({
   *   model: 'gpt-4',
   *   messages: [{ role: 'user', content: 'Tell me a story.' }],
   * });
   *
   * for await (const chunk of stream) {
   *   process.stdout.write(chunk.content);
   *   if (chunk.finish_reason) {
   *     console.log('\n--- Stream complete ---');
   *   }
   * }
   * ```
   */
  async *chatStream(
    options: ChatCompletionOptions
  ): AsyncGenerator<ChatStreamChunk, void, undefined> {
    this.validateChatOptions(options);

    const url = new URL('/api/v1/ai/chat/completions', this.config.baseUrl);

    // SECURITY NOTE: API key is included in headers for streaming requests.
    // Ensure request headers are not logged in production environments.
    const headers: Record<string, string> = {
      'X-API-Key': this.config.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };

    const controller = new AbortController();
    // NOTE: This timeout only applies to the initial connection.
    // Once streaming begins, chunks can take any amount of time.
    // See the @remarks section above for implementing custom streaming timeouts.
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...options,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
        const message = this.extractErrorMessage(errorBody, response.status);
        throw new Error(message);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed || trimmed.startsWith(':')) {
            continue;
          }

          if (trimmed === 'data: [DONE]') {
            return;
          }

          if (trimmed.startsWith('data: ')) {
            const json = trimmed.slice(6);
            try {
              const data = JSON.parse(json) as StreamChunkData;
              const delta = data.choices?.[0]?.delta;

              if (delta?.content !== undefined) {
                yield {
                  content: delta.content,
                  finish_reason: data.choices?.[0]?.finish_reason ?? null,
                };
              } else if (data.choices?.[0]?.finish_reason) {
                yield {
                  content: '',
                  finish_reason: data.choices[0].finish_reason,
                };
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Stream timed out after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * List available AI models.
   *
   * Returns models from all configured providers for this app.
   * Use this to discover which models are available rather than hardcoding.
   *
   * @returns List of available AI models with pricing and capabilities
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * const { data: models } = await client.ai.listModels();
   *
   * // Display available models
   * models.forEach((model) => {
   *   console.log(`${model.id} (${model.owned_by})`);
   *   if (model.context_window) {
   *     console.log(`  Context: ${model.context_window} tokens`);
   *   }
   * });
   *
   * // Find models by provider
   * const openaiModels = models.filter((m) => m.owned_by === 'openai');
   *
   * // Get only text-output models (excludes image, video, audio generators)
   * const { data: chatModels } = await client.ai.listModels({
   *   output_modality: 'text',
   * });
   *
   * // Get models that accept images as input (vision models)
   * const { data: visionModels } = await client.ai.listModels({
   *   input_modality: 'image',
   * });
   * ```
   */
  async listModels(options?: ListModelsOptions): Promise<ListModelsResponse> {
    const params: Record<string, string | undefined> = {};

    if (options?.output_modality) {
      params['output_modality'] = options.output_modality;
    }
    if (options?.input_modality) {
      params['input_modality'] = options.input_modality;
    }

    return this.config.request<ListModelsResponse>({
      method: 'GET',
      path: '/api/v1/ai/models',
      params,
    });
  }

  /**
   * Get AI usage statistics for your app.
   *
   * Returns usage metrics including request counts, token consumption,
   * and cost estimates broken down by provider and over time.
   *
   * @param options - Query options for date range and grouping
   * @returns Usage statistics with totals, by-provider breakdown, and timeline
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * // Get usage for the last 30 days
   * const usage = await client.ai.getUsage({
   *   startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
   *   endDate: new Date(),
   *   groupBy: 'day',
   * });
   *
   * console.log(`Total requests: ${usage.totals.requests}`);
   * console.log(`Total cost: $${usage.totals.cost.toFixed(2)}`);
   *
   * // Show usage by provider
   * for (const [provider, stats] of Object.entries(usage.byProvider)) {
   *   console.log(`${provider}: ${stats.requests} requests, $${stats.cost.toFixed(2)}`);
   * }
   * ```
   */
  async getUsage(options?: GetUsageOptions): Promise<AIUsageStats> {
    const params: Record<string, string | undefined> = {};

    if (options?.startDate) {
      params['startDate'] = options.startDate.toISOString();
    }
    if (options?.endDate) {
      params['endDate'] = options.endDate.toISOString();
    }
    if (options?.groupBy) {
      params['groupBy'] = options.groupBy;
    }

    const response = await this.config.request<{ success: boolean; data: AIUsageStats }>({
      method: 'GET',
      path: '/api/v1/ai/usage',
      params,
    });

    return response.data;
  }

  // ============================================================================
  // Image Generation (FTR-112)
  // ============================================================================

  /**
   * Generate images from text prompts.
   *
   * @param options - Image generation options
   * @returns Generated images with URLs or base64 data
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * const result = await client.ai.generateImage({
   *   prompt: 'A beautiful sunset over mountains',
   *   model: 'nano-banana-pro', // default
   *   aspect_ratio: '16:9',
   *   n: 1,
   * });
   *
   * // Access generated image URL
   * console.log(result.data[0].url);
   *
   * // Or base64 if response_format: 'b64_json'
   * console.log(result.data[0].b64_json);
   * ```
   *
   * @task TASK-521
   * @feature FTR-112
   */
  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
    this.validateImageOptions(options);

    return this.config.request<ImageGenerationResponse>({
      method: 'POST',
      path: '/api/v1/ai/images/generations',
      body: {
        // Core parameters
        model: options.model || 'nano-banana-pro',
        prompt: options.prompt,
        ...(options.n !== undefined && { n: options.n }),
        ...(options.size !== undefined && { size: options.size }),
        ...(options.aspect_ratio !== undefined && { aspect_ratio: options.aspect_ratio }),
        ...(options.quality !== undefined && { quality: options.quality }),
        ...(options.style !== undefined && { style: options.style }),
        ...(options.response_format !== undefined && { response_format: options.response_format }),
        ...(options.user !== undefined && { user: options.user }),

        // Universal advanced parameters
        ...(options.seed !== undefined && { seed: options.seed }),
        ...(options.negative_prompt !== undefined && { negative_prompt: options.negative_prompt }),
        ...(options.output_format !== undefined && { output_format: options.output_format }),

        // OpenAI GPT-Image parameters
        ...(options.background !== undefined && { background: options.background }),
        ...(options.output_compression !== undefined && { output_compression: options.output_compression }),
        ...(options.moderation !== undefined && { moderation: options.moderation }),
        ...(options.fidelity !== undefined && { fidelity: options.fidelity }),

        // Image editing parameters
        ...(options.image !== undefined && { image: options.image }),
        ...(options.mask !== undefined && { mask: options.mask }),

        // Diffusion model parameters
        ...(options.guidance_scale !== undefined && { guidance_scale: options.guidance_scale }),
        ...(options.num_inference_steps !== undefined && { num_inference_steps: options.num_inference_steps }),
        ...(options.scheduler !== undefined && { scheduler: options.scheduler }),
        ...(options.style_preset !== undefined && { style_preset: options.style_preset }),

        // Google Imagen/Gemini parameters
        ...(options.language !== undefined && { language: options.language }),
        ...(options.enhance_prompt !== undefined && { enhance_prompt: options.enhance_prompt }),
        ...(options.person_generation !== undefined && { person_generation: options.person_generation }),
        ...(options.safety_setting !== undefined && { safety_setting: options.safety_setting }),
        ...(options.add_watermark !== undefined && { add_watermark: options.add_watermark }),

        // Nano Banana Pro exclusive parameters
        ...(options.thinking !== undefined && { thinking: options.thinking }),
        ...(options.search_grounding !== undefined && { search_grounding: options.search_grounding }),
        ...(options.reference_images !== undefined && { reference_images: options.reference_images }),
      },
    });
  }

  // ============================================================================
  // Embeddings (FTR-113)
  // ============================================================================

  /**
   * Create embeddings for text input.
   *
   * @param options - Embedding options
   * @returns Embedding vectors for the input
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * // Single embedding
   * const result = await client.ai.createEmbedding({
   *   model: 'text-embedding-3-small',
   *   input: 'Hello world',
   * });
   * console.log(result.data[0].embedding.length); // 1536
   *
   * // Batch embeddings
   * const result = await client.ai.createEmbedding({
   *   input: ['Hello', 'World', 'Test'],
   * });
   * ```
   *
   * @task TASK-526
   * @feature FTR-113
   */
  async createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResponse> {
    this.validateEmbeddingOptions(options);

    return this.config.request<EmbeddingResponse>({
      method: 'POST',
      path: '/api/v1/ai/embeddings',
      body: {
        model: options.model || 'text-embedding-3-small',
        input: options.input,
        ...(options.encoding_format !== undefined && { encoding_format: options.encoding_format }),
        ...(options.dimensions !== undefined && { dimensions: options.dimensions }),
        ...(options.user !== undefined && { user: options.user }),
      },
    });
  }

  // ============================================================================
  // Audio Transcription (FTR-114)
  // ============================================================================

  /**
   * Transcribe audio to text.
   *
   * @param options - Transcription options including audio file
   * @returns Transcribed text and optional timing information
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * // Browser usage
   * const result = await client.ai.transcribe({
   *   file: audioBlob,
   *   language: 'en',
   * });
   * console.log(result.text);
   *
   * // Node.js with file buffer
   * const audioBuffer = fs.readFileSync('audio.mp3');
   * const result = await client.ai.transcribe({
   *   file: audioBuffer,
   *   model: 'whisper-1',
   *   response_format: 'verbose_json',
   * });
   * console.log(result.words); // Word-level timing
   * ```
   *
   * @task TASK-531
   * @feature FTR-114
   */
  async transcribe(options: TranscriptionOptions): Promise<TranscriptionResponse> {
    this.validateTranscriptionOptions(options);

    // Build FormData for multipart upload
    const formData = new FormData();

    // Handle different file input types
    const filename = options.filename || 'audio.mp3';
    let fileBlob: Blob;

    if (options.file instanceof Blob) {
      fileBlob = options.file;
    } else if (options.file instanceof ArrayBuffer) {
      // Use type assertion to satisfy strict TypeScript
      fileBlob = new Blob([new Uint8Array(options.file) as BlobPart]);
    } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(options.file)) {
      // Node.js Buffer - slice to create a proper ArrayBuffer copy
      const buf = options.file as Buffer;
      const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length) as ArrayBuffer;
      fileBlob = new Blob([new Uint8Array(arrayBuffer) as BlobPart]);
    } else {
      throw new Error('Unsupported file type. Use Blob, File, Buffer, or ArrayBuffer.');
    }

    formData.append('file', fileBlob, filename);

    // Add other fields
    formData.append('model', options.model || 'whisper-1');
    if (options.language) formData.append('language', options.language);
    if (options.prompt) formData.append('prompt', options.prompt);
    if (options.response_format) formData.append('response_format', options.response_format);
    if (options.temperature !== undefined) formData.append('temperature', String(options.temperature));

    // Make request with FormData
    const url = new URL('/api/v1/ai/audio/transcriptions', this.config.baseUrl);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'X-API-Key': this.config.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
      const message = this.extractErrorMessage(errorBody, response.status);
      throw new Error(message);
    }

    return response.json() as Promise<TranscriptionResponse>;
  }

  // ============================================================================
  // Text-to-Speech (FTR-115)
  // ============================================================================

  /**
   * Convert text to speech audio.
   *
   * @param options - Speech synthesis options
   * @returns Audio data as ArrayBuffer
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * const audio = await client.ai.speak({
   *   model: 'tts-1',
   *   input: 'Hello, this is a test.',
   *   voice: 'nova',
   *   response_format: 'mp3',
   * });
   *
   * // Node.js: save to file
   * fs.writeFileSync('output.mp3', Buffer.from(audio));
   *
   * // Browser: play audio
   * const blob = new Blob([audio], { type: 'audio/mpeg' });
   * const url = URL.createObjectURL(blob);
   * new Audio(url).play();
   * ```
   *
   * @task TASK-536
   * @feature FTR-115
   */
  async speak(options: SpeechOptions): Promise<ArrayBuffer> {
    this.validateSpeechOptions(options);

    const url = new URL('/api/v1/ai/audio/speech', this.config.baseUrl);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'X-API-Key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'tts-1',
        input: options.input,
        voice: options.voice,
        ...(options.response_format !== undefined && { response_format: options.response_format }),
        ...(options.speed !== undefined && { speed: options.speed }),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
      const message = this.extractErrorMessage(errorBody, response.status);
      throw new Error(message);
    }

    return response.arrayBuffer();
  }

  // ============================================================================
  // Validation Methods
  // ============================================================================

  /**
   * Validate chat completion options.
   * @internal
   */
  private validateChatOptions(options: ChatCompletionOptions): void {
    if (!options.model) {
      throw new Error('model is required');
    }

    if (!options.messages || !Array.isArray(options.messages)) {
      throw new Error('messages must be an array');
    }

    if (options.messages.length === 0) {
      throw new Error('messages cannot be empty');
    }

    for (const message of options.messages) {
      if (!message.role || !['system', 'user', 'assistant'].includes(message.role)) {
        throw new Error('each message must have a valid role (system, user, or assistant)');
      }
      if (typeof message.content !== 'string') {
        throw new Error('each message must have a content string');
      }
    }

    // Validate reasoning_effort if provided (for o1/o3/o4 models)
    if (options.reasoning_effort !== undefined) {
      const validEfforts = ['low', 'medium', 'high'];
      if (!validEfforts.includes(options.reasoning_effort)) {
        throw new Error('reasoning_effort must be: low, medium, or high');
      }
    }

    // Validate timeoutMs if provided (FTR-037)
    if (options.timeoutMs !== undefined) {
      if (typeof options.timeoutMs !== 'number' || !Number.isInteger(options.timeoutMs)) {
        throw new Error('timeoutMs must be an integer');
      }
      if (options.timeoutMs < 5000) {
        throw new Error('timeoutMs must be at least 5000 (5 seconds)');
      }
      if (options.timeoutMs > 300000) {
        throw new Error('timeoutMs must not exceed 300000 (5 minutes)');
      }
    }
  }

  /**
   * Validate image generation options.
   * @internal
   */
  private validateImageOptions(options: ImageGenerationOptions): void {
    if (!options.prompt || typeof options.prompt !== 'string') {
      throw new Error('prompt is required and must be a string');
    }

    if (options.prompt.length === 0) {
      throw new Error('prompt cannot be empty');
    }

    // GPT-Image supports up to 10 images
    if (options.n !== undefined && (options.n < 1 || options.n > 10)) {
      throw new Error('n must be between 1 and 10');
    }

    // Validate seed if provided
    if (options.seed !== undefined && (options.seed < 1 || options.seed > 2147483647)) {
      throw new Error('seed must be between 1 and 2147483647');
    }

    // Validate output_compression if provided
    if (options.output_compression !== undefined && (options.output_compression < 0 || options.output_compression > 100)) {
      throw new Error('output_compression must be between 0 and 100');
    }

    // Validate guidance_scale if provided
    if (options.guidance_scale !== undefined && (options.guidance_scale < 1 || options.guidance_scale > 50)) {
      throw new Error('guidance_scale must be between 1 and 50');
    }

    // Validate num_inference_steps if provided
    if (options.num_inference_steps !== undefined && (options.num_inference_steps < 1 || options.num_inference_steps > 500)) {
      throw new Error('num_inference_steps must be between 1 and 500');
    }

    // Validate reference_images array length (Nano Banana Pro supports up to 14)
    if (options.reference_images !== undefined && options.reference_images.length > 14) {
      throw new Error('reference_images cannot exceed 14 images');
    }
  }

  /**
   * Validate embedding options.
   * @internal
   */
  private validateEmbeddingOptions(options: EmbeddingOptions): void {
    if (!options.input) {
      throw new Error('input is required');
    }

    if (typeof options.input === 'string') {
      if (options.input.length === 0) {
        throw new Error('input cannot be empty');
      }
    } else if (Array.isArray(options.input)) {
      if (options.input.length === 0) {
        throw new Error('input array cannot be empty');
      }
      for (const text of options.input) {
        if (typeof text !== 'string' || text.length === 0) {
          throw new Error('each input must be a non-empty string');
        }
      }
    } else {
      throw new Error('input must be a string or array of strings');
    }
  }

  /**
   * Validate transcription options.
   * @internal
   */
  private validateTranscriptionOptions(options: TranscriptionOptions): void {
    if (!options.file) {
      throw new Error('file is required');
    }

    if (options.language && !/^[a-z]{2}$/.test(options.language)) {
      throw new Error('language must be a valid ISO 639-1 code (2 lowercase letters)');
    }

    if (options.temperature !== undefined && (options.temperature < 0 || options.temperature > 1)) {
      throw new Error('temperature must be between 0 and 1');
    }

    const validFormats = ['json', 'text', 'srt', 'vtt', 'verbose_json'];
    if (options.response_format && !validFormats.includes(options.response_format)) {
      throw new Error(`response_format must be one of: ${validFormats.join(', ')}`);
    }
  }

  /**
   * Validate speech options.
   * @internal
   */
  private validateSpeechOptions(options: SpeechOptions): void {
    if (!options.input || typeof options.input !== 'string') {
      throw new Error('input is required and must be a string');
    }

    if (options.input.length === 0) {
      throw new Error('input cannot be empty');
    }

    if (options.input.length > 4096) {
      throw new Error('input cannot exceed 4096 characters');
    }

    if (!options.voice || typeof options.voice !== 'string' || options.voice.trim().length === 0) {
      throw new Error('voice is required and must be a non-empty string (e.g. "nova" for OpenAI, or an ElevenLabs voice ID)');
    }

    if (options.speed !== undefined && (options.speed < 0.25 || options.speed > 4.0)) {
      throw new Error('speed must be between 0.25 and 4.0');
    }

    const validFormats = ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'];
    if (options.response_format && !validFormats.includes(options.response_format)) {
      throw new Error(`response_format must be one of: ${validFormats.join(', ')}`);
    }
  }

  /**
   * Extract error message from response body.
   * @internal
   */
  private extractErrorMessage(body: Record<string, unknown>, status: number): string {
    if ('error' in body && body['error'] && typeof body['error'] === 'object') {
      const errorObj = body['error'] as Record<string, unknown>;
      if ('message' in errorObj && typeof errorObj['message'] === 'string') {
        return errorObj['message'];
      }
    }
    return `AI request failed with status ${status}`;
  }
}

/**
 * Stream chunk data from SSE.
 * @internal
 */
interface StreamChunkData {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    finish_reason?: string | null;
  }>;
}
