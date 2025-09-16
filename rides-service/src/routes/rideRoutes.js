const express = require('express');
const router = express.Router();
const RideController = require('../controllers/RideController');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // store file in memory buffer


router.get('/getRideDetails', authenticateToken, RideController.getRideDetails);
router.get('/getPassengerRequests', authenticateToken, RideController.getPassengerRequests);
router.get('/getUserData', authenticateToken, RideController.getUserData);
router.post('/updateRequestStatus', authenticateToken, RideController.updateRequestStatus);
router.post('/deleteRequest', authenticateToken, RideController.deleteRequest);
router.post('/acceptRequest', authenticateToken, RideController.acceptRequest);
router.post('/postPassengerRequest', authenticateToken, RideController.postPassengerRequest);
router.post('/postRideDetails', authenticateToken, RideController.postRideDetails);
router.get('/getRideGiverDetails', authenticateToken, RideController.getRideGiverDetails);
router.post('/postRideGiverDetails', authenticateToken, upload.single('image'), RideController.postRideGiverDetails);


module.exports = router;