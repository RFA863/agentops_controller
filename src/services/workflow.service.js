import AiHelper from "../helpers/ai.helper.js";

class WorkflowService {
  constructor(server) {
    this.server = server;
    this.model = this.server.model.db; // Style disamakan: this.model
    this.ai = new AiHelper();
  }

  // 1. Create Workflow Header Only
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

  // 2. Add Step (Create Agent & Link to Workflow)
  async addStep(workflowId, agentData) {
    // Cek apakah workflow ada
    const workflow = await this.model.Workflows.findUnique({
      where: { id: parseInt(workflowId) }
    });

    if (!workflow) return -1;

    // Hitung urutan step (step_order)
    const lastStep = await this.model.Workflows_Steps.findFirst({
      where: { workflow_id: parseInt(workflowId) },
      orderBy: { step_order: 'desc' }
    });

    const nextOrder = lastStep ? lastStep.step_order + 1 : 1;

    // Transaction: Buat Agent -> Buat Step
    return await this.model.$transaction(async (tx) => {
      // A. Buat Agent
      const newAgent = await tx.Agents.create({
        data: {
          name: agentData.name,
          model: agentData.model,
          prompt: agentData.prompt,
          Temperature: agentData.temperature
        }
      });

      // B. Buat Workflow Step
      const newStep = await tx.Workflows_Steps.create({
        data: {
          workflow_id: parseInt(workflowId),
          agent_id: newAgent.id,
          step_order: nextOrder
        },
        include: {
          agent: true // Return data agent yang baru dibuat
        }
      });

      return newStep;
    });
  }

  // 3. Execute Workflow
  async execute(workflowId, initialInput) {
    // Validasi Workflow
    const workflow = await this.model.Workflows.findUnique({
      where: { id: parseInt(workflowId) }
    });
    if (!workflow) return -1;

    // A. Create Execution Session
    const execution = await this.model.Workflow_Executions.create({
      data: {
        workflow_id: parseInt(workflowId),
        status: "Running"
      }
    });

    // B. Ambil steps
    const steps = await this.model.Workflows_Steps.findMany({
      where: { workflow_id: parseInt(workflowId) },
      orderBy: { step_order: 'asc' },
      include: { agent: true }
    });

    if (steps.length === 0) return -2; // Error: Workflow kosong

    let currentInput = initialInput;
    let isFailed = false;

    // C. Loop Eksekusi
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

        // Konversi Decimal ke Number untuk AI Helper
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
}

export default WorkflowService;