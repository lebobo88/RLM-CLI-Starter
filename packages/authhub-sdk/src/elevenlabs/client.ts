/**
 * ElevenLabs SDK Client Module
 *
 * Provides typed methods for all ElevenLabs endpoints through the AuthHub API:
 * sound generation, audio isolation, speech-to-speech, voice management,
 * music generation, dialogue, voice design, history, forced alignment, dubbing.
 *
 * @feature FTR-159
 */

import type {
  SoundGenerationParams,
  AudioIsolationParams,
  SpeechToSpeechParams,
  VoiceListResponse,
  ElevenLabsVoice,
  CreateVoiceParams,
  UpdateVoiceParams,
  DefaultVoiceSettings,
  FindSimilarVoicesParams,
  SharedVoicesParams,
  MusicGenerationParams,
  MusicPlanParams,
  MusicPlanResponse,
  DialogueParams,
  VoiceDesignPreviewParams,
  VoiceDesignPreviewResponse,
  VoiceDesignCreateParams,
  VoiceDesignCreateResponse,
  HistoryListParams,
  HistoryListResponse,
  HistoryItem,
  ForcedAlignmentParams,
  ForcedAlignmentResponse,
  DubbingCreateParams,
  DubbingCreateResponse,
  DubbingStatusResponse,
  AudioResponse,
} from './types';

/**
 * Request function type matching the AuthHubClient.request signature.
 */
type RequestFn = <T>(options: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}) => Promise<T>;

/**
 * Configuration for the ElevenLabs module.
 */
export interface ElevenLabsModuleConfig {
  request: RequestFn;
}

const PREFIX = '/api/v1/elevenlabs';

/**
 * ElevenLabs module for audio generation, voice management, and more.
 *
 * @example
 * ```typescript
 * // Generate a sound effect
 * const audio = await client.elevenlabs.generateSoundEffect({
 *   text: 'A thunderstorm with heavy rain',
 *   duration_seconds: 10,
 * });
 *
 * // List voices
 * const voices = await client.elevenlabs.listVoices();
 *
 * // Generate music
 * const music = await client.elevenlabs.generateMusic({
 *   prompt: 'An upbeat electronic track',
 *   music_length_ms: 30000,
 * });
 * ```
 */
export class ElevenLabsModule {
  private readonly request: RequestFn;

  constructor(config: ElevenLabsModuleConfig) {
    this.request = config.request;
  }

  // ==================================================================
  // Sound Generation
  // ==================================================================

  /**
   * Generate a sound effect from a text prompt.
   *
   * @param params - Sound generation parameters
   * @returns Audio bytes as ArrayBuffer with content type
   */
  async generateSoundEffect(params: SoundGenerationParams): Promise<AudioResponse> {
    return this.rawAudioRequest('POST', `${PREFIX}/sound-generation`, params);
  }

  // ==================================================================
  // Audio Isolation
  // ==================================================================

  /**
   * Remove background noise and isolate vocals from audio.
   *
   * @param params - Audio file to process
   * @returns Isolated audio
   */
  async isolateAudio(params: AudioIsolationParams): Promise<AudioResponse> {
    return this.multipartAudioRequest(`${PREFIX}/audio-isolation`, params.audio, params.filename);
  }

  // ==================================================================
  // Speech-to-Speech
  // ==================================================================

  /**
   * Convert voice identity of an audio file.
   *
   * @param params - Voice ID, audio, and optional settings
   * @returns Converted audio
   */
  async speechToSpeech(params: SpeechToSpeechParams): Promise<AudioResponse> {
    const { audio, filename, voice_id, ...rest } = params;
    return this.request<AudioResponse>({
      method: 'POST',
      path: `${PREFIX}/speech-to-speech`,
      body: { voice_id, ...rest },
    });
  }

  // ==================================================================
  // Voice Management
  // ==================================================================

  /**
   * List all available voices.
   */
  async listVoices(): Promise<VoiceListResponse> {
    return this.request<VoiceListResponse>({
      method: 'GET',
      path: `${PREFIX}/voices`,
    });
  }

  /**
   * Get details for a specific voice.
   */
  async getVoice(voiceId: string): Promise<ElevenLabsVoice> {
    return this.request<ElevenLabsVoice>({
      method: 'GET',
      path: `${PREFIX}/voices/${encodeURIComponent(voiceId)}`,
    });
  }

  /**
   * Create a new voice (instant clone).
   */
  async createVoice(params: CreateVoiceParams): Promise<ElevenLabsVoice> {
    return this.request<ElevenLabsVoice>({
      method: 'POST',
      path: `${PREFIX}/voices`,
      body: { name: params.name, description: params.description, labels: params.labels },
    });
  }

  /**
   * Delete a voice.
   */
  async deleteVoice(voiceId: string): Promise<void> {
    await this.request<Record<string, never>>({
      method: 'DELETE',
      path: `${PREFIX}/voices/${encodeURIComponent(voiceId)}`,
    });
  }

  /**
   * Update voice metadata.
   */
  async updateVoice(voiceId: string, params: UpdateVoiceParams): Promise<ElevenLabsVoice> {
    return this.request<ElevenLabsVoice>({
      method: 'PATCH',
      path: `${PREFIX}/voices/${encodeURIComponent(voiceId)}`,
      body: params,
    });
  }

  /**
   * Get the default voice settings.
   */
  async getDefaultVoiceSettings(): Promise<DefaultVoiceSettings> {
    return this.request<DefaultVoiceSettings>({
      method: 'GET',
      path: `${PREFIX}/voices/settings/default`,
    });
  }

  /**
   * Get settings for a specific voice.
   */
  async getVoiceSettings(voiceId: string): Promise<DefaultVoiceSettings> {
    return this.request<DefaultVoiceSettings>({
      method: 'GET',
      path: `${PREFIX}/voices/${encodeURIComponent(voiceId)}/settings`,
    });
  }

  /**
   * Update settings for a specific voice.
   */
  async updateVoiceSettings(
    voiceId: string,
    settings: Partial<DefaultVoiceSettings>,
  ): Promise<DefaultVoiceSettings> {
    return this.request<DefaultVoiceSettings>({
      method: 'PATCH',
      path: `${PREFIX}/voices/${encodeURIComponent(voiceId)}/settings`,
      body: settings,
    });
  }

  /**
   * Find voices similar to an audio sample.
   */
  async findSimilarVoices(params: FindSimilarVoicesParams): Promise<VoiceListResponse> {
    return this.request<VoiceListResponse>({
      method: 'POST',
      path: `${PREFIX}/voices/similar`,
      body: {
        similarity_threshold: params.similarity_threshold,
        top_k: params.top_k,
      },
    });
  }

  /**
   * Browse shared voices from the voice library.
   */
  async getSharedVoices(params?: SharedVoicesParams): Promise<unknown> {
    return this.request<unknown>({
      method: 'GET',
      path: `${PREFIX}/voices/shared`,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  // ==================================================================
  // Music Generation
  // ==================================================================

  /**
   * Generate music from a prompt or composition plan.
   *
   * @returns Audio bytes
   */
  async generateMusic(params: MusicGenerationParams): Promise<AudioResponse> {
    return this.rawAudioRequest('POST', `${PREFIX}/music`, params);
  }

  /**
   * Generate music with detailed metadata response.
   */
  async generateMusicDetailed(params: MusicGenerationParams): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: `${PREFIX}/music/detailed`,
      body: params,
    });
  }

  /**
   * Create a composition plan for music generation (free, no credits).
   */
  async createMusicPlan(params: MusicPlanParams): Promise<MusicPlanResponse> {
    return this.request<MusicPlanResponse>({
      method: 'POST',
      path: `${PREFIX}/music/plan`,
      body: params,
    });
  }

  // ==================================================================
  // Text-to-Dialogue
  // ==================================================================

  /**
   * Generate multi-voice dialogue audio.
   *
   * @returns Audio bytes
   */
  async generateDialogue(params: DialogueParams): Promise<AudioResponse> {
    return this.rawAudioRequest('POST', `${PREFIX}/dialogue`, params);
  }

  // ==================================================================
  // Voice Design
  // ==================================================================

  /**
   * Preview a voice generated from a text description.
   */
  async previewVoiceDesign(params: VoiceDesignPreviewParams): Promise<VoiceDesignPreviewResponse> {
    return this.request<VoiceDesignPreviewResponse>({
      method: 'POST',
      path: `${PREFIX}/voice-design/preview`,
      body: params,
    });
  }

  /**
   * Create a permanent voice from a voice design preview.
   */
  async createVoiceFromDesign(params: VoiceDesignCreateParams): Promise<VoiceDesignCreateResponse> {
    return this.request<VoiceDesignCreateResponse>({
      method: 'POST',
      path: `${PREFIX}/voice-design/create`,
      body: params,
    });
  }

  // ==================================================================
  // History
  // ==================================================================

  /**
   * List generation history.
   */
  async listHistory(params?: HistoryListParams): Promise<HistoryListResponse> {
    return this.request<HistoryListResponse>({
      method: 'GET',
      path: `${PREFIX}/history`,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Get a specific history item.
   */
  async getHistoryItem(itemId: string): Promise<HistoryItem> {
    return this.request<HistoryItem>({
      method: 'GET',
      path: `${PREFIX}/history/${encodeURIComponent(itemId)}`,
    });
  }

  /**
   * Delete a history item.
   */
  async deleteHistoryItem(itemId: string): Promise<void> {
    await this.request<Record<string, never>>({
      method: 'DELETE',
      path: `${PREFIX}/history/${encodeURIComponent(itemId)}`,
    });
  }

  /**
   * Get the audio of a history item.
   */
  async getHistoryItemAudio(itemId: string): Promise<AudioResponse> {
    return this.rawAudioRequest('GET', `${PREFIX}/history/${encodeURIComponent(itemId)}/audio`);
  }

  // ==================================================================
  // Forced Alignment
  // ==================================================================

  /**
   * Get character/word timing from audio + transcript.
   */
  async forcedAlignment(params: ForcedAlignmentParams): Promise<ForcedAlignmentResponse> {
    return this.request<ForcedAlignmentResponse>({
      method: 'POST',
      path: `${PREFIX}/forced-alignment`,
      body: { text: params.text },
    });
  }

  // ==================================================================
  // Dubbing
  // ==================================================================

  /**
   * Create a dubbing project (video/audio translation).
   */
  async createDubbing(params: DubbingCreateParams): Promise<DubbingCreateResponse> {
    const { file, filename, ...rest } = params;
    return this.request<DubbingCreateResponse>({
      method: 'POST',
      path: `${PREFIX}/dubbing`,
      body: rest,
    });
  }

  /**
   * Get the status of a dubbing project.
   */
  async getDubbingStatus(dubbingId: string): Promise<DubbingStatusResponse> {
    return this.request<DubbingStatusResponse>({
      method: 'GET',
      path: `${PREFIX}/dubbing/${encodeURIComponent(dubbingId)}`,
    });
  }

  /**
   * Get the dubbed audio for a specific language.
   */
  async getDubbingAudio(dubbingId: string, language: string): Promise<AudioResponse> {
    return this.rawAudioRequest(
      'GET',
      `${PREFIX}/dubbing/${encodeURIComponent(dubbingId)}/audio/${encodeURIComponent(language)}`,
    );
  }

  /**
   * Delete a dubbing project.
   */
  async deleteDubbing(dubbingId: string): Promise<void> {
    await this.request<Record<string, never>>({
      method: 'DELETE',
      path: `${PREFIX}/dubbing/${encodeURIComponent(dubbingId)}`,
    });
  }

  // ==================================================================
  // Private helpers
  // ==================================================================

  /**
   * Make a request that returns raw audio bytes.
   * Falls back to the JSON request path and expects the server
   * to return audio data.
   */
  private async rawAudioRequest(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<AudioResponse> {
    // Use the standard request - the API controller handles returning audio
    // The proxy returns { audio: base64, contentType } for non-streaming endpoints
    return this.request<AudioResponse>({
      method,
      path,
      body: body || undefined,
    });
  }

  /**
   * Make a multipart audio request.
   */
  private async multipartAudioRequest(
    path: string,
    audio: Blob | Buffer,
    filename?: string,
  ): Promise<AudioResponse> {
    let base64Data: string;
    if (audio instanceof Blob) {
      const arrayBuffer = await audio.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      base64Data = this.uint8ArrayToBase64(bytes);
    } else {
      base64Data = (audio as Buffer).toString('base64');
    }

    return this.request<AudioResponse>({
      method: 'POST',
      path,
      body: {
        audio: base64Data,
        filename: filename || 'audio.wav',
      },
    });
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }
    // Browser fallback
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
  }
}
