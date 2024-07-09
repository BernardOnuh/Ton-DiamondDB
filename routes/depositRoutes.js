const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Register a new user
router.post('/register', userController.registerUser);

// Get all registered users
router.get('/users', userController.getAllUsers);

// Get user by userId
router.get('/user/:userId', userController.getUserByUserId);

// Get user by dashboardId
router.get('/dashboard/:dashboardId', userController.getUserByDashboardId);

router.post('/deposit', userController.deposit);

// Route for withdrawal
router.post('/withdraw', userController.withdraw);

router.get('/transaction/:dashboardId', userController.getTransactionHistory);

router.post('/update-balance', userController.updateBalance);

router.post('/player-lost', userController.playerLost);

router.post('/update-realbalance', userController.updateRealBalance);

router.post('/player-reallost', userController.playerRealLost);

router.get('/invited-users/:userId', userController.getInvitedUsers);

router.get('/scoreboard', userController.getScoreboard);

router.post('/reset-scores', userController.resetScores);


module.exports = router;
