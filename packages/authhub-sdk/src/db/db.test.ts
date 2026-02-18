/**
 * AuthHub Database Module Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthHubClient } from '../client';

describe('DBModule', () => {
  let client: AuthHubClient;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    client = new AuthHubClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'ak_test_key',
      retries: 1,
    });

    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('query', () => {
    it('should return rows correctly', async () => {
      const mockResponse = {
        rows: [
          { id: 1, name: 'Alice', email: 'alice@example.com' },
          { id: 2, name: 'Bob', email: 'bob@example.com' },
        ],
        rowCount: 2,
      };

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      interface User {
        id: number;
        name: string;
        email: string;
      }

      const result = await client.db.query<User>(
        'SELECT * FROM users WHERE active = $1',
        [true]
      );

      expect(result.rows).toHaveLength(2);
      expect(result.rowCount).toBe(2);
      expect(result.rows[0]?.name).toBe('Alice');
    });

    it('should handle empty result', async () => {
      const mockResponse = {
        rows: [],
        rowCount: 0,
      };

      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await client.db.query(
        'SELECT * FROM users WHERE id = $1',
        [999]
      );

      expect(result.rows).toHaveLength(0);
      expect(result.rowCount).toBe(0);
    });

    it('should send correct request body', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ rows: [], rowCount: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await client.db.query(
        'SELECT * FROM users WHERE id = $1 AND active = $2',
        [42, true]
      );

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);

      expect(body).toEqual({
        sql: 'SELECT * FROM users WHERE id = $1 AND active = $2',
        params: [42, true],
      });
    });

    it('should throw error when sql is empty', async () => {
      await expect(
        client.db.query('')
      ).rejects.toThrow('sql must be a non-empty string');
    });

    it('should handle API errors', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Table not found' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        client.db.query('SELECT * FROM nonexistent')
      ).rejects.toThrow('Table not found');
    });

    it('should default params to empty array', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ rows: [], rowCount: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await client.db.query('SELECT 1');

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);

      expect(body.params).toEqual([]);
    });
  });

  describe('transaction', () => {
    it('should commit on success', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            results: [
              { rows: [], rowCount: 1 },
              { rows: [], rowCount: 1 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const result = await client.db.transaction(async (tx) => {
        await tx.query('INSERT INTO orders (user_id) VALUES ($1)', [1]);
        await tx.query('UPDATE users SET order_count = order_count + 1 WHERE id = $1', [1]);
        return { orderId: 123 };
      });

      expect(result.orderId).toBe(123);

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);

      expect(body.queries).toHaveLength(2);
      expect(body.queries[0].sql).toBe('INSERT INTO orders (user_id) VALUES ($1)');
      expect(body.queries[1].sql).toBe('UPDATE users SET order_count = order_count + 1 WHERE id = $1');
    });

    it('should rollback on callback error', async () => {
      await expect(
        client.db.transaction(async (_tx) => {
          throw new Error('Callback failed');
        })
      ).rejects.toThrow('Callback failed');

      // No fetch should be called when callback throws
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should rollback on server error', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Constraint violation' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        client.db.transaction(async (tx) => {
          await tx.query('INSERT INTO orders (user_id) VALUES ($1)', [999]);
        })
      ).rejects.toThrow('Constraint violation');
    });

    it('should handle empty transaction', async () => {
      const result = await client.db.transaction(async (_tx) => {
        // No queries
        return { empty: true };
      });

      expect(result.empty).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should collect multiple queries', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            results: [
              { rows: [], rowCount: 1 },
              { rows: [], rowCount: 1 },
              { rows: [], rowCount: 1 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await client.db.transaction(async (tx) => {
        await tx.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, 1]);
        await tx.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 2]);
        await tx.query('INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3)', [1, 2, 100]);
      });

      const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(options.body as string);

      expect(body.queries).toHaveLength(3);
    });
  });
});
