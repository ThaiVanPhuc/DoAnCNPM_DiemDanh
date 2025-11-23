const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

router.post('/', classController.createClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);
router.post('/assign', classController.assignUserToClass);
router.get('/:id/users', classController.getUsersInClass);

module.exports = router;