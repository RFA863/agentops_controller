import WorkflowController from "../controllers/workflow.controller.js";
import AuthorizationMiddleware from "../middlewares/authorization.middleware.js";

class WorkflowRoute {
  constructor(server) {
    this.server = server;
    this.API = this.server.API;
    this.routePrefix = '/workflows';
    this.controller = new WorkflowController(this.server);
    this.auth = new AuthorizationMiddleware(this.server);
    this.route();
  }

  route() {
    // Create Workflow (Header + Steps)
    this.API.post(this.routePrefix, this.auth.check(), (req, res) => this.controller.create(req, res));

    // Execute Workflow (Trigger)
    this.API.post(this.routePrefix + '/:id/execute', this.auth.check(), (req, res) => this.controller.execute(req, res));

    // Get Execution Detail (History logs)
    this.API.get('/executions/:id', this.auth.check(), (req, res) => this.controller.getHistory(req, res));
  }
}

export default WorkflowRoute;