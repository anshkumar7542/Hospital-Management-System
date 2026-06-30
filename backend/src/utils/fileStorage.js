const fs = require('fs/promises');
const path = require('path');
const env = require('../config/env');

const resolveUploadPath = (relativePath) => {
  const normalized = String(relativePath || '').replace(/^[/\\]+/, '');
  const absolutePath = path.resolve(env.uploadDir, normalized);
  const uploadRoot = path.resolve(env.uploadDir);

  if (!absolutePath.startsWith(uploadRoot)) {
    throw new Error('Unsafe upload path');
  }

  return absolutePath;
};

const deleteUploadedFile = async (relativePath) => {
  if (!relativePath) return;
  const absolutePath = resolveUploadPath(relativePath);
  await fs.rm(absolutePath, { force: true });
};

module.exports = { resolveUploadPath, deleteUploadedFile };
