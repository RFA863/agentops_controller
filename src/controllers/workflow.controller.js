import WorkflowService from "../services/workflow.service.js";
import ResponsePreset from "../helpers/responsePreset.helper.js";

class WorkflowController {
  constructor(server) {
    this.server = server;
    this.service = new WorkflowService(this.server);
    this.responsePreset = new ResponsePreset();
  }

  async create(req, res) {
    try {
      const userId = req.middlewares.authorization.userid; // Dari Auth Middleware
      const result = await this.service.create(userId, req.body);
      return res.status(201).json(this.responsePreset.resOK("Workflow Created", result));
    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server"));
    }
  }

  async execute(req, res) {
    try {
      const { id } = req.params; // Workflow ID
      const { input } = req.body; // User Input awal

      // Jalankan eksekusi (bisa dibuat async/background job kalau mau response cepat)
      const result = await this.service.execute(id, input);

      return res.status(200).json(this.responsePreset.resOK("Execution Finished", result));
    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server"));
    }
  }

  async getHistory(req, res) {
    const result = await this.service.getHistory(req.params.id);
    return res.status(200).json(this.responsePreset.resOK("History Data", result));
  }
}

export default WorkflowController;