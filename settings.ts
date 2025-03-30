import dotenv from 'dotenv';
dotenv.config();
const { BERNARDO_PASS, BERNARDO_USER, CECILIO_PASS, CECILIO_USER } = process.env

export default {
  USERS: [
    {
      password: BERNARDO_PASS || '',
      username: BERNARDO_USER || '',
    },
    {
      password: CECILIO_PASS || '',
      username: CECILIO_USER || '',
    },
  ],
}