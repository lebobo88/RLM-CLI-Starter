/**
 * Tripo3D SDK Types
 *
 * Client-side type definitions for Tripo3D 3D model generation.
 * These types define what SDK consumers need when interacting
 * with the Tripo3D integration through AuthHub.
 *
 * @task TASK-716
 * @feature FTR-156
 */

// ---- String literal unions ----

export type TripoTaskType =
  | 'text_to_model'
  | 'image_to_model'
  | 'multiview_to_model'
  | 'refine_model'
  | 'refine_draft'
  | 'texture_model'
  | 'mesh_segmentation'
  | 'mesh_completion'
  | 'smart_lowpoly'
  | 'check_riggable'
  | 'animate_rig'
  | 'animate_retarget'
  | 'stylize_model'
  | 'convert_model';

export type TripoTaskStatus =
  | 'queued'
  | 'running'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'unknown';

export type TripoModelVersion =
  | 'v2.0-20240919'
  | 'v2.5-20250123'
  | 'v3.0-20250812'
  | 'default';

export type TripoOutputFormat = 'glb' | 'fbx' | 'usdz' | 'obj' | 'stl';

/** Flexible string type for style identifiers */
export type TripoStyle = string;

// ---- File reference ----

export interface TripoFileRef {
  type: string;
  file_token: string;
}

// ---- Common params ----

export interface TripoCommonParams {
  model_version?: TripoModelVersion;
  output_format?: TripoOutputFormat;
  texture?: boolean;
  pbr?: boolean;
  pivot_to_center?: boolean;
  face_limit?: number;
}

// ---- Per-task params (14 task types) ----

export interface TextToModelParams extends TripoCommonParams {
  prompt: string;
  negative_prompt?: string;
  style?: TripoStyle;
  seed?: number;
}

export interface ImageToModelParams extends TripoCommonParams {
  file: TripoFileRef;
  style?: TripoStyle;
  seed?: number;
}

export interface MultiviewToModelParams extends TripoCommonParams {
  files: TripoFileRef[];
}

export interface RefineModelParams {
  draft_model_task_id: string;
}

export interface RefineDraftParams {
  draft_model_task_id: string;
}

export interface TextureModelParams {
  original_model_task_id: string;
}

export interface MeshSegmentationParams {
  original_model_task_id: string;
}

export interface MeshCompletionParams {
  original_model_task_id: string;
  filling: string;
}

export interface SmartLowpolyParams {
  original_model_task_id: string;
  face_limit?: number;
}

export interface CheckRiggableParams {
  original_model_task_id: string;
}

export interface AnimateRigParams {
  original_model_task_id: string;
  rig_type?: 'biped' | 'quadruped';
}

export interface AnimateRetargetParams {
  original_model_task_id: string;
  animation: string;
}

export interface StylizeModelParams {
  original_model_task_id: string;
  style: string;
}

export interface ConvertModelParams {
  original_model_task_id: string;
  format: TripoOutputFormat;
}

// ---- Discriminated union for createTask ----

export type CreateTaskParams =
  | ({ type: 'text_to_model' } & TextToModelParams)
  | ({ type: 'image_to_model' } & ImageToModelParams)
  | ({ type: 'multiview_to_model' } & MultiviewToModelParams)
  | ({ type: 'refine_model' } & RefineModelParams)
  | ({ type: 'refine_draft' } & RefineDraftParams)
  | ({ type: 'texture_model' } & TextureModelParams)
  | ({ type: 'mesh_segmentation' } & MeshSegmentationParams)
  | ({ type: 'mesh_completion' } & MeshCompletionParams)
  | ({ type: 'smart_lowpoly' } & SmartLowpolyParams)
  | ({ type: 'check_riggable' } & CheckRiggableParams)
  | ({ type: 'animate_rig' } & AnimateRigParams)
  | ({ type: 'animate_retarget' } & AnimateRetargetParams)
  | ({ type: 'stylize_model' } & StylizeModelParams)
  | ({ type: 'convert_model' } & ConvertModelParams);

// ---- Response types ----

export interface TripoTaskOutput {
  model?: { type: string; url: string };
  rendered_image?: { type: string; url: string };
  pbr_model?: { type: string; url: string };
}

export interface TripoTaskStatusResponse {
  task_id: string;
  type: TripoTaskType;
  status: TripoTaskStatus;
  progress: number;
  input: Record<string, unknown>;
  output?: TripoTaskOutput;
  create_time: number;
}

export interface TripoCreateTaskResponse {
  task_id: string;
}

export interface TripoUploadResponse {
  image_token: string;
}

export interface TripoBalance {
  balance: number;
  frozen: number;
}

export interface TripoApiStatus {
  indicator: 'none' | 'minor' | 'major' | 'critical';
  description: string;
  components: Array<{ name: string; status: string }>;
  incidents: Array<{ name: string; status: string; created_at: string }>;
  lastChecked: string;
}

// ---- Wait options ----

export interface WaitForTaskOptions {
  /** Polling interval in ms (default: 3000) */
  pollingInterval?: number;
  /** Timeout in ms (default: 600000 = 10min) */
  timeout?: number;
}
