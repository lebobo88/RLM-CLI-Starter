/**
 * AuthHub Database Module
 *
 * Provides database query and transaction capabilities through AuthHub's
 * multi-tenant database routing.
 *
 * @module @authhub/sdk/db
 */

import type { QueryResult, TransactionContext } from '../types';

/**
 * Request function type for making authenticated API calls.
 */
type RequestFn = <T>(options: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
}) => Promise<T>;

/**
 * Configuration for the database module.
 */
interface DBModuleConfig {
  request: RequestFn;
}

/**
 * Transaction query for batch execution.
 */
interface TransactionQuery {
  query: string;
  parameters?: unknown[];
}

/**
 * API response wrapper format.
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

/**
 * Database module for queries and transactions.
 *
 * @example
 * ```typescript
 * // Simple query
 * const users = await client.db.query<User>(
 *   'SELECT * FROM users WHERE active = $1',
 *   [true]
 * );
 *
 * // Transaction
 * const result = await client.db.transaction(async (tx) => {
 *   await tx.query('INSERT INTO orders (user_id, total) VALUES ($1, $2)', [userId, 100]);
 *   await tx.query('UPDATE users SET order_count = order_count + 1 WHERE id = $1', [userId]);
 *   return { success: true };
 * });
 * ```
 */
export class DBModule {
  private readonly config: DBModuleConfig;

  /**
   * Creates a new database module instance.
   * @internal
   */
  constructor(config: DBModuleConfig) {
    this.config = config;
  }

  /**
   * Execute a parameterized SQL query.
   *
   * @param sql - SQL query with $1, $2, etc. placeholders
   * @param params - Array of parameter values
   * @returns Query result with rows and rowCount
   * @throws {Error} If the query fails
   *
   * @example
   * ```typescript
   * interface User {
   *   id: number;
   *   name: string;
   *   email: string;
   * }
   *
   * const result = await client.db.query<User>(
   *   'SELECT * FROM users WHERE email = $1',
   *   ['user@example.com']
   * );
   *
   * if (result.rowCount > 0) {
   *   console.log(`Found user: ${result.rows[0].name}`);
   * }
   * ```
   */
  async query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    if (!sql || typeof sql !== 'string') {
      throw new Error('sql must be a non-empty string');
    }

    const response = await this.config.request<ApiResponse<QueryResult<T>>>({
      method: 'POST',
      path: '/api/v1/db/query',
      body: {
        query: sql,
        parameters: params ?? [],
      },
    });

    if (!response.success) {
      throw new Error(response.error ?? response.message ?? 'Query failed');
    }

    return response.data;
  }

  /**
   * Execute multiple queries within a transaction.
   *
   * All queries in the callback will be executed atomically - if any query
   * fails, all changes will be rolled back. If all queries succeed, the
   * transaction is committed.
   *
   * @param callback - Async function receiving a transaction context
   * @returns The return value of the callback
   * @throws {Error} If any query fails (transaction is rolled back)
   *
   * @example
   * ```typescript
   * const result = await client.db.transaction(async (tx) => {
   *   // Deduct from sender
   *   await tx.query(
   *     'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
   *     [amount, senderId]
   *   );
   *
   *   // Add to receiver
   *   await tx.query(
   *     'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
   *     [amount, receiverId]
   *   );
   *
   *   // Log the transfer
   *   await tx.query(
   *     'INSERT INTO transfers (sender_id, receiver_id, amount) VALUES ($1, $2, $3)',
   *     [senderId, receiverId, amount]
   *   );
   *
   *   return { transferId: 'tx-123' };
   * });
   * ```
   */
  async transaction<T>(
    callback: (tx: TransactionContext) => Promise<T>
  ): Promise<T> {
    // Collect queries from the callback
    const queries: TransactionQuery[] = [];
    let callbackResult: T | undefined;
    let callbackError: Error | undefined;

    // Create a mock transaction context that collects queries
    const txContext: TransactionContext = {
      query: async <R = Record<string, unknown>>(
        sql: string,
        params?: unknown[]
      ): Promise<QueryResult<R>> => {
        queries.push({ query: sql, parameters: params ?? [] });
        // Return empty result during collection phase
        return { rows: [] as R[], rowCount: 0 };
      },
    };

    // Execute the callback to collect queries
    try {
      callbackResult = await callback(txContext);
    } catch (err) {
      callbackError = err instanceof Error ? err : new Error(String(err));
    }

    if (callbackError) {
      throw callbackError;
    }

    if (queries.length === 0) {
      // No queries to execute
      return callbackResult as T;
    }

    // Execute all queries as a transaction on the server
    const response = await this.config.request<ApiResponse<{
      committed: boolean;
      results: Array<QueryResult<unknown>>;
      totalExecutionTime: number;
    }>>({
      method: 'POST',
      path: '/api/v1/db/transaction',
      body: {
        queries,
      },
    });

    if (!response.success || !response.data.committed) {
      throw new Error(response.error ?? response.message ?? 'Transaction failed');
    }

    return callbackResult as T;
  }
}
