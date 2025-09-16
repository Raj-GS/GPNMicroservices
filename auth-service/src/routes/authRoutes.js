const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/multiorganizationlogin', authController.multiorganizationlogin);
router.post('/checkappversion', authController.checkappversion);
router.post('/addneworganisation', authController.addneworganisation);
router.get('/searchedorganisationslist', authController.searchedOrganisationsList);
router.post('/wdailydevotion', authController.wdailydevotion);
router.post('/forgotpassword', authController.forgotPassword);
router.post('/activateaccountrequest', authController.activateAccountRequest);
router.post('/checkappuserexistornot', authController.checkAppUserExistOrNot);
router.post('/deleteuser', authController.deleteDbUser);
router.post('/test', (req, res) => {
    res.json({ message: 'Test route is working!' });
});

module.exports = router;
