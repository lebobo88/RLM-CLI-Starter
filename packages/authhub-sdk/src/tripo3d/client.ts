/**
 * Tripo3D SDK Client Module
 *
 * Provides typed methods for all Tripo3D 3D model generation tasks,
 * file upload, balance checking, and task polling.
 *
 * @task TASK-717
 * @feature FTR-156
 */

import type {
  TripoTaskStatusResponse,
  TripoCreateTaskResponse,
  TripoUploadResponse,
  TripoBalance,
  TripoApiStatus,
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
  WaitForTaskOptions,
} from './types';

/**
 * Request function type matching the AuthHubClient.request signature.
 * Modules receive this bound function from the parent client.
 */
type RequestFn = <T>(options: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
}) => Promise<T>;

/**
 * Configuration for the Tripo3D module.
 */
export interface TripoModuleConfig {
  request: RequestFn;
}

/**
 * Tripo3D module for 3D model generation and management.
 *
 * Supports all 14 Tripo3D task types with typed parameters,
 * task polling, file upload, and balance/status checks.
 *
 * @example
 * ```typescript
 * // Text to 3D model
 * const task = await client.tripo3d.textToModel({
 *   prompt: 'A medieval sword with glowing runes',
 *   model_version: 'default',
 * });
 *
 * // Wait for completion
 * const result = await client.tripo3d.waitForTask(task.task_id);
 * console.log(result.output?.model?.url);
 * ```
 */
export class TripoModule {
  private readonly request: RequestFn;

  /**
   * Creates a new Tripo3D module instance.
   * @internal
   */
  constructor(config: TripoModuleConfig) {
    this.request = config.request;
  }

  // ---- Generic task creation ----

  /**
   * Create a Tripo3D task with a discriminated union of parameters.
   *
   * Prefer the typed convenience methods (textToModel, imageToModel, etc.)
   * for better type safety. Use this method when working with dynamic task types.
   *
   * @param params - Task creation parameters with discriminated `type` field
   * @returns Created task with task_id
   */
  async createTask(params: CreateTaskParams): Promise<TripoCreateTaskResponse> {
    return this.request<TripoCreateTaskResponse>({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: params,
    });
  }

  /**
   * Get the current status of a Tripo3D task.
   *
   * @param taskId - The task ID returned from createTask
   * @returns Task status including progress and output URLs
   */
  async getTask(taskId: string): Promise<TripoTaskStatusResponse> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId must be a non-empty string');
    }

    return this.request<TripoTaskStatusResponse>({
      method: 'GET',
      path: `/api/v1/tripo3d/tasks/${encodeURIComponent(taskId)}`,
    });
  }

  // ---- Wait for task completion with polling ----

  /**
   * Poll a task until it reaches a terminal state (success, failed, cancelled).
   *
   * @param taskId - The task ID to poll
   * @param options - Polling configuration (interval, timeout)
   * @returns Final task status
   * @throws {Error} If the task times out
   *
   * @example
   * ```typescript
   * const task = await client.tripo3d.textToModel({ prompt: 'A red car' });
   * const result = await client.tripo3d.waitForTask(task.task_id, {
   *   pollingInterval: 5000,
   *   timeout: 300_000,
   * });
   *
   * if (result.status === 'success') {
   *   console.log('Model URL:', result.output?.model?.url);
   * }
   * ```
   */
  async waitForTask(
    taskId: string,
    options?: WaitForTaskOptions,
  ): Promise<TripoTaskStatusResponse> {
    const interval = options?.pollingInterval ?? 3000;
    const timeout = options?.timeout ?? 600_000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const status = await this.getTask(taskId);

      if (
        status.status === 'success' ||
        status.status === 'failed' ||
        status.status === 'cancelled'
      ) {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`Task ${taskId} timed out after ${timeout}ms`);
  }

  // ---- 14 typed task methods ----

  /**
   * Generate a 3D model from a text prompt.
   *
   * @param params - Text prompt and optional generation settings
   * @returns Created task with task_id
   */
  async textToModel(params: TextToModelParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'text_to_model', ...params });
  }

  /**
   * Generate a 3D model from a single image.
   *
   * @param params - Image file reference and optional settings
   * @returns Created task with task_id
   */
  async imageToModel(params: ImageToModelParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'image_to_model', ...params });
  }

  /**
   * Generate a 3D model from multiple view images.
   *
   * @param params - Array of image file references
   * @returns Created task with task_id
   */
  async multiviewToModel(params: MultiviewToModelParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'multiview_to_model', ...params });
  }

  /**
   * Refine a previously generated model for higher quality.
   *
   * @param params - Reference to the draft model task
   * @returns Created task with task_id
   */
  async refineModel(params: RefineModelParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'refine_model', ...params });
  }

  /**
   * Refine a draft model (lighter refinement pass).
   *
   * @param params - Reference to the draft model task
   * @returns Created task with task_id
   */
  async refineDraft(params: RefineDraftParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'refine_draft', ...params });
  }

  /**
   * Apply or regenerate textures on an existing model.
   *
   * @param params - Reference to the original model task
   * @returns Created task with task_id
   */
  async textureModel(params: TextureModelParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'texture_model', ...params });
  }

  /**
   * Segment a mesh into semantic parts.
   *
   * @param params - Reference to the original model task
   * @returns Created task with task_id
   */
  async meshSegmentation(params: MeshSegmentationParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'mesh_segmentation', ...params });
  }

  /**
   * Complete or fill holes in a mesh.
   *
   * @param params - Reference to the original model task and filling strategy
   * @returns Created task with task_id
   */
  async meshCompletion(params: MeshCompletionParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'mesh_completion', ...params });
  }

  /**
   * Create a smart low-poly version of a model.
   *
   * @param params - Reference to the original model task and optional face limit
   * @returns Created task with task_id
   */
  async smartLowpoly(params: SmartLowpolyParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'smart_lowpoly', ...params });
  }

  /**
   * Check if a model is suitable for rigging.
   *
   * @param params - Reference to the original model task
   * @returns Created task with task_id
   */
  async checkRiggable(params: CheckRiggableParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'check_riggable', ...params });
  }

  /**
   * Rig a model for animation.
   *
   * @param params - Reference to the original model task and rig type
   * @returns Created task with task_id
   */
  async animateRig(params: AnimateRigParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'animate_rig', ...params });
  }

  /**
   * Retarget an animation onto a rigged model.
   *
   * @param params - Reference to the original model task and animation identifier
   * @returns Created task with task_id
   */
  async animateRetarget(params: AnimateRetargetParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'animate_retarget', ...params });
  }

  /**
   * Apply a visual style to a model.
   *
   * @param params - Reference to the original model task and style identifier
   * @returns Created task with task_id
   */
  async stylizeModel(params: StylizeModelParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'stylize_model', ...params });
  }

  /**
   * Convert a model to a different output format.
   *
   * @param params - Reference to the original model task and target format
   * @returns Created task with task_id
   */
  async convertModel(params: ConvertModelParams): Promise<TripoCreateTaskResponse> {
    return this.createTask({ type: 'convert_model', ...params });
  }

  // ---- File upload ----

  /**
   * Upload a file (image) for use with imageToModel or multiviewToModel.
   *
   * Note: This endpoint uses multipart/form-data. The request is sent
   * with a Content-Type override header to signal the API proxy to handle
   * the upload correctly.
   *
   * @param file - File data as Blob or Buffer
   * @param filename - Original filename with extension
   * @returns Upload response with image_token for use in task creation
   */
  async uploadFile(file: Blob | Buffer, filename: string): Promise<TripoUploadResponse> {
    if (!filename || typeof filename !== 'string') {
      throw new Error('filename must be a non-empty string');
    }

    // For file uploads, we send as base64 through the JSON API
    // since the request function only supports JSON bodies.
    // The API server handles base64 decoding and forwards to Tripo3D.
    let base64Data: string;

    if (file instanceof Blob) {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      base64Data = this.uint8ArrayToBase64(bytes);
    } else {
      // Buffer (Node.js)
      base64Data = (file as Buffer).toString('base64');
    }

    return this.request<TripoUploadResponse>({
      method: 'POST',
      path: '/api/v1/tripo3d/upload',
      body: {
        file: base64Data,
        filename,
      },
    });
  }

  // ---- Balance ----

  /**
   * Get the current Tripo3D account balance.
   *
   * @returns Balance information including available and frozen credits
   */
  async getBalance(): Promise<TripoBalance> {
    return this.request<TripoBalance>({
      method: 'GET',
      path: '/api/v1/tripo3d/balance',
    });
  }

  // ---- Status ----

  /**
   * Get the current Tripo3D API operational status.
   *
   * @returns API status with component health and active incidents
   */
  async getApiStatus(): Promise<TripoApiStatus> {
    return this.request<TripoApiStatus>({
      method: 'GET',
      path: '/api/v1/tripo3d/status',
    });
  }

  // ---- Private helpers ----

  /**
   * Convert a Uint8Array to a base64 string.
   * Works in both browser and Node.js environments.
   * @internal
   */
  private uint8ArrayToBase64(bytes: Uint8Array): string {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }

    // Browser fallback
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
