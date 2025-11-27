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

    this.API.post(this.routePrefix, this.auth.check(),
      (req, res) => this.WorkflowController.create(req, res)
    );

    this.API.post(this.routePrefix + '/:id/steps', this.auth.check(),
      (req, res) => this.WorkflowController.addStep(req, res)
    );

    this.API.post(this.routePrefix + '/:id/execute', this.auth.check(),
      (req, res) => this.WorkflowController.execute(req, res)
    );

    this.API.get(this.routePrefix, this.auth.check(),
      (req, res) => this.WorkflowController.getAll(req, res)
    );

    this.API.get(this.routePrefix + '/executions/:id', this.auth.check(),
      (req, res) => this.WorkflowController.getHistory(req, res)
    );

    this.API.put(this.routePrefix + '/:id', this.auth.check(),
      (req, res) => this.WorkflowController.update(req, res)
    );

    this.API.delete(this.routePrefix + '/:id', this.auth.check(),
      (req, res) => this.WorkflowController.delete(req, res)
    );
  }
}

export default WorkflowRoute;