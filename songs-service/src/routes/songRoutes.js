const express = require('express');
const router = express.Router();
const songController = require('../controllers/SongsController');
const bibleController = require('../controllers/BibleStudyController');
const authenticateToken = require('../middleware/auth');

router.get('/songslist', authenticateToken, songController.songsList);
router.post('/newsongslist', authenticateToken, songController.newsongslist);
router.post('/songdetails', authenticateToken, songController.songDetails);
router.post('/songlyrics', authenticateToken, songController.songLyrics);
router.post('/songarrows', authenticateToken, songController.songArrows);
router.post('/songlyricdetails', authenticateToken, songController.songLyricDetails);
router.post('/adddefaultsongstitle', authenticateToken, songController.adddefaultsongstitle);

router.post('/biblestudylist', authenticateToken, bibleController.biblestudylist);
router.post('/biblestudyview', authenticateToken, bibleController.biblestudyview);
router.post('/searchbiblestudy', authenticateToken, bibleController.searchbiblestudy);





module.exports = router;