import Ajv from "ajv";
import WorkflowService from "../services/workflow.service.js";
import WorkflowValidator from "../validators/workflow.validator.js";
import ResponsePreset from "../helpers/responsePreset.helper.js";

class WorkflowController {
  constructor(server) {
    this.server = server;
    this.ajv = new Ajv();
    this.responsePreset = new ResponsePreset();
    this.WorkflowValidator = new WorkflowValidator();
    this.workflowService = new WorkflowService(this.server);
  }


  async create(req, res) {
    try {
      const schemaValidate = this.ajv.compile(this.WorkflowValidator.create);

      if (!schemaValidate(req.body)) {
        return res.status(400).json(this.responsePreset.resErr(
          400, schemaValidate.errors[0].message, 'validator', schemaValidate.errors[0]
        ));
      }

      const userId = req.middlewares.authorization.userid;
      const result = await this.workflowService.create(userId, req.body);

      return res.status(201).json(this.responsePreset.resOK("Workflow Created", result));
    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }


  async addStep(req, res) {
    try {
      const schemaValidate = this.ajv.compile(this.WorkflowValidator.addStep);

      if (!schemaValidate(req.body)) {
        return res.status(400).json(this.responsePreset.resErr(
          400, schemaValidate.errors[0].message, 'validator', schemaValidate.errors[0]
        ));
      }

      const workflowId = req.params.id;
      const result = await this.workflowService.addStep(workflowId, req.body);

      if (result === -1) {
        return res.status(404).json(this.responsePreset.resErr(
          404, "Workflow Not Found", "service", { code: -1 }
        ));
      }

      return res.status(201).json(this.responsePreset.resOK("Step Added Successfully", result));
    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }


  async execute(req, res) {
    try {
      const id = req.params.id;
      const { input } = req.body;

      if (!input) {
        return res.status(400).json(this.responsePreset.resErr(
          400, "Input is required", "validator", { code: -1 }
        ));
      }

      const result = await this.workflowService.execute(id, input);

      if (result === -1) return res.status(404).json(this.responsePreset.resErr(404, "Workflow Not Found", "service"));
      if (result === -2) return res.status(400).json(this.responsePreset.resErr(400, "Workflow has no steps", "service"));

      return res.status(200).json(this.responsePreset.resOK("Execution Finished", result));
    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }

  async getAll(req, res) {
    try {
      const userId = req.middlewares.authorization.userid;
      const result = await this.workflowService.getAll(userId);

      return res.status(200).json(this.responsePreset.resOK("Success", result));
    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }

  async getHistory(req, res) {
    try {
      const result = await this.workflowService.getHistory(req.params.id);

      if (result === -1) {
        return res.status(404).json(this.responsePreset.resErr(
          404, "Execution ID Not Found", "service", { code: -1 }
        ));
      }

      return res.status(200).json(this.responsePreset.resOK("History Data", result));
    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const result = await this.workflowService.update(id, req.body);
      return res.status(200).json(this.responsePreset.resOK("Workflow Updated", result));
    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      await this.workflowService.delete(id);
      return res.status(200).json(this.responsePreset.resOK("Workflow and Agents Deleted"));
    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }
}

export default WorkflowController;