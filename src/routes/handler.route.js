import AuthRoute from './auth.route.js';

class HandlerRoute {
  constructor(server) {
    new AuthRoute(server);
  }
}

export default HandlerRoute;