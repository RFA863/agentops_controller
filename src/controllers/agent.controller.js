import Ajv from "ajv";

import AgentService from "../services/agent.service.js";
import AgentValidator from "../validators/agent.validator.js";
import ResponsePreset from "../helpers/responsePreset.helper.js";

class AgentController {
  constructor(server) {
    this.server = server;
    this.ajv = new Ajv();
    this.responsePreset = new ResponsePreset();
    this.AgentValidator = new AgentValidator();
    this.agentService = new AgentService(this.server);
  }

  async create(req, res) {
    try {
      const schemaValidate = this.ajv.compile(this.AgentValidator.input);

      if (!schemaValidate(req.body))
        return res.status(400).json(this.responsePreset.resErr(
          400, schemaValidate.errors[0].message, 'validator, ', schemaValidate.errors[0]
        ));

      const data = req.body

      const createSrv = await this.agentService.create(data);

      return res.status(200).json(this.responsePreset.resOK("Success", createSrv));

    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }

  async getAll(req, res) {
    try {
      const getAllSrv = await this.agentService.getAll();

      if (getAllSrv === -1)
        return res.status(404).json(this.responsePreset.resErr(
          404, 'No Agents yet', 'service', { code: -1 }
        ));

      return res.status(200).json(this.responsePreset.resOK("Success", getAllSrv));

    } catch (err) {

      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }

  async getById(req, res) {
    try {
      const id = req.params.id;

      const getByIdSrv = await this.agentService.getById(id);

      if (getByIdSrv === -1)
        return res.status(404).json(this.responsePreset.resErr(
          404, "Agent Id Not Found", "service", { code: -1 }
        ));

      return res.status(200).json(this.responsePreset.resOK("Success", getByIdSrv));

    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }

  async update(req, res) {
    try {
      const schemaValidate = this.ajv.compile(this.AgentValidator.input);

      if (!schemaValidate(req.body))
        return res.status(400).json(this.responsePreset.resErr(
          400, schemaValidate.errors[0].message, 'validator, ', schemaValidate.errors[0]
        ));

      const id = req.params.id;
      const data = req.body;

      const updateSrv = await this.agentService.update(id, data)

      if (updateSrv === -1)
        return res.status(404).json(this.responsePreset.resErr(
          404, "Agent Id Not Found", "service", { code: -1 }
        ));

      return res.status(200).json(this.responsePreset.resOK("Success", updateSrv))

    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id

      const deleteSrv = await this.agentService.delete(id);

      if (deleteSrv === -1)
        return res.status(404).json(this.responsePreset.resErr(
          404, "Agent Id Not Found", "service", { code: -1 }
        ));

      return res.status(200).json(this.responsePreset.resOK("Success", deleteSrv));

    } catch (err) {
      return res.status(500).json(this.responsePreset.resErr(500, err.message, "server", err));
    }

  }

}

export default AgentController;