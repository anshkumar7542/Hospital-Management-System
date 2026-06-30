const express = require('express');
const { validate } = require('../middlewares/validate.middleware');
const { idParam, pagination } = require('../validators/common.validators');

const buildCrudRoutes = ({ controller, createRules = [], updateRules = [], roles = {} }) => {
  const router = express.Router();
  const allow = (req, res, next) => next();

  router.get('/', roles.read || allow, validate(pagination), controller.list);
  router.post('/', roles.create || allow, validate(createRules), controller.create);
  router.get('/:id', roles.read || allow, validate(idParam), controller.get);
  router.patch('/:id', roles.update || allow, validate([...idParam, ...updateRules]), controller.update);
  router.delete('/:id', roles.delete || allow, validate(idParam), controller.remove);

  return router;
};

module.exports = { buildCrudRoutes };
