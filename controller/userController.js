const User = require('../models/user'); // User model
const Scoreboard = require('../models/scoreboard');
const Transaction = require('../models/transaction');
const uuid = require('uuid'); // Import the UUID library

exports.registerUser = async (req, res) => {
  try {
    const { userId, inviterId, username } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ userId });

    let dashboardId;
    let initialBalance = 10000; // Initial balance for the 'balance' field
    let initialRealGameBalance = 0; // Initial balance for the 'realGameBalance' field

    if (existingUser) {
      // If the user already exists, use the existing dashboardId and balance
      dashboardId = existingUser.dashboardId;
      initialBalance = existingUser.balance;
      initialRealGameBalance = existingUser.realGameBalance;
    } else {
      // If it's a new user, generate a new UUID as the dashboardId
      dashboardId = uuid.v4();

      // Create a new user with the new 'realGameBalance' field
      const newUser = new User({
        userId,
        inviterId,
        username,
        balance: initialBalance,
        realGameBalance: initialRealGameBalance,
        dashboardId,
      });

      await newUser.save();

      // If inviterId exists, add the userId to the inviter's invitedUsers array
      if (inviterId) {
        await User.findOneAndUpdate({ userId: inviterId }, { $push: { invitedUsers: userId } });
      }
    }

    // Generate a dashboard link with the UUID
    const dashboardLink = `https://gummybear.vercel.app/components/cashier?dashboardId=${dashboardId}`;
    
    res.status(201).json({
      message: 'User registered',
      dashboardLink,
      initialBalance,
      initialRealGameBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.resetScores = async (req, res) => {
  try {
    // Reset scores for all users in the Scoreboard model
    await Scoreboard.updateMany({}, { $set: { score: 0 } });

    // Reset scores for all users in the User model
    await User.updateMany({}, { $set: { score: 0 } });

    res.status(200).json({ message: 'Scores reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.getInvitedUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by userId
    const user = await User.findOne({ userId }).populate('invitedUsers', 'userId username');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const invitedUsers = user.invitedUsers;

    res.status(200).json({ invitedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get all registered users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { _id: 0, __v: 0 }); // Exclude _id and __v fields

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get user by userId
exports.getUserByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId }, { _id: 0, __v: 0 }); // Exclude _id and __v fields

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get user by dashboardId
exports.getUserByDashboardId = async (req, res) => {
  try {
    const { dashboardId } = req.params;

    const user = await User.findOne({ dashboardId }, { _id: 0, __v: 0 }); // Exclude _id and __v fields

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller for deposit
exports.deposit = async (req, res) => {
  try {
    const { dashboardId, walletAddress } = req.body;
    let { amount } = req.body;

    // Convert amount to an integer if it's a string
    amount = parseInt(amount, 10);

    // Check if amount is a valid integer
    if (isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid deposit amount' });
    }

    // Find the user by dashboardId
    const user = await User.findOne({ dashboardId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If walletAddress is not set, store the provided wallet address
    if (!user.walletAddress) {
      user.walletAddress = walletAddress;
    } else if (user.walletAddress !== walletAddress) {
      return res.status(400).json({ error: 'Wallet address cannot be changed after the first deposit' });
    }

    // Update the user's balance
    user.realGameBalance += amount;

    const depositTransaction = new Transaction({
      dashboardId,
      type: 'deposit',
      amount,
    });

    await user.save();
    await depositTransaction.save();

    res.status(200).json({ message: 'Deposit successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Controller for withdrawal
exports.withdraw = async (req, res) => {
  try {
    const { dashboardId, walletAddress } = req.body;
    let { amount } = req.body;

    // Convert amount to a number if it's a string
    amount = parseFloat(amount);

    // Check if amount is a valid number
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    // Find the user by dashboardId
    const user = await User.findOne({ dashboardId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the provided wallet address matches the stored address
    if (user.walletAddress !== walletAddress) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Check if the user has sufficient balance
    if (user.realGameBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update the user's balance
    user.realGameBalance -= amount;
    const withdrawalTransaction = new Transaction({
      dashboardId,
      type: 'withdrawal',
      amount,
    });

    // Save the withdrawal transaction
    await withdrawalTransaction.save();

    await user.save();

    res.status(200).json({ message: 'Withdrawal successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller to get transaction history by dashboardId
exports.getTransactionHistory = async (req, res) => {
  try {
    const { dashboardId } = req.params;

    // Find all transactions for the specified dashboardId
    const transactions = await Transaction.find({ dashboardId });

    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to update user balance for the game
exports.updateBalance = async (req, res) => {
  try {
    const { userId } = req.body;
    let { gamePoints, scorePoints } = req.body;

    gamePoints = parseInt(gamePoints, 10);
    scorePoints = scorePoints ? parseInt(scorePoints, 10) : 0; // Set a default value if not provided

    if (isNaN(gamePoints) || !Number.isInteger(gamePoints) || isNaN(scorePoints) || !Number.isInteger(scorePoints)) {
      return res.status(400).json({ error: 'Invalid game or score points value' });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.balance += gamePoints;
    user.score += scorePoints;

    await user.save();

    // Update or add the user to the scoreboard
    await Scoreboard.findOneAndUpdate(
      { userId },
      { $set: { userId, score: user.score } },
      { upsert: true }
    );

    res.status(200).json({ message: 'Balance updated successfully', newBalance: user.balance, newScore: user.score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller for when a player loses a game
exports.playerLost = async (req, res) => {
  try {
    const { userId } = req.body;
    let { gamePointsLost } = req.body;

    // Convert gamePointsLost to an integer if it's a string
    gamePointsLost = parseInt(gamePointsLost, 10);

    // Check if gamePointsLost is a valid integer
    if (isNaN(gamePointsLost) || !Number.isInteger(gamePointsLost) || gamePointsLost <= 0) {
      return res.status(400).json({ error: 'Invalid game points lost value' });
    }

    // Find the user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user has enough balance to deduct
    if (user.balance < gamePointsLost) {
      return res.status(400).json({ error: 'Insufficient balance for the game points lost' });
    }

    // Deduct game points lost from the user's balance
    user.balance -= gamePointsLost;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Game points deducted successfully', newBalance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.updateRealBalance = async (req, res) => {
  try {
    const { userId } = req.body;
    let { gamePoints, scorePoints } = req.body;

    gamePoints = parseInt(gamePoints, 10);
    scorePoints = scorePoints ? parseInt(scorePoints, 10) : 0; // Set a default value if not provided

    if (isNaN(gamePoints) || !Number.isInteger(gamePoints) || isNaN(scorePoints) || !Number.isInteger(scorePoints)) {
      return res.status(400).json({ error: 'Invalid game or score points value' });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.realGameBalance += gamePoints;
    user.score += scorePoints;

    await user.save();

    // Update or add the user to the scoreboard
    await Scoreboard.findOneAndUpdate(
      { userId },
      { $set: { userId, score: user.score } },
      { upsert: true }
    );

    res.status(200).json({ message: 'Balance updated successfully', newBalance: user.balance, newScore: user.score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller for when a player loses a game
exports.playerRealLost = async (req, res) => {
  try {
    const { userId } = req.body;
    let { gamePointsLost } = req.body;

    // Convert gamePointsLost to an integer if it's a string
    gamePointsLost = parseInt(gamePointsLost, 10);

    // Check if gamePointsLost is a valid integer
    if (isNaN(gamePointsLost) || !Number.isInteger(gamePointsLost) || gamePointsLost <= 0) {
      return res.status(400).json({ error: 'Invalid game points lost value' });
    }

    // Find the user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user has enough balance to deduct
    if (user.realGameBalance < gamePointsLost) {
      return res.status(400).json({ error: 'Insufficient balance for the game points lost' });
    }

    // Deduct game points lost from the user's balance
    user.realGameBalance -= gamePointsLost;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Game points deducted successfully', newBalance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getScoreboard = async (req, res) => {
  try {
    const scoreboard = await Scoreboard.find().sort({ score: -1 }); // Sort in descending order

    res.status(200).json(scoreboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
