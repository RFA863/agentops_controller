class AgentService {
  constructor(server) {
    this.server = server;
    this.model = this.server.model.db;
  }

  async create(data) {
    const createAgent = await this.model.Agents.create({
      data: {
        name: data.name,
        model: data.model,
        prompt: data.prompt,
        Temperature: data.temperature
      }
    });

    return createAgent;
  }

  async getAll() {
    const getAgent = await this.model.Agents.findMany();

    if (getAgent.length === 0) return -1

    return getAgent;
  }

  async getById(id) {
    const getAgentById = await this.model.Agents.findUnique({
      where: {
        id: id
      }
    });

    if (!getAgentById) return -1

    return getAgentById;
  }

  async update(id, data) {
    const getAgentById = await this.model.Agents.findUnique({
      where: {
        id: id
      }
    });

    if (!getAgentById) return -1

    const updateAgent = await this.model.Agents.update({
      where: {
        id: id
      },
      data: {
        name: data.name,
        model: data.model,
        prompt: data.prompt,
        Temperature: data.temperature
      }
    })

    return updateAgent;

  }

  async delete(id) {

    const getAgentById = await this.model.Agents.findUnique({
      where: {
        id: id
      }
    });

    if (!getAgentById) return -1

    const deleteAgent = await this.model.Agents.delete({ where: { id: id } });

    return deleteAgent;
  }
}

export default AgentService;