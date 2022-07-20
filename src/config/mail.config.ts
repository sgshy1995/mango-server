const mailConfig = ()=>{
  const {
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USER,
    MAIL_PASS
  } = process.env;
  return {
    host: MAIL_HOST,
    port: parseInt(MAIL_PORT, 10) || 465,
    user: MAIL_USER,
    pass: MAIL_PASS
  };
};

export default mailConfig
