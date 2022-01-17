import { ApolloClient, InMemoryCache } from '@apollo/client';

const apolloClient = {
  instance: new ApolloClient({
    uri: `https://zq7iyke0.api.sanity.io/v1/graphql/production/default`,
    cache: new InMemoryCache(),
  }),
};

Object.freeze(apolloClient);

export default apolloClient;
