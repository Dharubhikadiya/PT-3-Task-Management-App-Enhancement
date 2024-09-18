// routes/taskRoutes.js
const express = require('express');
const { assignTask, updateTask, addComment } = require('../controllers/taskController');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

router.post('/assign', authMiddleware, assignTask);  
router.put('/:id', authMiddleware, updateTask);    
router.post('/:id/comments', authMiddleware, addComment);  

module.exports = router;

