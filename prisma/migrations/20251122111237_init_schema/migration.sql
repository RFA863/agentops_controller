-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Pending', 'Running', 'Completed', 'Failed');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agents" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "prompt" TEXT NOT NULL,
    "Temperature" DECIMAL(3,1) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflows" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflows_Steps" (
    "id" SERIAL NOT NULL,
    "step_order" INTEGER NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflows_Steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow_Executions" (
    "id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_Executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution_Logs" (
    "id" SERIAL NOT NULL,
    "execution_id" INTEGER NOT NULL,
    "step_id" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Pending',
    "input_data" TEXT NOT NULL,
    "output_data" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Execution_Logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Workflows_Steps_updated_at_key" ON "Workflows_Steps"("updated_at");

-- AddForeignKey
ALTER TABLE "Workflows" ADD CONSTRAINT "Workflows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflows_Steps" ADD CONSTRAINT "Workflows_Steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "Workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflows_Steps" ADD CONSTRAINT "Workflows_Steps_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow_Executions" ADD CONSTRAINT "Workflow_Executions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "Workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution_Logs" ADD CONSTRAINT "Execution_Logs_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Workflow_Executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution_Logs" ADD CONSTRAINT "Execution_Logs_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "Workflows_Steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
