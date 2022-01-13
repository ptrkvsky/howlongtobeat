import DBClient from '@/prisma/DBClient';
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@prisma/client';

const prisma = DBClient.instance;

export default function login(req: NextApiRequest, res: NextApiResponse): void {
  prisma.user
    .findUnique({
      where: {
        email: req.body.username,
      },
    })
    .then((user) => {
      res.status(200).json(user);
    });
}
