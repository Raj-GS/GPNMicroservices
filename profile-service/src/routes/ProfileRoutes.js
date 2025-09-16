const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileController');
const WorshipController = require('../controllers/WorshipController');
const notificationController = require('../controllers/NotificationController');
const authenticateToken = require('../middleware/auth');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // store file in memory buffer
router.get('/profile', authenticateToken, profileController.profile);
router.post('/deleteaccount', authenticateToken, profileController.deleteAcc);
router.post('/profileupdate', authenticateToken, upload.single('image'), profileController.profileupdate);
router.post('/iosprofileupdate', authenticateToken, upload.single('image'),profileController.iosProfileUpdate);

router.get('/settings', authenticateToken, profileController.getSettings);
router.post('/multiorganisationlist', authenticateToken, profileController.multiOrganisationList);
router.post('/checkshiftorganisation', authenticateToken, profileController.checkShiftOrganisation);
router.post('/updatedevicekey', authenticateToken, profileController.updateDeviceKey);
router.post('/changepassword', authenticateToken, profileController.changePassword);
router.post('/feedback', authenticateToken, profileController.submitFeedback);
router.get('/youtubechannel', authenticateToken, profileController.getYoutubeChannel);

router.get('/ministries', authenticateToken, profileController.getMinistries);
router.post('/addvolunteer', authenticateToken, profileController.addVolunteer); // Changed from get to post for
router.post('/removevolunteer', authenticateToken, profileController.removeVolunteer); // Changed from get to post for
router.post('/dailydevotions', authenticateToken, profileController.getDailyDevotions); // Changed from get to post for

router.post('/storetoken', authenticateToken, notificationController.storeToken); // Changed from get to post for
router.post('/storenotifi', authenticateToken, notificationController.storeNotification); // Changed from get to post for
router.post('/notificationlist', authenticateToken, notificationController.notificationList); // Changed from get to post for
router.post('/notificationdetails', authenticateToken, notificationController.notificationDetails); // Changed from get to post for

router.get('/worship', authenticateToken, WorshipController.worship);
router.post('/worshipview', authenticateToken, WorshipController.worshipview);
router.post('/worshipsearch', authenticateToken, WorshipController.worshipsearch);


module.exports = router;