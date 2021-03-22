require('dotenv').config();
import { ApolloServer, gql } from 'apollo-server-express';
import { typeDefs } from './cms_graphql/typeDefs';
import { resolvers } from './cms_graphql/resolvers';
import express from 'express';
import mongodb from 'mongodb';
import path from 'path';
import cookieParser from 'cookie-parser';
import isAuthDirective from './cms_graphql/directives/isAuthDirective';
const app = express();

const dbString = process.env.NODE_ENV === 'production' ? 'veep' : 'veep-dev';

// We will assign the database globally here to prevent unnecessary reconnects on subsequent http requests.
// See ApolloServer context declaration for clarity on how this works.
let db;

const port = process.env.PORT || 4000;

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build/')));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    isAuth: isAuthDirective
  },
  context: async ({ req, res }) => {
    // if the db is not already connected - connect to mongodb
    if (!db) {
      try {
        console.log('Connecting to MongoDB Atlas');
        const MongoClient = mongodb.MongoClient(process.env.ATLAS_URI_INHANCE, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        if (!MongoClient.isConnected()) await MongoClient.connect();
        db = MongoClient.db(dbString);
        console.log('CONNECTED TO ATLAS');
      } catch (err) {
        console.log('ERROR WHILE CONNECTING WITH GRAPHQL CONTEXT DB', err);
      }
    }
    return { req, res, db };
  },
  formatError: (err) => {
    // Don't give the specific errors to the client.
    if (err.message.startsWith('Database Error: ')) {
      return new Error('Internal server error');
    }
    // Otherwise return the original error.  The error can also
    // be manipulated in other ways, so long as it's returned.
    return err;
  }
});

server.applyMiddleware({
  app,
  cors: false,
  // troubleshooting filesize limiations of Google Cloud Run.
  // investigate direct invocation of GCS API within resolvers.
  bodyParserConfig: {
    limit: '1000mb'
  }
});

app.get('/testme', (req, res) => {
  res.status(200).send({ message: 'success' });
});

app.get('/*', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../src/index.html'));
});

app.use('*', (req, res) => {
  res.status(404).send('Page Not Found');
});

// Generic error handler
app.use((err, req, res, next) => {
  console.log(next);
  const errorObj = {
    log: 'Express error handler caught unknown error',
    status: 400,
    message: { err: 'error occurred' }
  };
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
