const fs = require("fs");
const crypto = require('crypto');
const CryptoJS = require("crypto-js");
const privateKey = fs.readFileSync(require.resolve('../config/private_key.pem'), { encoding: 'utf8' });

function decryptWithPrivateKey(toDecrypt) {
    const buffer = Buffer.from(toDecrypt, 'base64');
    const decryptedKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_OAEP_PADDING,
        oaepHash: "sha256"
      },
      buffer
    );
    return decryptedKey.toString('utf8');
}

function generateToken() {
    const authToken = crypto.randomBytes(32).toString('base64');
    const authTokenExpiry = Date.now() + 30 * 60 * 1000;
   return { authToken, authTokenExpiry };
}

function decryptData(encryptedData, decryptedAPPKey) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, decryptedAPPKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {decryptWithPrivateKey, generateToken, decryptData};