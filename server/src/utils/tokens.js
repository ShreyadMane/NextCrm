const jwt = require('jsonwebtoken');

function signAccessToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}
function signRefreshToken(user) {
  return jwt.sign({ sub: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

module.exports = { signAccessToken, signRefreshToken };
