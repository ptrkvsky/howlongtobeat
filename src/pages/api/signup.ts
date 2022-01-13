import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

const password = `tortue chat et pepperoni pizza`;

export default async function login(
  _req: NextApiRequest,
  res: NextApiResponse,
): Promise<any> {
  const cryptedPassword = await bcrypt.hash(password, 8);
  res.status(200).json({
    name: `John Doe`,
    email: `JohnDoe@amiarealboy.test.com`,
    password: cryptedPassword,
  });
}
