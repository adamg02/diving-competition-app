const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  console.error('Please create a .env file with:');
  console.error('SUPABASE_URL=your_supabase_url');
  console.error('SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Database wrapper to provide SQLite-like callback interface
class Database {
  constructor() {
    this.supabase = supabase;
  }

  // Run a query (INSERT, UPDATE, DELETE) - callback style
  run(sql, params = [], callback) {
    this._execute(sql, params)
      .then(result => {
        if (callback) {
          callback.call({ lastID: result.lastID, changes: result.changes }, null);
        }
      })
      .catch(error => {
        console.error('Database run error:', error.message);
        if (callback) {
          callback.call({}, error);
        }
      });
  }

  // Get a single row - callback style
  get(sql, params = [], callback) {
    this._execute(sql, params)
      .then(result => {
        const row = result.rows && result.rows.length > 0 ? result.rows[0] : undefined;
        if (callback) {
          callback(null, row);
        }
      })
      .catch(error => {
        console.error('Database get error:', error.message);
        if (callback) {
          callback(error, null);
        }
      });
  }

  // Get all rows - callback style
  all(sql, params = [], callback) {
    this._execute(sql, params)
      .then(result => {
        const rows = result.rows || [];
        if (callback) {
          callback(null, rows);
        }
      })
      .catch(error => {
        console.error('Database all error:', error.message);
        if (callback) {
          callback(error, []);
        }
      });
  }

  // Execute query and return promise
  async _execute(sql, params = []) {
    const sqlTrimmed = sql.trim();
    const sqlLower = sqlTrimmed.toLowerCase();

    // Skip schema operations
    if (sqlLower.startsWith('create table') || 
        sqlLower.startsWith('alter table') || 
        sqlLower.startsWith('pragma') ||
        sqlLower.includes('sqlite_master')) {
      return { rows: [], changes: 0 };
    }

    // Replace ? placeholders with $1, $2, etc. for PostgreSQL
    let pgSql = sqlTrimmed;
    let paramIndex = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${paramIndex++}`);
    }

    // Use Supabase's RPC to execute raw SQL
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: pgSql,
        sql_params: params
      });

      if (error) throw error;

      // Parse result based on query type
      if (sqlLower.startsWith('select')) {
        return { rows: data || [] };
      } else if (sqlLower.startsWith('insert')) {
        return {
          lastID: data && data.length > 0 && data[0].id ? data[0].id : null,
          changes: data ? data.length : 1,
          rows: data || []
        };
      } else {
        return {
          changes: data ? data.length : 1,
          rows: data || []
        };
      }
    } catch (error) {
      // If RPC doesn't exist, we need to create it or handle queries manually
      console.error('SQL execution error, falling back to manual query building:', error.message);
      return await this._executeManual(sqlTrimmed, params);
    }
  }

  // Manual query execution as fallback
  async _executeManual(sql, params) {
    const sqlLower = sql.toLowerCase();

    if (sqlLower.startsWith('select')) {
      return await this._handleSelect(sql, params);
    } else if (sqlLower.startsWith('insert')) {
      return await this._handleInsert(sql, params);
    } else if (sqlLower.startsWith('update')) {
      return await this._handleUpdate(sql, params);
    } else if (sqlLower.startsWith('delete')) {
      return await this._handleDelete(sql, params);
    }

    return { rows: [], changes: 0 };
  }

  async _handleSelect(sql, params) {
    // Extract table name
    const tableMatch = sql.match(/from\s+([a-z_]+)/i);
    if (!tableMatch) throw new Error('Cannot parse table name');

    const tableName = tableMatch[1];
    let query = supabase.from(tableName).select('*');

    // Handle simple WHERE id = ? queries
    if (sql.includes('WHERE id = ?') || sql.includes('WHERE id=?')) {
      query = query.eq('id', params[0]);
    } else if (sql.includes('WHERE event_id = ?') || sql.includes('WHERE event_id=?')) {
      query = query.eq('event_id', params[0]);
    } else if (sql.includes('WHERE competitor_id = ?') || sql.includes('WHERE competitor_id=?')) {
      query = query.eq('competitor_id', params[0]);
    } else if (sql.includes('WHERE competition_id = ?') || sql.includes('WHERE competition_id=?')) {
      query = query.eq('competition_id', params[0]);
    }

    // Handle ORDER BY
    if (sql.includes('ORDER BY')) {
      const orderMatch = sql.match(/ORDER BY\s+([a-z_]+)(\s+(ASC|DESC))?/i);
      if (orderMatch) {
        const column = orderMatch[1];
        const direction = orderMatch[3] && orderMatch[3].toLowerCase() === 'desc';
        query = query.order(column, { ascending: !direction });
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return { rows: data || [] };
  }

  async _handleInsert(sql, params) {
    const tableMatch = sql.match(/into\s+([a-z_]+)/i);
    if (!tableMatch) throw new Error('Cannot parse table name');

    const tableName = tableMatch[1];
    const columnsMatch = sql.match(/\(([^)]+)\)/);
    if (!columnsMatch) throw new Error('Cannot parse columns');

    const columns = columnsMatch[1].split(',').map(c => c.trim());
    const insertData = {};

    columns.forEach((col, index) => {
      if (params[index] !== undefined) {
        insertData[col] = params[index];
      }
    });

    const { data, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select();

    if (error) throw error;

    return {
      lastID: data && data.length > 0 ? data[0].id : null,
      changes: 1,
      rows: data || []
    };
  }

  async _handleUpdate(sql, params) {
    const tableMatch = sql.match(/update\s+([a-z_]+)/i);
    if (!tableMatch) throw new Error('Cannot parse table name');

    const tableName = tableMatch[1];
    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
    if (!setMatch) throw new Error('Cannot parse SET clause');

    const setParts = setMatch[1].split(',').map(s => s.trim());
    const updateData = {};
    let paramIndex = 0;

    setParts.forEach(part => {
      const [column] = part.split('=').map(p => p.trim());
      if (params[paramIndex] !== undefined) {
        updateData[column] = params[paramIndex++];
      }
    });

    let query = supabase.from(tableName).update(updateData);

    if (sql.includes('WHERE id = ?') && params[paramIndex] !== undefined) {
      query = query.eq('id', params[paramIndex]);
    }

    const { data, error } = await query.select();
    if (error) throw error;

    return {
      changes: data ? data.length : 0,
      rows: data || []
    };
  }

  async _handleDelete(sql, params) {
    const tableMatch = sql.match(/from\s+([a-z_]+)/i);
    if (!tableMatch) throw new Error('Cannot parse table name');

    const tableName = tableMatch[1];
    let query = supabase.from(tableName).delete();

    if (sql.includes('WHERE id = ?')) {
      query = query.eq('id', params[0]);
    } else if (sql.includes('WHERE event_id = ?')) {
      query = query.eq('event_id', params[0]);
    } else if (sql.includes('WHERE competitor_id = ?')) {
      query = query.eq('competitor_id', params[0]);
    }

    const { data, error } = await query.select();
    if (error) throw error;

    return {
      changes: data ? data.length : 0,
      rows: data || []
    };
  }
}

const db = new Database();

console.log('Supabase database client initialized successfully');
console.log('Make sure to run the supabase-schema.sql file in your Supabase SQL editor');

module.exports = db;
