const express = require('express');
const router = express.Router();
const prayerController = require('../controllers/prayerController');
const commentController = require('../controllers/CommentController');
const authenticateToken = require('../middleware/auth');

router.get('/category', authenticateToken, prayerController.category);
router.get('/prayrequestlist', authenticateToken, prayerController.prayRequestList);
router.get('/answeredprayerslist', authenticateToken, prayerController.answeredPrayersList);
router.get('/allansweredprayerslist', authenticateToken,prayerController.allAnsweredPrayersList);

router.get('/allprayrequestlist', authenticateToken, prayerController.allPrayRequestList);
router.post('/prayrequest', authenticateToken,prayerController.prayrequest);
router.post('/filteredprayrequestlist', authenticateToken,prayerController.filteredPrayRequestList);
router.post('/prayrequestupdate', authenticateToken,prayerController.prayRequestUpdate);
router.post('/prayanswerd', authenticateToken,prayerController.prayAnswerd);
router.post('/updatePrayRequest', authenticateToken,prayerController.updatePrayRequest);
router.post('/prayrequestdetails', authenticateToken,prayerController.prayRequestDetails);
router.post('/likeprayer', authenticateToken,prayerController.likePrayer);
router.post('/prayerlikelist', authenticateToken,prayerController.prayerLikeList);
router.post('/editprayer', authenticateToken,prayerController.editPrayer);
router.post('/deleteprayer', authenticateToken,prayerController.deletePrayer);
router.post('/prayclicked', authenticateToken,prayerController.prayClicked);
router.post('/newprayerlist', authenticateToken,prayerController.newPrayerList);
router.post('/addpinprayer', authenticateToken, prayerController.addPinPrayer);
router.post('/reactionsdetails', authenticateToken, prayerController.reactionsDetails);
router.get('/mypinnedprayers', authenticateToken, prayerController.myPinnedPrayers);
router.get('/aigeneratedprayerpoints', authenticateToken, prayerController.aigeneratedprayerpoints);



router.post('/commentlist', authenticateToken, commentController.commentList);
router.post('/addprayercomment', authenticateToken,commentController.addPrayerComment);
router.post('/editprayercomment', authenticateToken,commentController.editPrayerComment);
router.post('/deleteprayercomment', authenticateToken,commentController.deletePrayerComment);


module.exports = router;