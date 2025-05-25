const router = require('express').Router();
const categoryController = require('../controllers/category.controller');

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;