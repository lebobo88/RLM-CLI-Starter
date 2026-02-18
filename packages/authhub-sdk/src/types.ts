/**
 * AuthHub SDK Types
 *
 * Core type definitions for the AuthHub SDK.
 *
 * @module @authhub/sdk/types
 */

import type { AuthModuleConfig } from './auth/types';
import type { CaptureStrategyName } from './debug/types';

// ============================================================================
// Client Configuration
// ============================================================================

/**
 * Debug module configuration options for the AuthHub client.
 * Passed through to DebugModule when accessed via `client.debug`.
 */
export interface DebugClientConfig {
  /** Enable/disable debug module (default: true) */
  enabled?: boolean;
  /** Sample rate for capturing errors (0-1, default: 1.0) */
  sampleRate?: number;
  /** Environment name (e.g., 'production', 'staging', 'development') */
  environment?: string;
  /** Release/version identifier for grouping errors */
  release?: string;
  /** Maximum breadcrumbs to keep (default: 50) */
  maxBreadcrumbs?: number;
  /** Capture strategies to use */
  strategies?: CaptureStrategyName[];
}

/**
 * Configuration options for the AuthHub client.
 */
export interface AuthHubClientConfig {
  /** Base URL of the AuthHub API (e.g., 'https://authhub.example.com') */
  baseUrl: string;
  /** API key for authentication (starts with 'ak_') */
  apiKey: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts for transient errors (default: 3) */
  retries?: number;
  /** Authentication module configuration */
  auth?: AuthModuleConfig;
  /** Debug module configuration for zero-trust debug logging */
  debug?: DebugClientConfig;
}

// ============================================================================
// AI Types
// ============================================================================

/**
 * Role of a message in a chat conversation.
 */
export type ChatRole = 'system' | 'user' | 'assistant';

/**
 * A single message in a chat conversation.
 */
export interface ChatMessage {
  /** Role of the message author */
  role: ChatRole;
  /** Content of the message */
  content: string;
}

/**
 * Options for a chat completion request.
 */
export interface ChatCompletionOptions {
  /** Model ID to use (e.g., 'gpt-4', 'claude-3-opus') */
  model: string;
  /** Array of messages in the conversation */
  messages: ChatMessage[];
  /** Sampling temperature (0-2, default: 1) */
  temperature?: number;
  /** Maximum tokens to generate */
  max_tokens?: number;
  /** Whether to stream the response */
  stream?: boolean;
  /** Stop sequences */
  stop?: string | string[];
  /** Presence penalty (-2 to 2) */
  presence_penalty?: number;
  /** Frequency penalty (-2 to 2) */
  frequency_penalty?: number;
  /** Top-p sampling (0-1) */
  top_p?: number;
  /** Reasoning effort for o1/o3/o4 models */
  reasoning_effort?: 'low' | 'medium' | 'high';
  /** User identifier for abuse tracking */
  user?: string;
  /**
   * Request-specific timeout in milliseconds.
   *
   * Overrides the app's default timeout. Capped at the app's maxTimeoutMs.
   * If not provided, uses the app's defaultTimeoutMs.
   *
   * @minimum 5000
   * @maximum 300000
   * @example
   * ```typescript
   * // 60 second timeout for complex analysis
   * await client.ai.chat({
   *   model: 'gpt-4o',
   *   messages: [...],
   *   timeoutMs: 60000,
   * });
   * ```
   */
  timeoutMs?: number;
}

/**
 * A single choice in a chat completion response.
 */
export interface ChatChoice {
  /** Index of this choice */
  index: number;
  /** The generated message */
  message: ChatMessage;
  /** Reason the generation stopped */
  finish_reason: string | null;
}

/**
 * Token usage statistics for a completion.
 */
export interface ChatUsage {
  /** Tokens in the prompt */
  prompt_tokens: number;
  /** Tokens in the completion */
  completion_tokens: number;
  /** Total tokens used */
  total_tokens: number;
}

/**
 * AuthHub-specific metadata attached to AI responses.
 * Provides cost tracking, latency metrics, and request correlation.
 */
export interface AuthHubMetadata {
  /** Unique request ID for correlation with server logs */
  request_id: string;
  /** Provider that handled the request (e.g., 'openai', 'anthropic') */
  provider: string;
  /** Estimated cost in USD for this request */
  cost_usd: number;
  /** Total latency in milliseconds */
  latency_ms: number;
}

/**
 * Response from a chat completion request.
 */
export interface ChatCompletionResponse {
  /** Unique ID for this completion */
  id: string;
  /** Object type (always 'chat.completion') */
  object: 'chat.completion';
  /** Unix timestamp of creation */
  created: number;
  /** Model used for the completion */
  model: string;
  /** Array of completion choices */
  choices: ChatChoice[];
  /** Token usage statistics */
  usage: ChatUsage;
  /** AuthHub-specific metadata (cost, latency, provider) */
  authhub?: AuthHubMetadata;
}

/**
 * A chunk from a streaming chat completion.
 */
export interface ChatStreamChunk {
  /** Content of this chunk */
  content: string;
  /** Reason generation stopped (only in final chunk) */
  finish_reason?: string | null;
}

// ============================================================================
// Database Types
// ============================================================================

/**
 * Result of a database query.
 */
export interface QueryResult<T = Record<string, unknown>> {
  /** Array of rows returned */
  rows: T[];
  /** Number of rows returned */
  rowCount: number;
}

/**
 * Transaction context for atomic operations.
 */
export interface TransactionContext {
  /**
   * Execute a query within the transaction.
   * @param sql - SQL query string with parameterized placeholders
   * @param params - Array of parameter values
   */
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>>;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard error response from the API.
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// AI Model Discovery Types
// ============================================================================

/**
 * Information about an available AI model.
 *
 * Note: Same model ID may appear multiple times if configured on multiple providers.
 * Use provider_id/provider_slug to distinguish between instances.
 */
export interface AIModel {
  /** Model identifier (e.g., 'gpt-4o', 'claude-3-opus-20240229') */
  id: string;
  /** Object type (always 'model') */
  object: string;
  /** Unix timestamp when model was created */
  created: number;
  /** Provider type (e.g., 'openai', 'anthropic', 'openrouter') */
  owned_by: string;
  /** AuthHub provider UUID */
  provider_id: string;
  /** Human-readable provider name configured in AuthHub */
  provider_name: string;
  /** Provider slug for API calls */
  provider_slug: string;
  /** Maximum context window in tokens (if known) */
  context_window?: number;
  /** Pricing per 1k tokens (if available) */
  pricing?: {
    /** Input tokens cost per 1k */
    input: number;
    /** Output tokens cost per 1k */
    output: number;
  };
  /** Model architecture with input/output modalities (OpenRouter-aligned) */
  architecture?: ModelArchitecture;
}

/**
 * Input modalities - what the model accepts (OpenRouter standard)
 */
export type InputModality = 'text' | 'image' | 'audio' | 'video' | 'file';

/**
 * Output modalities - what the model produces (OpenRouter standard)
 */
export type OutputModality = 'text' | 'image' | 'audio' | 'video' | 'embeddings';

/**
 * Model architecture information (OpenRouter-aligned)
 */
export interface ModelArchitecture {
  /** What types of input the model accepts */
  input_modalities: InputModality[];
  /** What types of output the model produces */
  output_modalities: OutputModality[];
}

/**
 * Options for listing models.
 */
export interface ListModelsOptions {
  /** Filter by output modality (what the model produces) */
  output_modality?: OutputModality;
  /** Filter by input modality (what the model accepts) */
  input_modality?: InputModality;
}

/**
 * Response from listing available AI models.
 */
export interface ListModelsResponse {
  /** Object type (always 'list') */
  object: 'list';
  /** Array of available models */
  data: AIModel[];
}

// ============================================================================
// AI Usage Analytics Types
// ============================================================================

/**
 * Usage statistics for AI operations.
 */
export interface AIUsageStats {
  /** Aggregate totals */
  totals: {
    /** Total number of requests */
    requests: number;
    /** Total tokens used (input + output) */
    tokens: number;
    /** Total cost in USD */
    cost: number;
  };
  /** Usage breakdown by provider */
  byProvider: Record<
    string,
    {
      /** Requests for this provider */
      requests: number;
      /** Tokens used with this provider */
      tokens: number;
      /** Cost for this provider in USD */
      cost: number;
    }
  >;
  /** Usage over time */
  timeline: Array<{
    /** Date string (YYYY-MM-DD or week/month identifier) */
    date: string;
    /** Requests on this date */
    requests: number;
    /** Tokens used on this date */
    tokens: number;
    /** Cost on this date in USD */
    cost: number;
  }>;
}

/**
 * Options for querying AI usage statistics.
 */
export interface GetUsageOptions {
  /** Start date for the query range */
  startDate?: Date;
  /** End date for the query range */
  endDate?: Date;
  /** How to group timeline data */
  groupBy?: 'day' | 'week' | 'month';
}

// ============================================================================
// Image Generation Types (FTR-112)
// ============================================================================

/**
 * Image size options for generation.
 */
export type ImageSize =
  | '256x256'
  | '512x512'
  | '1024x1024'
  | '1024x1792'
  | '1792x1024'
  | '1K'
  | '2K'
  | '4K';

/**
 * Image aspect ratio options (primarily for Gemini).
 */
export type ImageAspectRatio =
  | '1:1'
  | '2:3'
  | '3:2'
  | '3:4'
  | '4:3'
  | '4:5'
  | '5:4'
  | '9:16'
  | '16:9'
  | '21:9';

/**
 * Image quality options.
 * - 'standard': Default quality
 * - 'hd': High definition
 * - '4k': 4K resolution
 * - 'low': Low quality (faster, OpenAI GPT-Image)
 * - 'medium': Medium quality (OpenAI GPT-Image)
 * - 'high': High quality (OpenAI GPT-Image)
 * - 'auto': Automatic quality selection
 */
export type ImageQuality = 'standard' | 'hd' | '4k' | 'low' | 'medium' | 'high' | 'auto';

/**
 * Image style options (OpenAI DALL-E).
 */
export type ImageStyle = 'vivid' | 'natural';

/**
 * Image response format options.
 */
export type ImageResponseFormat = 'url' | 'b64_json';

/**
 * Image output format (file type).
 */
export type ImageOutputFormat = 'png' | 'jpeg' | 'webp';

/**
 * Image background options (OpenAI GPT-Image).
 */
export type ImageBackground = 'transparent' | 'opaque' | 'auto';

/**
 * Image moderation level (OpenAI GPT-Image).
 */
export type ImageModeration = 'auto' | 'low';

/**
 * Image fidelity for input image matching (OpenAI GPT-Image).
 */
export type ImageFidelity = 'low' | 'high';

/**
 * Person generation control (Google Imagen).
 */
export type PersonGeneration = 'dont_allow' | 'allow_adult' | 'allow_all';

/**
 * Diffusion model schedulers (FLUX, Stable Diffusion).
 */
export type DiffusionScheduler =
  | 'DDIM'
  | 'DPMSolverMultistep'
  | 'HeunDiscrete'
  | 'KarrasDPM'
  | 'K_EULER_ANCESTRAL'
  | 'K_EULER'
  | 'PNDM';

/**
 * Style presets for Stable Diffusion.
 */
export type ImageStylePreset =
  | 'none'
  | 'enhance'
  | 'anime'
  | 'photographic'
  | 'digital-art'
  | 'comic-book'
  | 'fantasy-art'
  | 'analog-film'
  | 'neon-punk'
  | 'isometric'
  | 'low-poly'
  | 'origami'
  | 'line-art'
  | 'craft-clay'
  | 'cinematic'
  | '3d-model'
  | 'pixel-art';

/**
 * Options for image generation request.
 *
 * @example
 * ```typescript
 * const result = await client.ai.generateImage({
 *   prompt: 'A beautiful sunset over mountains',
 *   model: 'nano-banana-pro', // optional, this is default
 *   aspect_ratio: '16:9',
 *   n: 1,
 * });
 * ```
 */
export interface ImageGenerationOptions {
  // === Core Parameters ===
  /** Text prompt describing the image to generate */
  prompt: string;
  /** Model to use (default: 'nano-banana-pro') */
  model?: string;
  /** Number of images to generate (1-10, provider dependent) */
  n?: number;
  /** Image size (e.g., '1024x1024', '4K') */
  size?: ImageSize;
  /** Aspect ratio for the image (e.g., '16:9', '1:1') */
  aspect_ratio?: ImageAspectRatio;
  /** Image quality level */
  quality?: ImageQuality;
  /** Image style (vivid, natural) - OpenAI DALL-E */
  style?: ImageStyle;
  /** Response format (url or b64_json) */
  response_format?: ImageResponseFormat;
  /** User identifier for abuse tracking */
  user?: string;

  // === Universal Advanced Parameters ===
  /** Seed for reproducible generation (provider dependent) */
  seed?: number;
  /** Negative prompt - what to avoid in the image (FLUX, SD, Imagen) */
  negative_prompt?: string;
  /** Output file format (png, jpeg, webp) */
  output_format?: ImageOutputFormat;

  // === OpenAI GPT-Image Parameters ===
  /** Background type - 'transparent' for PNG with alpha (GPT-Image only) */
  background?: ImageBackground;
  /** Compression level for JPEG/WebP output (0-100) */
  output_compression?: number;
  /** Content moderation level (GPT-Image only) */
  moderation?: ImageModeration;
  /** Fidelity for input image matching in editing (GPT-Image only) */
  fidelity?: ImageFidelity;

  // === Image Editing Parameters ===
  /** Reference image(s) for editing - base64 or URL (up to 14 for Gemini, 16 for OpenAI) */
  image?: string | string[];
  /** PNG mask for inpainting - transparent areas indicate edit region */
  mask?: string;

  // === Diffusion Model Parameters (FLUX, Stable Diffusion) ===
  /** Classifier-free guidance scale (typically 1.5-20) */
  guidance_scale?: number;
  /** Number of inference steps (affects quality vs speed) */
  num_inference_steps?: number;
  /** Sampler/scheduler algorithm */
  scheduler?: DiffusionScheduler | string;
  /** Style preset for Stable Diffusion */
  style_preset?: ImageStylePreset | string;

  // === Google Imagen/Gemini Parameters ===
  /** Language for prompt interpretation (Imagen) */
  language?: string;
  /** Enable automatic prompt enhancement via LLM (Imagen) */
  enhance_prompt?: boolean;
  /** Person generation control (Imagen) */
  person_generation?: PersonGeneration;
  /** Safety filter setting (Imagen) */
  safety_setting?: string;
  /** Add SynthID watermark (Imagen, default: true) */
  add_watermark?: boolean;

  // === Nano Banana Pro Exclusive Parameters ===
  /** Enable thinking mode - advanced reasoning with thought images (Nano Banana Pro only) */
  thinking?: boolean;
  /** Enable Google Search grounding for real-time data (Nano Banana Pro only) */
  search_grounding?: boolean;
  /** Reference images for style/character consistency (up to 14, Nano Banana Pro) */
  reference_images?: string[];
}

/**
 * Single image data in the response.
 */
export interface ImageData {
  /** URL of the generated image (if response_format is 'url') */
  url?: string;
  /** Base64-encoded image data (if response_format is 'b64_json') */
  b64_json?: string;
  /** Revised prompt used for generation (if applicable) */
  revised_prompt?: string;
  /** MIME type of the image */
  mime_type?: string;
  /** Whether this is a thought/reasoning image (Nano Banana Pro thinking mode) */
  is_thought_image?: boolean;
  /** Seed used for this generation (for reproducibility) */
  seed?: number;
}

/**
 * Thought/reasoning step from thinking mode (Nano Banana Pro).
 */
export interface ThoughtStep {
  /** The reasoning text for this step */
  text: string;
  /** Interim image showing the reasoning process */
  image?: ImageData;
}

/**
 * Response from image generation request.
 */
export interface ImageGenerationResponse {
  /** Unix timestamp of creation */
  created: number;
  /** Array of generated images */
  data: ImageData[];
  /** Model used for generation */
  model?: string;
  /** Provider that generated the image */
  provider?: string;
  /** Text description returned alongside images (Gemini) */
  text?: string;
  /** Thought/reasoning steps from thinking mode (Nano Banana Pro) */
  thinking_steps?: ThoughtStep[];
  /** Search grounding sources used (Nano Banana Pro) */
  grounding_sources?: string[];
  /** AuthHub-specific metadata */
  authhub?: AuthHubMetadata;
}

// ============================================================================
// Embeddings Types (FTR-113)
// ============================================================================

/**
 * Encoding format for embeddings.
 */
export type EmbeddingEncodingFormat = 'float' | 'base64';

/**
 * Options for creating embeddings.
 *
 * @example
 * ```typescript
 * // Single embedding
 * const result = await client.ai.createEmbedding({
 *   model: 'text-embedding-3-small',
 *   input: 'Hello world',
 * });
 *
 * // Batch embeddings
 * const result = await client.ai.createEmbedding({
 *   input: ['Hello', 'World', 'Test'],
 * });
 * ```
 */
export interface EmbeddingOptions {
  /** Text or array of texts to embed */
  input: string | string[];
  /** Model to use (default: 'text-embedding-3-small') */
  model?: string;
  /** Encoding format for the embeddings */
  encoding_format?: EmbeddingEncodingFormat;
  /** Number of dimensions for the embedding (if model supports) */
  dimensions?: number;
  /** User identifier for abuse tracking */
  user?: string;
}

/**
 * Single embedding data in the response.
 */
export interface EmbeddingData {
  /** Object type (always 'embedding') */
  object: 'embedding';
  /** Index of this embedding in the input array */
  index: number;
  /** The embedding vector */
  embedding: number[];
}

/**
 * Response from embedding creation request.
 */
export interface EmbeddingResponse {
  /** Object type (always 'list') */
  object: 'list';
  /** Array of embeddings */
  data: EmbeddingData[];
  /** Model used for embedding */
  model: string;
  /** Token usage statistics */
  usage: {
    /** Tokens in the input */
    prompt_tokens: number;
    /** Total tokens used */
    total_tokens: number;
  };
}

// ============================================================================
// Audio Transcription Types (FTR-114)
// ============================================================================

/**
 * Response format options for transcription.
 */
export type TranscriptionResponseFormat =
  | 'json'
  | 'text'
  | 'srt'
  | 'vtt'
  | 'verbose_json';

/**
 * File input type for transcription - supports multiple input formats.
 */
export type TranscriptionFileInput = Blob | File | Buffer | ArrayBuffer | ReadableStream;

/**
 * Options for audio transcription.
 *
 * @example
 * ```typescript
 * // Node.js usage
 * const result = await client.ai.transcribe({
 *   model: 'whisper-1',
 *   file: fs.createReadStream('audio.mp3'),
 *   response_format: 'verbose_json',
 * });
 *
 * // Browser usage
 * const result = await client.ai.transcribe({
 *   file: audioBlob,
 *   language: 'en',
 * });
 * ```
 */
export interface TranscriptionOptions {
  /** Audio file to transcribe (Blob, File, Buffer, etc.) */
  file: TranscriptionFileInput;
  /** Model to use (default: 'whisper-1') */
  model?: string;
  /** Filename for the audio file (optional, helps with format detection) */
  filename?: string;
  /** ISO-639-1 language code (e.g., 'en', 'es', 'fr') */
  language?: string;
  /** Context or spelling hints for the transcription */
  prompt?: string;
  /** Response format (json, text, srt, vtt, verbose_json) */
  response_format?: TranscriptionResponseFormat;
  /** Sampling temperature (0-1) */
  temperature?: number;
}

/**
 * Word-level timing information (for verbose_json format).
 */
export interface TranscriptionWord {
  /** The word text */
  word: string;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
}

/**
 * Segment information (for verbose_json format).
 */
export interface TranscriptionSegment {
  /** Segment ID */
  id: number;
  /** Seek position */
  seek: number;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
  /** Transcribed text */
  text: string;
  /** Token IDs */
  tokens: number[];
  /** Temperature used */
  temperature: number;
  /** Average log probability */
  avg_logprob: number;
  /** Compression ratio */
  compression_ratio: number;
  /** No speech probability */
  no_speech_prob: number;
}

/**
 * Response from audio transcription.
 */
export interface TranscriptionResponse {
  /** Transcribed text */
  text: string;
  /** Detected or specified language */
  language?: string;
  /** Duration of the audio in seconds */
  duration?: number;
  /** Word-level timing (if verbose_json) */
  words?: TranscriptionWord[];
  /** Segment information (if verbose_json) */
  segments?: TranscriptionSegment[];
}

// ============================================================================
// Text-to-Speech Types (FTR-115)
// ============================================================================

/**
 * Available voices for TTS.
 * OpenAI voices are listed for autocomplete; any string is accepted (e.g. ElevenLabs voice IDs).
 */
export type SpeechVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | (string & {});

/**
 * Audio format options for TTS output.
 */
export type SpeechAudioFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';

/**
 * Options for text-to-speech synthesis.
 *
 * @example
 * ```typescript
 * // Get audio buffer
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
 */
export interface SpeechOptions {
  /** Text to synthesize (max 4096 characters) */
  input: string;
  /** Voice to use for synthesis */
  voice: SpeechVoice;
  /** Model to use (default: 'tts-1') */
  model?: string;
  /** Audio format for the response (default: 'mp3') */
  response_format?: SpeechAudioFormat;
  /** Speed of speech (0.25 to 4.0, default: 1.0) */
  speed?: number;
}
