const ApiError = require('../utils/ApiError');
const { getPagination, paginationMeta } = require('../utils/pagination');

const buildCrudService = (repository, resourceName) => ({
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const { rows, total } = await repository.list({
      limit,
      offset,
      search: query.search,
      filters: query,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    });
    return { rows, meta: paginationMeta(page, limit, total) };
  },

  async get(id) {
    const record = await repository.findById(id);
    if (!record) throw new ApiError(404, `${resourceName} not found`);
    return record;
  },

  async create(payload) {
    return repository.create(payload);
  },

  async update(id, payload) {
    await this.get(id);
    return repository.updateById(id, payload);
  },

  async remove(id) {
    await this.get(id);
    await repository.removeById(id);
  }
});

module.exports = { buildCrudService };
