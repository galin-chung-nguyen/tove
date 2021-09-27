//Checking the crypto module
const dotenv = require('dotenv');
// get config vars
dotenv.config();
const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = Buffer.from(process.env.CRYPTO_KEY, 'latin1');
const iv = Buffer.from(process.env.CRYPTO_IV, 'latin1');

//Encrypting text
function encrypt(text) {
   let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypting text
function decrypt(text) {
   let iv = Buffer.from(text.iv, 'hex');
   let encryptedText = Buffer.from(text.encryptedData, 'hex');
   let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
}

console.log(encrypt('HEllo World!! Cái gì thế???'))
console.log(decrypt(encrypt('HEllo World!! Cái gì thế???')))

module.exports = {
    encrypt : encrypt,
    decrypt : decrypt
}