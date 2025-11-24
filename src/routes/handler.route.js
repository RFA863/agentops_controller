import AuthRoute from './auth.route.js';
import AgentRoute from './agent.route.js';
import WorkflowRoute from './workflow.route.js';

class HandlerRoute {
  constructor(server) {
    new AuthRoute(server);
    new AgentRoute(server);
    new WorkflowRoute(server);
  }
}

export default HandlerRoute;