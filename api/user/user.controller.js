const crypto = require('crypto');
const {
  createUser,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser,
} = require('./users.services');
const { sendNodemailer } = require('../../utils/email');

async function getAllUsersHandler(_, res) {
  try {
    const user = await getAllUsers();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

async function getSingleUserHandler(req, res) {
  const { id } = req.params;
  try {
    const user = await getSingleUser(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { profile } = user;
    return res.json(profile);
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

async function createUserHandler(req, res) {
  const userData = req.body;

  try {
    const hash = crypto.createHash('sha256')
      .update(userData.email)
      .digest('hex');

    userData.passwordResetToken = hash;
    userData.passwordResetExpires = Date.now() + 3_600_000 * 1;
    const user = await createUser(userData);
    const message = {
      from: '"no-replay" backend@assessment.camp',
      to: user.email,
      subject: 'This is a Non-empty-mail',
      html: `
      <h1>Hello, ${user.name}</h1>
      <a href="http://github.com/Dhruva108" target="_blank" rel="no referer"> <h3>My Github</h3> </a>
      `,
    };

    await sendNodemailer(message);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function updateUserHandler(req, res) {
  const { id } = req.params;
  const userData = req.body;

  try {
    const user = await updateUser(id, userData);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

async function deleteUserHandler(req, res) {
  const { id } = req.params;
  try {
    const user = await deleteUser(id);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    return res.json({ message: 'User deleted!' });
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

module.exports = {
  getAllUsersHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getSingleUserHandler,
};
