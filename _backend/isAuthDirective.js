import { SchemaDirectiveVisitor } from "apollo-server-express";
import { defaultFieldResolver } from "graphql";
import jwt from "jsonwebtoken";

// this Directive checks the submitted JWT on the HTTP request for role
class isAuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    // extract role from isAdmin parameters
    const { role } = this.args;
    field.resolve = async function (...args) {
      // destructure context out of the second index of args coming in to the directive and grab the cookie from the http request
      const { req, res, db } = args[2];
      const accessToken = req.cookies.accessToken;
      const loginToken = req.cookies.loginToken;
      const user = await jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
      const login = await jwt.verify(loginToken, process.env.JWT_SECRET_KEY);
      console.log("authDirective: ", login);
      if (!login || login.login != "loggedin") {
        throw new Error("You are not logged in");
      }

      if (user.role !== role) {
        throw new Error("This is above your pay grade");
      }

      return resolve.apply(this, args);
    };
  }
}

export default isAuthDirective;
