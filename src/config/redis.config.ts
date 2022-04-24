const redisConfig = () => {
    const {
        REDIS_HOST,
        REDIS_PORT,
        REDIS_DB,
        REDIS_PASSWORD
    } = process.env;
    return {
        host: REDIS_HOST,
        db: parseInt(REDIS_DB, 10) || 0,
        port: parseInt(REDIS_PORT, 10) || 6379,
        password: REDIS_PASSWORD
    };
};

export default redisConfig;