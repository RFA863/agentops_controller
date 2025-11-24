import AgentController from "../controllers/agent.controller.js";
import AuthorizationMiddleware from "../middlewares/authorization.middleware.js";

class AgentRoute {
  constructor(server) {
    this.server = server;
    this.API = this.server.API;
    this.routePrefix = '/agents';
    this.AgentController = new AgentController(this.server);
    this.auth = new AuthorizationMiddleware(this.server);
    this.route();
  }

  route() {
    this.API.post(this.routePrefix + "/create", this.auth.check(),
      (req, res) => this.AgentController.create(req, res)
    );

    this.API.get(this.routePrefix + "/get", this.auth.check(),
      (req, res) => this.AgentController.getAll(req, res)
    );

    this.API.get(this.routePrefix + "/get/:id", this.auth.check(),
      (req, res) => this.AgentController.getById(req, res)
    );

    this.API.put(this.routePrefix + "/update/:id", this.auth.check(),
      (req, res) => this.AgentController.update(req, res)
    );

    this.API.delete(this.routePrefix + "/delete/:id", this.auth.check(),
      (req, res) => this.AgentController.delete(req, res)
    );
  }
}

export default AgentRoute;