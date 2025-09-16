const express = require('express');
const router = express.Router();
const testimonyController = require('../controllers/TestimonyController');
const authenticateToken = require('../middleware/auth');

router.post('/maketestimony', authenticateToken, testimonyController.postTestimony);
router.get('/testimonieslist', authenticateToken, testimonyController.getList);
router.get('/owntestimonieslist', authenticateToken, testimonyController.getOwnList);
router.post('/liketestimony', authenticateToken, testimonyController.likeTestimony);

router.post('/testimonylikeslist', authenticateToken, testimonyController.getTestimonyLikesList);
router.post('/deletetestimony', authenticateToken, testimonyController.deleteTestimony);
router.post('/edittestimony', authenticateToken, testimonyController.editTestimony);
router.post('/readcount', authenticateToken, testimonyController.readCount);




module.exports = router;