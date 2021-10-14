const jwt = require('jsonwebtoken');

const time = '1d'

const Token = {
  encrypt:function(data){ //data加密数据，time过期时间
    return jwt.sign(data, 'token', {expiresIn:time})
  },
  decrypt:function(token){
    try {
      let data = jwt.verify(token, 'token');
      return {
        token:true,
        id:data.username
      };
    } catch (e) {
      return {
        token:false,
        data:e
      }
    }
  }
}
module.exports = Token;
