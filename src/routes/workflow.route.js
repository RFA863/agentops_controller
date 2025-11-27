import WorkflowController from "../controllers/workflow.controller.js";
import AuthorizationMiddleware from "../middlewares/authorization.middleware.js";

class WorkflowRoute {
  constructor(server) {
    this.server = server;
    this.API = this.server.API;
    this.routePrefix = '/workflows';

    // Style disamakan: inisialisasi controller di constructor
    this.WorkflowController = new WorkflowController(this.server);
    this.auth = new AuthorizationMiddleware(this.server);

    this.route();
  }

  route() {
    // 1. Create Workflow (Header only)
    this.API.post(this.routePrefix, this.auth.check(),
      (req, res) => this.WorkflowController.create(req, res)
    );

    // 2. Add Step / Agent to Workflow
    // Endpoint: POST /workflows/:id/steps
    this.API.post(this.routePrefix + '/:id/steps', this.auth.check(),
      (req, res) => this.WorkflowController.addStep(req, res)
    );

    // 3. Execute Workflow
    this.API.post(this.routePrefix + '/:id/execute', this.auth.check(),
      (req, res) => this.WorkflowController.execute(req, res)
    );

    // 4. Get History
    this.API.get('/executions/:id', this.auth.check(),
      (req, res) => this.WorkflowController.getHistory(req, res)
    );
  }
}

export default WorkflowRoute;