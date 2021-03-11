const crypto = require('crypto')

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
    const hash = sha256.update(password).digest('base64');
    return hash;
      }
  };
  
  module.exports = sanitize


 