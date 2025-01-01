import dotenv from 'dotenv';
dotenv.config();
const { BERNARDO_PASS, BERNARDO_USER } = process.env

export default {
  USERS: [
    {
      password: BERNARDO_PASS || '',
      username: BERNARDO_USER || '',
    },
  ],
}