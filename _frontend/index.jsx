import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider, ApolloClient, from } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { cache } from './cache';
import { onError } from '@apollo/client/link/error';
import './index.css';

import AppRouter from './AppRouter.jsx';
// errorlink to describe graphql errors in console.
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

// uploadlink to allow us the ability to upload files from frontend to server
const ulLink = createUploadLink({
  uri: '/graphql',
  credentials: 'include'
});

const link = from([errorLink, ulLink]);

const client = new ApolloClient({
  link,
  cache: cache
});

ReactDOM.render(
  <Suspense fallback={<div>loading...</div>}>
    <ApolloProvider client={client}>
      <AppRouter />
    </ApolloProvider>
  </Suspense>,
  document.getElementById('root')
);
