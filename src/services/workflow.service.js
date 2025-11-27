import AiHelper from "../helpers/ai.helper.js";

class WorkflowService {
  constructor(server) {
    this.server = server;
    this.model = this.server.model.db;
    this.ai = new AiHelper();
  }


  async create(userId, data) {
    const createWorkflow = await this.model.Workflows.create({
      data: {
        name: data.name,
        description: data.description,
        user_id: userId
      }
    });

    return createWorkflow;
  }


  async addStep(workflowId, agentData) {

    const workflow = await this.model.Workflows.findUnique({
      where: { id: parseInt(workflowId) }
    });

    if (!workflow) return -1;

    const lastStep = await this.model.Workflows_Steps.findFirst({
      where: { workflow_id: parseInt(workflowId) },
      orderBy: { step_order: 'desc' }
    });

    const nextOrder = lastStep ? lastStep.step_order + 1 : 1;


    return await this.model.$transaction(async (tx) => {

      const newAgent = await tx.Agents.create({
        data: {
          name: agentData.name,
          model: agentData.model,
          prompt: agentData.prompt,
          Temperature: agentData.temperature
        }
      });


      const newStep = await tx.Workflows_Steps.create({
        data: {
          workflow_id: parseInt(workflowId),
          agent_id: newAgent.id,
          step_order: nextOrder
        },
        include: {
          agent: true
        }
      });

      return newStep;
    });
  }


  async execute(workflowId, initialInput) {

    const workflow = await this.model.Workflows.findUnique({
      where: { id: parseInt(workflowId) }
    });
    if (!workflow) return -1;


    const execution = await this.model.Workflow_Executions.create({
      data: {
        workflow_id: parseInt(workflowId),
        status: "Running"
      }
    });


    const steps = await this.model.Workflows_Steps.findMany({
      where: { workflow_id: parseInt(workflowId) },
      orderBy: { step_order: 'asc' },
      include: { agent: true }
    });

    if (steps.length === 0) return -2;

    let currentInput = initialInput;
    let isFailed = false;


    for (const step of steps) {
      if (isFailed) break;

      try {
        const log = await this.model.Execution_Logs.create({
          data: {
            execution_id: execution.id,
            step_id: step.id,
            status: "Running",
            input_data: currentInput
          }
        });


        const temp = step.agent.Temperature ? Number(step.agent.Temperature) : 0.7;

        const aiResponse = await this.ai.generate(
          step.agent.model,
          step.agent.prompt,
          currentInput,
          temp
        );

        if (aiResponse === -1) throw new Error("AI Service Error");

        await this.model.Execution_Logs.update({
          where: { id: log.id },
          data: {
            status: "Completed",
            output_data: aiResponse
          }
        });

        currentInput = aiResponse;

      } catch (error) {
        isFailed = true;
        await this.model.Execution_Logs.create({
          data: {
            execution_id: execution.id,
            step_id: step.id,
            status: "Failed",
            input_data: currentInput,
            error_message: error.message || "Unknown Error"
          }
        });
      }
    }

    await this.model.Workflow_Executions.update({
      where: { id: execution.id },
      data: { status: isFailed ? "Failed" : "Completed" }
    });

    return {
      executionId: execution.id,
      finalOutput: isFailed ? null : currentInput,
      status: isFailed ? "Failed" : "Completed"
    };
  }

  async getAll(userId) {
    return await this.model.Workflows.findMany({
      where: { user_id: userId },
      include: {
        workflow_step: {
          orderBy: { step_order: 'asc' },
          include: { agent: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }


  async getHistory(executionId) {
    const history = await this.model.Workflow_Executions.findUnique({
      where: { id: parseInt(executionId) },
      include: {
        execution_log: {
          orderBy: { id: 'asc' },
          include: { workflow_step: { include: { agent: true } } }
        }
      }
    });

    if (!history) return -1;
    return history;
  }

  async update(id, data) {
    return await this.model.Workflows.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
      }
    });
  }


  async delete(id) {
    const workflowId = parseInt(id);


    const steps = await this.model.Workflows_Steps.findMany({
      where: { workflow_id: workflowId },
      select: { agent_id: true }
    });

    const agentIds = steps.map(s => s.agent_id);


    return await this.model.$transaction(async (tx) => {

      const deletedWorkflow = await tx.Workflows.delete({
        where: { id: workflowId }
      });


      if (agentIds.length > 0) {
        await tx.Agents.deleteMany({
          where: { id: { in: agentIds } }
        });
      }

      return deletedWorkflow;
    });
  }

}

export default WorkflowService;