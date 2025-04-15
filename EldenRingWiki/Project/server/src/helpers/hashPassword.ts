import bcrypt from 'bcrypt';

// HASHING AV PASSORD OG SAMMENLIGNING AV PASSORD OG HASHET PASSORD NÅR BRUKER LOGGER INN
// HENTET KODE FRA YOUTUBE: https://www.youtube.com/watch?v=MgzVe_MJ7S8&list=PL_cUvD4qzbkwjmjy-KjbieZ8J9cGwxZpC&index=17

const saltRounds = 10;

export const hashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (plain: string, hashed: string) => bcrypt.compareSync(plain, hashed);
