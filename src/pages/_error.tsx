import Layout from '@/styles/components/layout/Layout';

function Error({ statusCode }: any) {
  return (
    <Layout games={[]} isCentered>
      {statusCode
        ? `Une erreur ${statusCode} occurred on server`
        : `An error occurred on client`}
    </Layout>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
