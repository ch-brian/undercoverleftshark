import React, { lazy } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import AuthRoute from './routes/AuthRoute.jsx';
import PageNotFound from './components/PageNotFound.jsx';
import Login from './pages/authentication/Login';
const Admin = lazy(() => import('./pages/admin/Admin.jsx'));
const AdminUserProfile = lazy(() =>
  import('./pages/admin/AdminUserProfile.jsx')
);
const UserExperiences = lazy(() =>
  import('./pages/experience/UserExperiences.jsx')
);
const AdminExperiencesContainer = lazy(() =>
  import('./pages/admin/AdminExperiencesContainer.jsx')
);
const AdminUsersContainer = lazy(() =>
  import('./pages/admin/AdminUsersContainer.jsx')
);
const DashboardContainer = lazy(() =>
  import('./v2/dashboard/DashboardContainer')
);
const POI = lazy(() => import('./v2/dashboard/POI/POI'));
const Hotspot = lazy(() => import('./v2/dashboard/Hotspot/Hotspot'));

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

const AppRouter = (props) => {
  const { loading, error, data } = useQuery(GET_USER_FROM_COOKIE, {
    fetchPolicy: 'network-only'
  });
  if (error) console.log(data);
  if (loading) return <p>loading...</p>;

  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route exact path="/">
          {error || data.getUserFromCookie == null ? (
            <Redirect to="/login" />
          ) : (
            <Redirect to="/home" />
          )}
        </Route>
        <AuthRoute path="/home" component={UserExperiences} />
        <AuthRoute exact path="/admin" component={Admin} authRole="Admin" />
        <AuthRoute
          path="/admin/user/:name"
          component={AdminUserProfile}
          authRole="Admin"
        />
        <AuthRoute
          exact
          path="/admin/experiences"
          component={AdminExperiencesContainer}
          authRole="Admin"
        />
        <AuthRoute
          path="/admin/users"
          component={AdminUsersContainer}
          authRole="Admin"
        />
        <AuthRoute
          path="/admin/experiences/:name/:poi/:hotspot"
          authRole="Admin"
          component={Hotspot}
        />
        <AuthRoute
          path="/admin/experiences/:name/:poi"
          authRole="Admin"
          component={POI}
        />
        <AuthRoute
          path="/admin/experiences/:name"
          authRole="Admin"
          component={DashboardContainer}
        />
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
