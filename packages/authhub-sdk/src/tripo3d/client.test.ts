/**
 * Tests for TripoModule (Tripo3D SDK Client)
 * @task TASK-724
 * @feature FTR-156
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripoModule } from './client';
import type {
  TripoCreateTaskResponse,
  TripoTaskStatusResponse,
  TripoUploadResponse,
  TripoBalance,
  TripoApiStatus,
} from './types';

// =========================================================================
// Setup
// =========================================================================

const mockRequest = vi.fn();
let tripo: TripoModule;

beforeEach(() => {
  mockRequest.mockReset();
  tripo = new TripoModule({ request: mockRequest });
});

// =========================================================================
// Helpers
// =========================================================================

const taskCreatedResponse: TripoCreateTaskResponse = { task_id: 'task-abc-123' };

function makeStatusResponse(
  overrides: Partial<TripoTaskStatusResponse> = {},
): TripoTaskStatusResponse {
  return {
    task_id: 'task-abc-123',
    type: 'text_to_model',
    status: 'running',
    progress: 50,
    input: {},
    create_time: Date.now(),
    ...overrides,
  };
}

// =========================================================================
// createTask - generic
// =========================================================================
describe('createTask', () => {
  it('should send POST to /api/v1/tripo3d/tasks with the params body', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    const params = { type: 'text_to_model' as const, prompt: 'a sword' };
    const result = await tripo.createTask(params);

    expect(result).toEqual(taskCreatedResponse);
    expect(mockRequest).toHaveBeenCalledOnce();
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: params,
    });
  });

  it('should propagate API errors from the request function', async () => {
    mockRequest.mockRejectedValue(new Error('API Error: 500'));

    await expect(
      tripo.createTask({ type: 'text_to_model', prompt: 'test' }),
    ).rejects.toThrow('API Error: 500');
  });

  it('should forward all params including optional fields', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    const params = {
      type: 'text_to_model' as const,
      prompt: 'a dragon',
      negative_prompt: 'ugly',
      model_version: 'default' as const,
      output_format: 'glb' as const,
      texture: true,
      pbr: true,
      seed: 42,
    };
    await tripo.createTask(params);

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: params,
    });
  });
});

// =========================================================================
// getTask
// =========================================================================
describe('getTask', () => {
  it('should send GET to /api/v1/tripo3d/tasks/:taskId', async () => {
    const statusResponse = makeStatusResponse({ status: 'success', progress: 100 });
    mockRequest.mockResolvedValue(statusResponse);

    const result = await tripo.getTask('task-abc-123');

    expect(result).toEqual(statusResponse);
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/v1/tripo3d/tasks/task-abc-123',
    });
  });

  it('should URL-encode the taskId', async () => {
    mockRequest.mockResolvedValue(makeStatusResponse());

    await tripo.getTask('task/with special&chars');

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/v1/tripo3d/tasks/task%2Fwith%20special%26chars',
    });
  });

  it('should throw if taskId is empty', async () => {
    await expect(tripo.getTask('')).rejects.toThrow('taskId must be a non-empty string');
  });
});

// =========================================================================
// waitForTask
// =========================================================================
describe('waitForTask', () => {
  it('should poll until status is success', async () => {
    mockRequest
      .mockResolvedValueOnce(makeStatusResponse({ status: 'running', progress: 30 }))
      .mockResolvedValueOnce(makeStatusResponse({ status: 'running', progress: 70 }))
      .mockResolvedValueOnce(makeStatusResponse({ status: 'success', progress: 100 }));

    const result = await tripo.waitForTask('task-abc-123', {
      pollingInterval: 10,
      timeout: 5000,
    });

    expect(result.status).toBe('success');
    expect(result.progress).toBe(100);
    expect(mockRequest).toHaveBeenCalledTimes(3);
  });

  it('should return immediately when task already in terminal state', async () => {
    mockRequest.mockResolvedValueOnce(
      makeStatusResponse({ status: 'failed', progress: 0 }),
    );

    const result = await tripo.waitForTask('task-abc-123', {
      pollingInterval: 10,
      timeout: 5000,
    });

    expect(result.status).toBe('failed');
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('should return on cancelled status', async () => {
    mockRequest.mockResolvedValueOnce(
      makeStatusResponse({ status: 'cancelled', progress: 20 }),
    );

    const result = await tripo.waitForTask('task-abc-123', {
      pollingInterval: 10,
      timeout: 5000,
    });

    expect(result.status).toBe('cancelled');
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('should throw on timeout', async () => {
    // Always return running, never complete
    mockRequest.mockResolvedValue(
      makeStatusResponse({ status: 'running', progress: 10 }),
    );

    await expect(
      tripo.waitForTask('task-abc-123', { pollingInterval: 10, timeout: 50 }),
    ).rejects.toThrow('Task task-abc-123 timed out after 50ms');
  });

  it('should use default options when none provided', async () => {
    // Return success immediately so we do not actually wait 10 minutes
    mockRequest.mockResolvedValueOnce(
      makeStatusResponse({ status: 'success', progress: 100 }),
    );

    const result = await tripo.waitForTask('task-abc-123');
    expect(result.status).toBe('success');
  });
});

// =========================================================================
// 14 Typed task methods
// =========================================================================
describe('textToModel', () => {
  it('should call createTask with type text_to_model and spread params', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    const result = await tripo.textToModel({ prompt: 'a medieval castle' });

    expect(result.task_id).toBe('task-abc-123');
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: { type: 'text_to_model', prompt: 'a medieval castle' },
    });
  });
});

describe('imageToModel', () => {
  it('should call createTask with type image_to_model', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.imageToModel({
      file: { type: 'image/png', file_token: 'tok-img-001' },
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: {
        type: 'image_to_model',
        file: { type: 'image/png', file_token: 'tok-img-001' },
      },
    });
  });
});

describe('multiviewToModel', () => {
  it('should call createTask with type multiview_to_model', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    const files = [
      { type: 'image/png', file_token: 'tok-1' },
      { type: 'image/png', file_token: 'tok-2' },
    ];
    await tripo.multiviewToModel({ files });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: { type: 'multiview_to_model', files },
    });
  });
});

describe('refineModel', () => {
  it('should call createTask with type refine_model', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.refineModel({ draft_model_task_id: 'draft-001' });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: { type: 'refine_model', draft_model_task_id: 'draft-001' },
    });
  });
});

describe('refineDraft', () => {
  it('should call createTask with type refine_draft', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.refineDraft({ draft_model_task_id: 'draft-002' });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: { type: 'refine_draft', draft_model_task_id: 'draft-002' },
    });
  });
});

describe('textureModel', () => {
  it('should call createTask with type texture_model', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.textureModel({ original_model_task_id: 'model-001' });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: { type: 'texture_model', original_model_task_id: 'model-001' },
    });
  });
});

describe('meshSegmentation', () => {
  it('should call createTask with type mesh_segmentation', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.meshSegmentation({ original_model_task_id: 'model-002' });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: { type: 'mesh_segmentation', original_model_task_id: 'model-002' },
    });
  });
});

describe('meshCompletion', () => {
  it('should call createTask with type mesh_completion', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.meshCompletion({
      original_model_task_id: 'model-003',
      filling: 'smooth',
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: {
        type: 'mesh_completion',
        original_model_task_id: 'model-003',
        filling: 'smooth',
      },
    });
  });
});

describe('smartLowpoly', () => {
  it('should call createTask with type smart_lowpoly', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.smartLowpoly({
      original_model_task_id: 'model-004',
      face_limit: 5000,
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: {
        type: 'smart_lowpoly',
        original_model_task_id: 'model-004',
        face_limit: 5000,
      },
    });
  });
});

describe('checkRiggable', () => {
  it('should call createTask with type check_riggable', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.checkRiggable({ original_model_task_id: 'model-005' });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: { type: 'check_riggable', original_model_task_id: 'model-005' },
    });
  });
});

describe('animateRig', () => {
  it('should call createTask with type animate_rig', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.animateRig({
      original_model_task_id: 'model-006',
      rig_type: 'biped',
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: {
        type: 'animate_rig',
        original_model_task_id: 'model-006',
        rig_type: 'biped',
      },
    });
  });
});

describe('animateRetarget', () => {
  it('should call createTask with type animate_retarget', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.animateRetarget({
      original_model_task_id: 'model-007',
      animation: 'walk_cycle',
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: {
        type: 'animate_retarget',
        original_model_task_id: 'model-007',
        animation: 'walk_cycle',
      },
    });
  });
});

describe('stylizeModel', () => {
  it('should call createTask with type stylize_model', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.stylizeModel({
      original_model_task_id: 'model-008',
      style: 'voxel',
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: {
        type: 'stylize_model',
        original_model_task_id: 'model-008',
        style: 'voxel',
      },
    });
  });
});

describe('convertModel', () => {
  it('should call createTask with type convert_model', async () => {
    mockRequest.mockResolvedValue(taskCreatedResponse);

    await tripo.convertModel({
      original_model_task_id: 'model-009',
      format: 'fbx',
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/tasks',
      body: {
        type: 'convert_model',
        original_model_task_id: 'model-009',
        format: 'fbx',
      },
    });
  });
});

// =========================================================================
// uploadFile
// =========================================================================
describe('uploadFile', () => {
  const uploadResponse: TripoUploadResponse = { image_token: 'img-tok-abc' };

  it('should send POST to /api/v1/tripo3d/upload with base64 data from Buffer', async () => {
    mockRequest.mockResolvedValue(uploadResponse);

    const fileBuffer = Buffer.from('fake-image-data');
    const result = await tripo.uploadFile(fileBuffer, 'photo.png');

    expect(result).toEqual(uploadResponse);
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/tripo3d/upload',
      body: {
        file: fileBuffer.toString('base64'),
        filename: 'photo.png',
      },
    });
  });

  it('should send POST with base64 data from Blob', async () => {
    mockRequest.mockResolvedValue(uploadResponse);

    const blobContent = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const blob = new Blob([blobContent], { type: 'image/png' });

    await tripo.uploadFile(blob, 'image.png');

    expect(mockRequest).toHaveBeenCalledOnce();
    const callArgs = mockRequest.mock.calls[0][0];
    expect(callArgs.method).toBe('POST');
    expect(callArgs.path).toBe('/api/v1/tripo3d/upload');
    expect(callArgs.body.filename).toBe('image.png');
    // Verify base64 is a string (exact value depends on encoding)
    expect(typeof callArgs.body.file).toBe('string');
    expect(callArgs.body.file.length).toBeGreaterThan(0);
  });

  it('should throw if filename is empty', async () => {
    const fileBuffer = Buffer.from('data');
    await expect(tripo.uploadFile(fileBuffer, '')).rejects.toThrow(
      'filename must be a non-empty string',
    );
  });
});

// =========================================================================
// getBalance
// =========================================================================
describe('getBalance', () => {
  it('should send GET to /api/v1/tripo3d/balance and return balance', async () => {
    const balanceResponse: TripoBalance = { balance: 1500, frozen: 200 };
    mockRequest.mockResolvedValue(balanceResponse);

    const result = await tripo.getBalance();

    expect(result).toEqual(balanceResponse);
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/v1/tripo3d/balance',
    });
  });

  it('should propagate errors from the request function', async () => {
    mockRequest.mockRejectedValue(new Error('Unauthorized'));

    await expect(tripo.getBalance()).rejects.toThrow('Unauthorized');
  });
});

// =========================================================================
// getApiStatus
// =========================================================================
describe('getApiStatus', () => {
  it('should send GET to /api/v1/tripo3d/status and return status', async () => {
    const statusResponse: TripoApiStatus = {
      indicator: 'none',
      description: 'All Systems Operational',
      components: [{ name: 'API', status: 'operational' }],
      incidents: [],
      lastChecked: '2026-02-09T00:00:00Z',
    };
    mockRequest.mockResolvedValue(statusResponse);

    const result = await tripo.getApiStatus();

    expect(result).toEqual(statusResponse);
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'GET',
      path: '/api/v1/tripo3d/status',
    });
  });

  it('should propagate errors from the request function', async () => {
    mockRequest.mockRejectedValue(new Error('Service Unavailable'));

    await expect(tripo.getApiStatus()).rejects.toThrow('Service Unavailable');
  });
});

// =========================================================================
// Lazy initialization (via parent client pattern)
// =========================================================================
describe('lazy initialization', () => {
  it('should construct with a request function and be ready to use', async () => {
    const localRequest = vi.fn().mockResolvedValue(taskCreatedResponse);
    const module = new TripoModule({ request: localRequest });

    const result = await module.textToModel({ prompt: 'test init' });
    expect(result.task_id).toBe('task-abc-123');
    expect(localRequest).toHaveBeenCalledOnce();
  });

  it('should use the same request function across multiple calls', async () => {
    const localRequest = vi.fn().mockResolvedValue(taskCreatedResponse);
    const module = new TripoModule({ request: localRequest });

    await module.textToModel({ prompt: 'call one' });
    await module.textToModel({ prompt: 'call two' });

    expect(localRequest).toHaveBeenCalledTimes(2);
    // Both calls should go through the same request fn
    expect(localRequest.mock.calls[0][0].body.prompt).toBe('call one');
    expect(localRequest.mock.calls[1][0].body.prompt).toBe('call two');
  });
});

// =========================================================================
// Error handling
// =========================================================================
describe('error handling', () => {
  it('should propagate network errors from createTask', async () => {
    mockRequest.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(
      tripo.textToModel({ prompt: 'test' }),
    ).rejects.toThrow('Failed to fetch');
  });

  it('should propagate structured API errors', async () => {
    const apiError = new Error('Bad Request: invalid prompt');
    (apiError as any).status = 400;
    mockRequest.mockRejectedValue(apiError);

    await expect(
      tripo.textToModel({ prompt: '' }),
    ).rejects.toThrow('Bad Request: invalid prompt');
  });

  it('should propagate errors from getTask', async () => {
    mockRequest.mockRejectedValue(new Error('Task not found'));

    await expect(tripo.getTask('nonexistent')).rejects.toThrow('Task not found');
  });

  it('should propagate errors from waitForTask during polling', async () => {
    mockRequest
      .mockResolvedValueOnce(makeStatusResponse({ status: 'running', progress: 50 }))
      .mockRejectedValueOnce(new Error('Connection reset'));

    await expect(
      tripo.waitForTask('task-abc-123', { pollingInterval: 10, timeout: 5000 }),
    ).rejects.toThrow('Connection reset');
  });

  it('should throw validation error for non-string taskId in getTask', async () => {
    // @ts-expect-error - Testing runtime validation with wrong type
    await expect(tripo.getTask(123)).rejects.toThrow(
      'taskId must be a non-empty string',
    );
  });
});
