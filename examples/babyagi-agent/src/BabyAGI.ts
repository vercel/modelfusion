import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import { OpenAITextGenerationModel, generateText } from "modelfusion";

dotenv.config();

const program = new Command();

program
  .description("BabyAGI")
  .requiredOption("-o, --objective <value>", "Objective")
  .parse(process.argv);

const { objective } = program.opts();

runBabyAGI({
  objective,
  firstTask: "Develop a task list.",
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

async function runBabyAGI({
  objective,
  firstTask,
}: {
  objective: string;
  firstTask: string;
}) {
  const model = new OpenAITextGenerationModel({
    model: "text-davinci-003",
  });

  async function executeTask({
    objective,
    task,
  }: {
    objective: string;
    task: string;
  }) {
    const result = await generateText(
      model,
      [
        `You are an AI who performs one task based on the following objective: ${objective}. Your task: ${task}`,
        `Response:`,
      ].join("\n"),
      { settings: { temperature: 0.7, maxTokens: 2000 } }
    );
    return result.text;
  }

  async function generateNewTasks({
    objective,
    completedTask,
    completedTaskResult,
    existingTasks,
  }: {
    objective: string;
    completedTask: string;
    completedTaskResult: string;
    existingTasks: string[];
  }) {
    const { text: newTasksText } = await generateText(
      model,
      [
        `You are an task creation AI that uses the result of an execution agent to create new tasks with the following objective: ${objective}.`,
        `The last completed task has the result: ${completedTaskResult}.`,
        `This result was based on this task description: ${completedTask}.`,
        `These are the incomplete tasks: ${existingTasks.join(", ")}.`,
        `Based on the result, create new tasks to be completed by the AI system that do not overlap with incomplete tasks.`,
        `Return the tasks as an array.`,
      ].join("\n"),
      { settings: { temperature: 0.5, maxTokens: 100 } }
    );

    return newTasksText.split("\n");
  }

  async function prioritizeTasks({
    tasks,
    objective,
    nextTaskId,
  }: {
    tasks: string[];
    objective: string;
    nextTaskId: number;
  }) {
    const { text: prioritizedTasksText } = await generateText(
      model,
      [
        `You are an task prioritization AI tasked with cleaning the formatting of and reprioritizing the following tasks:`,
        tasks.join(", "),
        `Consider the ultimate objective of your team: ${objective}.`,
        `Do not remove any tasks.`,
        `Return the result as a numbered list, like:`,
        `#. First task`,
        `#. Second task`,
        `Start the task list with number ${nextTaskId}.`,
      ].join("\n"),
      { settings: { temperature: 0.5, maxTokens: 1000 } }
    );

    return prioritizedTasksText.split("\n").map((task) => {
      const [_idPart, ...rest] = task.trim().split(".");
      return rest.join(".").trim();
    });
  }

  let tasks = [{ id: 1, name: firstTask }];
  let taskIdCounter = 1;

  // Print objective
  console.log(chalk.bold(chalk.magenta("\n*****OBJECTIVE*****\n")));
  console.log(objective);

  while (tasks.length > 0) {
    // Print the task list
    console.log(chalk.bold(chalk.magenta("\n*****TASK LIST*****\n")));
    for (const task of tasks) {
      console.log(`${task.id}. ${task.name}`);
    }

    // Pull the first task
    const task = tasks.shift()!;
    console.log(chalk.bold(chalk.greenBright("\n*****NEXT TASK*****\n")));
    console.log(`${task.id}: ${task.name}`);

    // Increment task id counter
    taskIdCounter++;

    // Send to execution function to complete the task based on the context
    const result = await executeTask({ objective, task: task.name });
    console.log(chalk.bold(chalk.magenta("\n*****TASK RESULT*****\n")));
    console.log(result);

    // Create new tasks
    const newTasks = await generateNewTasks({
      objective,
      completedTask: task.name,
      completedTaskResult: result,
      existingTasks: tasks.map((task) => task.name),
    });

    // Reprioritize tasks
    const prioritizedTasks = await prioritizeTasks({
      tasks: [...tasks.map((task) => task.name), ...newTasks],
      objective,
      nextTaskId: taskIdCounter,
    });

    // Replace task list
    let newTaskIdCounter = taskIdCounter;
    tasks = prioritizedTasks.map((taskName) => ({
      id: newTaskIdCounter++,
      name: taskName,
    }));
  }
}
