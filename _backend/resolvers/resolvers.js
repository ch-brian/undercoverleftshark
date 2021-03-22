import jwt from 'jsonwebtoken';
import experienceResolvers from './resolvers/experienceResolvers';
import mediaResolvers from './resolvers/media/mediaResolvers';
import dashboardResolvers from './resolvers/dashboardResolvers';
import testQuery from './resolvers/testQuery';

export const resolvers = {
  Query: {
    ...testQuery.Query,
    ...experienceResolvers.Query,
    ...dashboardResolvers.Query,
    getUserFromCookie: async (parent, args, context, info) => {
      // verify jwt token against jwt secret key
      const token = context.req.cookies.accessToken;
      const loggedin = context.req.cookies.loginToken;
      if (!token || !loggedin) return null;
      const db = context.db;
      const user = await jwt.verify(token, process.env.JWT_SECRET_KEY);

      // make sure user is still in database
      const data = await db
        .collection('users')
        .find({ fbUUID: user.fbUUID })
        .toArray();

      if (data[0] === undefined) return null;
      return data[0];
    },
    getUserByUUID: async (parent, args, context, info) => {
      const UUID = args.fbUUID;
      console.log('getUserByUUID: ', UUID);
      const db = context.db;

      // make sure user is still in database
      const data = await db
        .collection('users')
        .find({ fbUUID: UUID })
        .toArray();
      console.log(data[0].experiences);
      if (data[0] === undefined) return null;
      return data[0];
    }
  },

  Mutation: {
    ...experienceResolvers.Mutation,
    ...mediaResolvers.Mutation,
    ...dashboardResolvers.Mutation,
    authAndRegister: async (parent, args, context, info) => {
      const data = await context.db.collection('users').findOneAndUpdate(
        {
          fbUUID: args.input.fbUUID,
          fbEmail: args.input.fbEmail
        },
        {
          $set: {
            fbUUID: args.input.fbUUID,
            fbEmail: args.input.fbEmail,
            name: args.input.name
          }
        },
        { returnOriginal: false, upsert: true }
      );
      const User = {
        fbEmail: data.value.fbEmail,
        fbUUID: data.value.fbUUID,
        role: data.value.role,
        experiences: data.value.experiences ? data.value.experiences : [{}]
      };
      const accessToken = jwt.sign(User, process.env.JWT_SECRET_KEY, {
        expiresIn: '2d'
      });
      const loggedinToken = jwt.sign(
        { login: 'loggedin' },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: '2d'
        }
      );
      context.res.cookie('accessToken', accessToken, { httpOnly: true });
      context.res.cookie('loginToken', loggedinToken);
      return User;
    }
  }
};
