const express = require('express');
const router = express.Router();
const eventController = require('../controllers/EventController');
const authenticateToken = require('../middleware/auth');

router.post('/eventslist', authenticateToken, eventController.eventsList);
router.post('/eventdetails', authenticateToken, eventController.eventDetails);
router.post('/archiveeventslist', authenticateToken, eventController.eventsList);

module.exports = router;