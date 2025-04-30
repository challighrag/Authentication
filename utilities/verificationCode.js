const crypto = require("crypto");

function generateVerificationCode() {
    return crypto.randomInt(1e5, 1e6);
}

module.exports = generateVerificationCode;