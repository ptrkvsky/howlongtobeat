import Seo from '@/components/Seo';
import { SeoPage } from '@/types';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Admin() {
  const pageSeo: SeoPage = {
    metaTitle: `Admin.`,
  };

  const { data: session, status } = useSession();

  if (status === `loading`) {
    return <h1>Loading...</h1>;
  }

  if (session) {
    return (
      <>
        <Seo pageSeo={pageSeo} />
        Signed in as {session?.user?.email} <br />
        <button type="button" onClick={() => signOut()}>
          Sign out
        </button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button type="button" onClick={() => signIn()}>
        Sign in
      </button>
    </>
  );
}
