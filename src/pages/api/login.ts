import DBClient from '@/prisma/DBClient';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

const prisma = DBClient.instance;

export default function login(req: NextApiRequest, res: NextApiResponse): void {
  const email = req.body.username;
  const { password } = req.body;

  prisma.user
    .findUnique({
      where: {
        email: email,
      },
    })
    .then((user) => {
      // check account found and verify password
      if (
        !user ||
        !user.password ||
        !bcrypt.compareSync(password, user.password)
      ) {
        // authentication failed
        res.status(422).json(`login failed`);
      } else {
        // authentication successful
        res.status(200).json(user);
      }
    })
    .catch((error) => {
      res.status(400).json(error);
    });
}
