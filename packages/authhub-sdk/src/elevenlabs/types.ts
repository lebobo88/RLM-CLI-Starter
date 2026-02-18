/**
 * ElevenLabs SDK Types
 *
 * Client-side type definitions for the ElevenLabs integration through AuthHub.
 *
 * @feature FTR-159
 */

// ---- Common ----

export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
}

export interface PronunciationDictLocator {
  pronunciation_dictionary_id: string;
  version_id: string;
}

// ---- Sound Generation ----

export interface SoundGenerationParams {
  text: string;
  duration_seconds?: number;
  prompt_influence?: number;
  loop?: boolean;
  output_format?: string;
}

// ---- Audio Isolation ----

export interface AudioIsolationParams {
  audio: Blob | Buffer;
  filename?: string;
}

// ---- Speech-to-Speech ----

export interface SpeechToSpeechParams {
  voice_id: string;
  audio: Blob | Buffer;
  filename?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  remove_background_noise?: boolean;
  seed?: number;
  output_format?: string;
}

// ---- Voice Management ----

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  labels?: Record<string, string>;
  preview_url?: string;
  settings?: VoiceSettings;
  sharing?: {
    status: string;
    history_item_sample_id?: string;
  };
}

export interface VoiceListResponse {
  voices: ElevenLabsVoice[];
}

export interface CreateVoiceParams {
  name: string;
  description?: string;
  labels?: Record<string, string>;
  files?: Array<Blob | Buffer>;
}

export interface UpdateVoiceParams {
  name?: string;
  description?: string;
  labels?: Record<string, string>;
}

export interface DefaultVoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface FindSimilarVoicesParams {
  audio: Blob | Buffer;
  filename?: string;
  similarity_threshold?: number;
  top_k?: number;
}

export interface SharedVoicesParams {
  page_size?: number;
  category?: string;
  gender?: string;
  age?: string;
  accent?: string;
  language?: string;
  search?: string;
  sort?: string;
  page?: number;
}

// ---- Music Generation ----

export interface MusicSection {
  lyrics?: string;
  style?: string;
  duration_ms?: number;
}

export interface MusicGenerationParams {
  prompt?: string;
  composition_plan?: {
    sections: MusicSection[];
  };
  music_length_ms?: number;
  force_instrumental?: boolean;
  output_format?: string;
}

export interface MusicPlanParams {
  prompt: string;
  music_length_ms?: number;
}

export interface MusicPlanResponse {
  sections: MusicSection[];
}

export interface StemSeparationParams {
  audio: Blob | Buffer;
  filename?: string;
}

// ---- Text-to-Dialogue ----

export interface DialogueInput {
  text: string;
  voice_id: string;
}

export interface DialogueParams {
  inputs: DialogueInput[];
  model_id?: string;
  language_code?: string;
  settings?: VoiceSettings;
  pronunciation_dictionary_locators?: PronunciationDictLocator[];
  seed?: number;
}

// ---- Voice Design ----

export interface VoiceDesignPreviewParams {
  text: string;
  voice_description: string;
  model_id?: string;
}

export interface VoiceDesignPreviewResponse {
  generated_voice_id: string;
}

export interface VoiceDesignCreateParams {
  generated_voice_id: string;
  voice_name: string;
  voice_description?: string;
  labels?: Record<string, string>;
}

export interface VoiceDesignCreateResponse {
  voice_id: string;
}

// ---- History ----

export interface HistoryItem {
  history_item_id: string;
  request_id?: string;
  voice_id: string;
  voice_name: string;
  text: string;
  date_unix: number;
  character_count_change_from: number;
  character_count_change_to: number;
  content_type: string;
  state: string;
  settings?: VoiceSettings;
  model_id?: string;
}

export interface HistoryListParams {
  page_size?: number;
  start_after_history_item_id?: string;
  voice_id?: string;
}

export interface HistoryListResponse {
  history: HistoryItem[];
  last_history_item_id?: string;
  has_more: boolean;
}

// ---- Forced Alignment ----

export interface ForcedAlignmentParams {
  audio: Blob | Buffer;
  filename?: string;
  text: string;
}

export interface ForcedAlignmentResponse {
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
}

// ---- Dubbing ----

export interface DubbingCreateParams {
  source_url?: string;
  source_lang: string;
  target_lang: string;
  num_speakers?: number;
  mode?: 'automatic' | 'manual';
  watermark?: boolean;
  name?: string;
  file?: Blob | Buffer;
  filename?: string;
}

export interface DubbingCreateResponse {
  dubbing_id: string;
  expected_duration_sec?: number;
}

export interface DubbingStatusResponse {
  dubbing_id: string;
  name?: string;
  status: 'dubbing' | 'dubbed' | 'failed';
  target_languages: string[];
  error?: string;
}

// ---- Audio Response ----

export interface AudioResponse {
  audio: ArrayBuffer;
  contentType: string;
}
