const User = require('../models/user');

exports.registerUser = async (req, res) => {
  try {
    const { userId, inviterId, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: 'User ID already exists' });
    }

    // Create new user
    const newUser = new User({
      userId,
      inviterId,
      username,
    });const User = require('../models/user');

    exports.registerUser = async (req, res) => {
      try {
        const { userId, inviterUsername, username } = req.body;
    
        // Check if user already exists
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
          return res.status(400).json({ message: 'User ID already exists' });
        }
    
        // Create new user
        const newUser = new User({
          userId,
          inviterUsername,
          username,
        });
    
        // If there is an inviter, update the inviter's referral balance and invited users list
        if (inviterUsername) {
          const inviter = await User.findOne({ username: inviterUsername });
          if (inviter) {
            inviter.referralBalance += 100;
            inviter.invitedUsers.push(newUser._id);
            await inviter.save();
          }
        }
    
        await newUser.save();
        res.status(201).json(newUser);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    };
    
    exports.updateUserScore = async (req, res) => {
      try {
        const { username, score } = req.body;
    
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        user.gameBalance += score;
        await user.save();
    
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    };
    
    exports.getUserByUsername = async (req, res) => {
      try {
        const { username } = req.params;
    
        const user = await User.findOne({ username }).populate('invitedUsers');
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    };
    
    exports.getInvitedUsers = async (req, res) => {
      try {
        const { username } = req.params;
    
        const inviter = await User.findOne({ username }).populate('invitedUsers');
        if (!inviter) {
          return res.status(404).json({ message: 'Inviter not found' });
        }
    
        res.status(200).json(inviter.invitedUsers);
      } catch (error) {
        res.status (500).json({ message: 'Server error', error });
      }
    };
    

    // If there is an inviter, update the inviter's referral balance and invited users list
    if (inviterId) {
      const inviter = await User.findOne({ username: inviterId });
      if (inviter) {
        inviter.referralBalance += 100;
        inviter.invitedUsers.push(newUser._id);
        await inviter.save();
      }
    }

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateUserScore = async (req, res) => {
  try {
    const { username, score } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.score += score;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).populate('invitedUsers');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getInvitedUsers = async (req, res) => {
  try {
    const { username } = req.params;

    const inviter = await User.findOne({ username }).populate('invitedUsers');
    if (!inviter) {
      return res.status(404).json({ message: 'Inviter not found' });
    }

    res.status(200).json(inviter.invitedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
