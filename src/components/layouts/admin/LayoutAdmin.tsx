import { FC } from 'react';
import Header from '@/components/Header';
import { useSession, signIn } from 'next-auth/react';

interface Props {
  children: React.ReactNode;
}

const LayoutAdmin: FC<Props> = ({ children }: Props) => {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="container">
        <Header isAdmin={!!session} />
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div>
      Not signed in <br />
      <button type="button" onClick={() => signIn()}>
        Sign in
      </button>
    </div>
  );
};

export default LayoutAdmin;
