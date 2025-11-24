import AiHelper from "../helpers/ai.helper.js";

class WorkflowService {
  constructor(server) {
    this.server = server;
    this.prisma = this.server.model.db;
    this.ai = new AiHelper();
  }


  async create(userId, data) {
    // data.steps diharapkan array of agentId: [1, 4, 2]
    const { name, description, steps } = data;

    return await this.prisma.$transaction(async (tx) => {
      // Buat Header Workflow
      const workflow = await tx.Workflows.create({
        data: {
          name,
          description,
          user_id: userId
        }
      });

      // Buat Steps (Looping agentIds)
      if (steps && steps.length > 0) {
        const stepData = steps.map((agentId, index) => ({
          workflow_id: workflow.id,
          agent_id: agentId,
          step_order: index + 1
        }));

        await tx.Workflows_Steps.createMany({ data: stepData });
      }

      return workflow;
    });
  }

  // 2. ENGINE EKSEKUSI WORKFLOW (Chain Logic)
  async execute(workflowId, initialInput) {
    // A. Create Execution Session (Status: Running)
    const execution = await this.prisma.Workflow_Executions.create({
      data: {
        workflow_id: parseInt(workflowId),
        status: "Running"
      }
    });

    // B. Ambil semua steps urut berdasarkan step_order
    const steps = await this.prisma.Workflows_Steps.findMany({
      where: { workflow_id: parseInt(workflowId) },
      orderBy: { step_order: 'asc' },
      include: { agent: true } // Join ke tabel Agent untuk ambil prompt
    });

    let currentInput = initialInput;
    let isFailed = false;

    // C. Loop Eksekusi (Chain)
    for (const step of steps) {
      if (isFailed) break;

      try {
        // Catat Log Awal (Pending/Running)
        const log = await this.prisma.Execution_Logs.create({
          data: {
            execution_id: execution.id,
            step_id: step.id,
            status: "Running",
            input_data: currentInput
          }
        });

        // Panggil AI
        const aiResponse = await this.ai.generate(
          step.agent.model,
          step.agent.prompt,
          currentInput,
          Number(step.agent.Temperature)
        );

        // Update Log Sukses
        await this.prisma.Execution_Logs.update({
          where: { id: log.id },
          data: {
            status: "Completed",
            output_data: aiResponse
          }
        });

        // Output jadi Input step selanjutnya
        currentInput = aiResponse;

      } catch (error) {
        isFailed = true;
        // Update Log Gagal
        await this.prisma.Execution_Logs.create({
          data: {
            execution_id: execution.id,
            step_id: step.id,
            status: "Failed",
            input_data: currentInput,
            error_message: error.message
          }
        });
      }
    }

    // D. Update Status Akhir Eksekusi
    await this.prisma.Workflow_Executions.update({
      where: { id: execution.id },
      data: {
        status: isFailed ? "Failed" : "Completed"
      }
    });

    // Kembalikan hasil akhir dan ID eksekusi
    return { executionId: execution.id, finalOutput: currentInput, status: isFailed ? "Failed" : "Completed" };
  }

  // Fungsi History: Melihat Log Eksekusi
  async getHistory(executionId) {
    return await this.prisma.Workflow_Executions.findUnique({
      where: { id: parseInt(executionId) },
      include: {
        execution_log: {
          orderBy: { id: 'asc' },
          include: { workflow_step: { include: { agent: true } } }
        }
      }
    });
  }
}

export default WorkflowService;