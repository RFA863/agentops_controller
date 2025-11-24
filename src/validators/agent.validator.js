class AgentValidator {
  input = {
    type: "object",
    properties: {
      name: {
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
        maximum: 1.0,
      }
    },
    required: ["name", "model", "prompt", "temperature"],
    additionalProperties: false
  };
}

export default AgentValidator;