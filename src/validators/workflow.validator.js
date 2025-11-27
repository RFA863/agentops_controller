class WorkflowValidator {
  // Validasi saat membuat Workflow (Hanya Nama & Deskripsi)
  create = {
    type: "object",
    properties: {
      name: {
        type: "string",
        maxLength: 100,
        minLength: 3,
      },
      description: {
        type: "string",
      }
    },
    required: ["name"],
    additionalProperties: false
  };

  // Validasi saat menambahkan Step (Data Agent)
  addStep = {
    type: "object",
    properties: {
      name: { // Nama Agent
        type: "string",
        maxLength: 100,
        minLength: 3,
      },
      model: {
        type: "string",
        maxLength: 100,
        minLength: 1,
      },
      prompt: {
        type: "string",
        minLength: 10,
      },
      temperature: {
        type: "number",
        minimum: 0.0,
        maximum: 2.0,
      }
    },
    required: ["name", "model", "prompt", "temperature"],
    additionalProperties: false
  };
}

export default WorkflowValidator;