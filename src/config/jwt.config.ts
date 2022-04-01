const jwtConfig = ()=>{
  return {
    secret: process.env.SECRET_KEY // 秘钥
  }
};

export default jwtConfig