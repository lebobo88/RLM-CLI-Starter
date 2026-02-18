/**
 * AuthHub SDK
 *
 * TypeScript SDK for AuthHub - centralized authentication, database connectivity,
 * AI API proxy, and secrets management.
 *
 * @example
 * ```typescript
 * import { AuthHubClient } from '@authhub/sdk';
 *
 * const client = new AuthHubClient({
 *   baseUrl: 'https://authhub.example.com',
 *   apiKey: 'ak_your_api_key',
 * });
 *
 * // AI Chat
 * const response = await client.ai.chat({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 *
 * // Database Query
 * const users = await client.db.query('SELECT * FROM users WHERE active = $1', [true]);
 *
 * // Secrets
 * const apiKey = await client.secrets.get('STRIPE_API_KEY');
 * ```
 *
 * @module @authhub/sdk
 */

// Export types
export type {
  AuthHubClientConfig,
  DebugClientConfig,
  ChatRole,
  ChatMessage,
  ChatCompletionOptions,
  ChatChoice,
  ChatUsage,
  ChatCompletionResponse,
  ChatStreamChunk,
  QueryResult,
  TransactionContext,
  ApiErrorResponse,
  // AI types
  AuthHubMetadata,
  AIModel,
  ListModelsResponse,
  ListModelsOptions,
  AIUsageStats,
  GetUsageOptions,
  // Modality types (OpenRouter-aligned)
  InputModality,
  OutputModality,
  ModelArchitecture,
  // Image generation types (FTR-112)
  ImageSize,
  ImageAspectRatio,
  ImageQuality,
  ImageStyle,
  ImageResponseFormat,
  ImageOutputFormat,
  ImageBackground,
  ImageModeration,
  ImageFidelity,
  PersonGeneration,
  DiffusionScheduler,
  ImageStylePreset,
  ImageGenerationOptions,
  ImageData,
  ThoughtStep,
  ImageGenerationResponse,
  // Embedding types (FTR-113)
  EmbeddingEncodingFormat,
  EmbeddingOptions,
  EmbeddingData,
  EmbeddingResponse,
  // Transcription types (FTR-114)
  TranscriptionResponseFormat,
  TranscriptionFileInput,
  TranscriptionOptions,
  TranscriptionWord,
  TranscriptionSegment,
  TranscriptionResponse,
  // Text-to-speech types (FTR-115)
  SpeechVoice,
  SpeechAudioFormat,
  SpeechOptions,
} from './types';

// Export auth types
export type {
  AuthMode,
  StorageType,
  AuthModuleConfig,
  StoredTokenData,
  TokenStorage,
  AuthUser,
  AuthState,
  LoginResult,
  RegisterResult,
  RefreshResult,
  PasswordResetResult,
  LoginCredentials,
  RegisterData,
  RedirectLoginOptions,
  AuthModule,
  AuthErrorCode,
  OAuthCallbackParams,
  TokenExchangeRequest,
  TokenResponse,
} from './auth';

// Export auth error class
export { AuthenticationError } from './auth';

// Export storage implementations
export {
  LocalStorageTokenStorage,
  SessionStorageTokenStorage,
  MemoryTokenStorage,
  createTokenStorage,
  isTokenExpired,
  getTokenExpiresIn,
  createStoredTokenData,
} from './auth';

// Export storage types
export type { StorageStrategyType } from './auth';

// Export auth client
export { AuthClient, createAuthClient } from './auth';

// Export auth client types
export type { AuthClientConfig } from './auth';

// React components and hooks (AuthProvider, useAuth, useAuthHubAuth, etc.)
// are NOT re-exported here to avoid pulling React into server bundles.
// Import from '@authhub/sdk/auth/react' or use the auth barrel directly.

// Export OAuth URL generators and callback parsing
export {
  OAuthProvider,
  getGoogleAuthUrl,
  getGitHubAuthUrl,
  getOAuthUrl,
  parseOAuthCallbackResult,
  hasOAuthCallback,
  hasOAuthError,
  getOAuthError,
} from './auth';

// Export OAuth types
export type {
  OAuthUrlOptions,
  OAuthCallbackResult,
} from './auth';

// Export client
export { AuthHubClient } from './client';

// Export modules
export { AIModule } from './ai';
export { DBModule } from './db';
export { SecretsModule } from './secrets';

// Export errors
export {
  AuthHubError,
  AuthError,
  RateLimitError,
  ValidationError,
  NetworkError,
  ServerError,
  NotFoundError,
  // AI-specific errors
  AIError,
} from './errors';

// Export error types
export type { AIErrorCode } from './errors';

// Debug module
export { DebugModule } from './debug/index';
export type {
  DebugModuleConfig,
  CaptureOptions,
  CaptureResult,
  CaptureEvent,
  UserContext,
  CaptureStrategyName,
  Breadcrumb,
  BreadcrumbType,
  BreadcrumbLevel,
  BreadcrumbConfig,
} from './debug/types';

export type {
  CaptureStrategy,
  SemanticDOMCapture,
  SyntheticScreenshotCapture,
  AOMTreeCapture,
  ASTCapture,
} from './debug/strategies/index';

// ElevenLabs module
export { ElevenLabsModule } from './elevenlabs/index';
export type { ElevenLabsModuleConfig } from './elevenlabs/index';
export type {
  VoiceSettings as ElevenLabsVoiceSettings,
  PronunciationDictLocator,
  SoundGenerationParams,
  AudioIsolationParams,
  SpeechToSpeechParams,
  ElevenLabsVoice,
  VoiceListResponse as ElevenLabsVoiceListResponse,
  CreateVoiceParams,
  UpdateVoiceParams,
  DefaultVoiceSettings as ElevenLabsDefaultVoiceSettings,
  FindSimilarVoicesParams,
  SharedVoicesParams,
  MusicSection,
  MusicGenerationParams,
  MusicPlanParams,
  MusicPlanResponse,
  StemSeparationParams,
  DialogueInput,
  DialogueParams,
  VoiceDesignPreviewParams,
  VoiceDesignPreviewResponse,
  VoiceDesignCreateParams,
  VoiceDesignCreateResponse,
  HistoryItem as ElevenLabsHistoryItem,
  HistoryListParams,
  HistoryListResponse as ElevenLabsHistoryListResponse,
  ForcedAlignmentParams,
  ForcedAlignmentResponse,
  DubbingCreateParams,
  DubbingCreateResponse,
  DubbingStatusResponse,
  AudioResponse as ElevenLabsAudioResponse,
} from './elevenlabs/types';

// Tripo3D module
export { TripoModule } from './tripo3d/index';
export type {
  TripoModuleConfig,
} from './tripo3d/index';
export type {
  TripoTaskType,
  TripoTaskStatus,
  TripoModelVersion,
  TripoOutputFormat,
  TripoStyle,
  TripoFileRef,
  TripoCommonParams,
  TextToModelParams,
  ImageToModelParams,
  MultiviewToModelParams,
  RefineModelParams,
  RefineDraftParams,
  TextureModelParams,
  MeshSegmentationParams,
  MeshCompletionParams,
  SmartLowpolyParams,
  CheckRiggableParams,
  AnimateRigParams,
  AnimateRetargetParams,
  StylizeModelParams,
  ConvertModelParams,
  CreateTaskParams,
  TripoTaskOutput,
  TripoTaskStatusResponse,
  TripoCreateTaskResponse,
  TripoUploadResponse,
  TripoBalance,
  TripoApiStatus,
  WaitForTaskOptions,
} from './tripo3d/types';

// Export version
export { SDK_VERSION, SDK_CLIENT } from './version';
