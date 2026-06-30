const ApiError = require('../utils/ApiError');
const userRepository = require('../repositories/user.repository');
const { getPagination, paginationMeta } = require('../utils/pagination');
const { hashPassword } = require('../utils/password');

const withoutPassword = (user) => {
  if (!user) return null;
  const { password_hash: passwordHash, ...safeUser } = user;
  return safeUser;
};

const list = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { rows, total } = await userRepository.list({
    limit,
    offset,
    search: query.search,
    filters: query
  });
  return { rows: rows.map(withoutPassword), meta: paginationMeta(page, limit, total) };
};

const get = async (id) => {
  const user = await userRepository.findProfileById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const create = async (payload) => {
  const existing = await userRepository.findByEmail(payload.email);
  if (existing) throw new ApiError(409, 'Email is already registered');

  const user = await userRepository.create({
    role_id: payload.role_id,
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone || null,
    password_hash: await hashPassword(payload.password),
    status: payload.status || 'active',
    email_verified_at: payload.email_verified_at || null
  });
  return withoutPassword(user);
};

const update = async (id, payload) => {
  await get(id);
  const updatePayload = { ...payload };
  delete updatePayload.password;
  delete updatePayload.password_hash;
  const user = await userRepository.updateById(id, updatePayload);
  return withoutPassword(user);
};

const remove = async (id) => {
  await get(id);
  await userRepository.updateById(id, { deleted_at: new Date(), status: 'inactive' });
};

module.exports = { list, get, create, update, remove };
