const { query } = require('../config/db');

const RESERVED_QUERY_KEYS = new Set(['page', 'limit', 'offset', 'search', 'sortBy', 'sortOrder']);

const buildRepository = ({ table, columns, searchable = [], sortable = [], filterable = [] }) => {
  const selectColumns = ['id', ...columns].join(', ');
  const allowedFilters = new Set(filterable.length ? filterable : columns);
  const allowedSorts = new Set(['id', ...columns, ...sortable]);

  const list = async ({ limit, offset, search, filters = {}, sortBy = 'id', sortOrder = 'DESC' }) => {
    const where = [];
    const params = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (RESERVED_QUERY_KEYS.has(key) || value === undefined || value === null || value === '') {
        return;
      }

      if (key.endsWith('_from')) {
        const column = key.replace(/_from$/, '');
        if (allowedFilters.has(column)) {
          where.push(`${column} >= ?`);
          params.push(value);
        }
        return;
      }

      if (key.endsWith('_to')) {
        const column = key.replace(/_to$/, '');
        if (allowedFilters.has(column)) {
          where.push(`${column} <= ?`);
          params.push(value);
        }
        return;
      }

      if (allowedFilters.has(key)) {
        where.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (search && searchable.length) {
      where.push(`(${searchable.map((field) => `${field} LIKE ?`).join(' OR ')})`);
      searchable.forEach(() => params.push(`%${search}%`));
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const safeSortBy = allowedSorts.has(sortBy) ? sortBy : 'id';
    const safeSortOrder = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const rows = await query(`SELECT ${selectColumns} FROM ${table} ${whereSql} ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`, [
      ...params,
      limit,
      offset
    ]);
    const [{ total }] = await query(`SELECT COUNT(*) AS total FROM ${table} ${whereSql}`, params);
    return { rows, total };
  };

  const findById = async (id) => {
    const rows = await query(`SELECT ${selectColumns} FROM ${table} WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  };

  const create = async (payload) => {
    const fields = Object.keys(payload).filter((key) => columns.includes(key) && payload[key] !== undefined);
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map((field) => payload[field]);
    const result = await query(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`, values);
    return findById(result.insertId);
  };

  const updateById = async (id, payload) => {
    const fields = Object.keys(payload).filter((key) => columns.includes(key) && payload[key] !== undefined);
    if (!fields.length) return findById(id);

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => payload[field]);
    await query(`UPDATE ${table} SET ${assignments} WHERE id = ?`, [...values, id]);
    return findById(id);
  };

  const removeById = async (id) => {
    await query(`DELETE FROM ${table} WHERE id = ?`, [id]);
  };

  return { list, findById, create, updateById, removeById };
};

module.exports = { buildRepository };
