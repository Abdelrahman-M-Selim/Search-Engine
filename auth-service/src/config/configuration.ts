export default () => ({
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@postgres:5432/search_engine',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    expiresIn: parseInt(process.env.JWT_EXPIRE_MINUTES || '60', 10),
  },
});
