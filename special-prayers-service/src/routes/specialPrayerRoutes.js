const express = require('express');
const router = express.Router();
const prayerController = require('../controllers/specialPrayerController');
const authenticateToken = require('../middleware/auth');

router.get('/specialprayercategories', authenticateToken, prayerController.SpecialPrayerCategories);
router.post('/specialprayerlist', authenticateToken, prayerController.SpecialPrayerList);
router.post('/addspecialprayersubscription', authenticateToken, prayerController.addSpecialPrayerSubscription);
router.post('/mysubscriptions', authenticateToken, prayerController.mySubscriptions);
router.post('/adduserdayactivity', authenticateToken, prayerController.addUserDayActivity);
router.post('/specialprayerslots', authenticateToken, prayerController.getSpecialPrayerSlots);

router.get('/prayforthenation', authenticateToken, prayerController.prayForTheNation);
router.post('/mydayactivity', authenticateToken, prayerController.myDayActivity);
router.post('/removesubscription', authenticateToken, prayerController.removeSpecialPrayerSubscription);





module.exports = router;
