const crypto = require('crypto')
const JWT = require('jsonwebtoken')

var sanitize = {
    sanitize: function (string) {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };
      const reg = /[&<>"'/]/gi;
      return string.replace(reg, (match) => map[match]);
    },
    hasher: function(password){
        const sha256 = crypto.createHash('sha256');
        //console.log(sha256)
    const hash = sha256.update(password).digest('base64');
    return hash;
      },
  makeJWT : function(password,email,username){
    let payload ={
      password:password,
      email:email,
      username:username
    }
    const token = JWT.sign({
      data: payload
    }, 'SecretKey', { expiresIn: '72h' });
    //console.log(token)
    return token
  },
  verifyJWT: function(token){
    let decodedToken = JWT.verify(token, 'SecretKey');
    //console.log(decodedToken)
    return decodedToken
  }
  };
  
  module.exports = sanitize
 