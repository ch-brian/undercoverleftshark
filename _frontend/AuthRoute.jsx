import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import SideNavbar from '../components/SideNavbar.jsx';
import BottomNavbar from '../components/BottomNavbar.jsx';

const GET_USER_FROM_COOKIE = gql`
  {
    getUserFromCookie {
      fbEmail
      fbUUID
      name
      role
      experiences {
        name
      }
    }
  }
`;

const AuthRoute = ({ component: Component, ...rest }) => {
  const { loading, error, data } = useQuery(GET_USER_FROM_COOKIE, {
    fetchPolicy: 'network-only'
  });
  if (error) console.log(data);
  if (loading) return <p>loading...</p>;
  const { authRole, authExperience } = rest;
  const user = data?.getUserFromCookie;

  // when the query errors - jwt is expired or something just went wrong - log in again
  // otherwise no cookie user was found - log in again
  return (
    <Route
      {...rest}
      render={(props) => {
        if (error || data.getUserFromCookie == null) {
          // if not logged in - log in
          return <Redirect to="/login" />;
        } else if (
          // if not authorized for access - authorize for access
          (authRole && user.role !== authRole) ||
          (authExperience && user.experiences.indexOf(authExperience) == -1)
        ) {
          return (
            <h3>
              Please request access to this resource from your administrator
            </h3>
          );
        } else if (authRole == 'Admin') {
          // return requested resource
          return (
            <div className="flex flex-row h-full">
              <SideNavbar {...props} user={user} />
              <div className="flex flex-1 w-screen h-screen overflow-hidden text-gray-700 bg-gray-200">
                <div className="flex-1 px-16 py-16 mx-auto overflow-y-auto">
                  <Component {...props} user={user} />
                </div>
              </div>
              <BottomNavbar {...props} user={user} />
            </div>
          );
        }
        return (
          <div className="flex flex-row h-full">
            <SideNavbar {...props} user={user} />
            <div className="flex flex-1 w-screen h-screen overflow-hidden text-gray-700 bg-gray-200">
              <div className="flex-1 px-16 py-16 mx-auto overflow-y-auto">
                <Component {...props} user={user} />
              </div>
            </div>
            <BottomNavbar {...props} user={user} />
          </div>
        );
      }}
    />
  );
};

export default AuthRoute;
