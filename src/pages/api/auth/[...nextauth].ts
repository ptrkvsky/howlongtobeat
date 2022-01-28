import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { NextApiRequest, NextApiResponse } from 'next';
import { SanityAdapter, SanityCredentials } from 'next-auth-sanity';
import sanity from '@/lib/sanity/sanityClient';

const options: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    SanityCredentials(sanity.instance),
  ],
  session: {
    strategy: `jwt`,
  },
  adapter: SanityAdapter(sanity.instance),
};

const NextAuthFunc = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, options);

export default NextAuthFunc;
