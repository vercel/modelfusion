import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import { JSDOM } from "jsdom";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAITextGenerationModel,
  generateText,
} from "modelfusion";

dotenv.config();

const program = new Command();

program
  .description("BabyBeeAGI")
  .requiredOption("-o, --objective <value>", "Objective")
  .parse(process.argv);

const { objective } = program.opts();

const webSearchVar = "";

runBabyBeeAGI({
  objective,
  firstTask: "Develop a task list.",
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

type Task = {
  id: number;
  task: string;
  status: "complete" | "incomplete";
  dependentTaskId?: number | null;
  tool?: string;
  result?: string;
  resultSummary?: string;
};

async function runBabyBeeAGI({
  objective,
  firstTask,
}: {
  objective: string;
  firstTask: string;
}) {
  let sessionSummary = "";

  // Task list functions:
  let taskList: Array<Task> = [];

  function addTask(task: Task) {
    taskList.push(task);
  }

  function getTaskById(taskId: number) {
    return taskList.find((task) => task.id === taskId);
  }

  function getCompletedTasks() {
    return taskList.filter((task) => task.status === "complete");
  }

  // ### Tool functions ##############################
  const textCompletionTool = async (prompt: string) =>
    generateText(
      new OpenAITextGenerationModel({
        model: "text-davinci-003",
        temperature: 0.5,
        maxTokens: 1500,
      }),
      prompt
    );

  const webScrapeTool = async (url: string) => {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);

    let result = dom.window.document.body.textContent?.trim() || "";
    result += "URLs: ";

    const links = dom.window.document.querySelectorAll('a[href^="https://"]');

    links.forEach((link) => {
      result += `${link.getAttribute("href")}, `;
    });

    return result;
  };

  let taskIdCounter = 0;

  // ### Agent functions ##############################
  async function executeTask(task: Task) {
    // Check if dependent_task_id is complete
    if (task.dependentTaskId) {
      const dependentTask = getTaskById(task.dependentTaskId);
      if (!dependentTask || dependentTask.status !== "complete") {
        return;
      }
    }

    // Execute task
    console.log(chalk.green.bold(`\n*****NEXT TASK*****\n`));
    console.log(`${task.id}: ${task.task} [${task.tool}]`);

    let taskPrompt = `Complete your assigned task based on the objective: ${objective}. Your task: ${task.task}`;

    if (task.dependentTaskId) {
      const dependentTask = getTaskById(task.dependentTaskId)!;
      const dependentTaskResult = dependentTask.result;
      taskPrompt += `\nThe previous task (${dependentTask.id}. ${dependentTask.task}) result: ${dependentTaskResult}`;
    }

    taskPrompt += "\nResponse:";
    let result: string;
    if (task.tool === "text-completion") {
      result = await textCompletionTool(taskPrompt);
    } else if (task.tool === "web-scrape") {
      result = await webScrapeTool(task.task);
    } else {
      result = "Unknown tool";
    }

    console.log(chalk.yellow.bold(`\n*****TASK RESULT*****\n`));
    const printResult = result.substring(0, 2000);
    if (result !== printResult) {
      console.log(`${printResult}...`);
    } else {
      console.log(result);
    }

    // Update task status and result
    task.status = "complete";
    task.result = result;
    task.resultSummary = await summarizerAgent(result);

    // Update session summary
    sessionSummary = await overviewAgent(task.id);

    // Increment task id counter
    taskIdCounter++;

    // Update task manager agent of tasks
    await taskManagerAgent({
      result,
      currentTaskId: task.id,
    });
  }

  async function taskManagerAgent({
    result,
    currentTaskId,
  }: {
    result: string;
    currentTaskId: number;
  }) {
    const originalTaskList = taskList.slice();

    const minifiedTaskList = taskList.map((task) => {
      const { result, ...rest } = task;
      return rest;
    });

    result = result.substring(0, 4000);

    const prompt = [
      `You are a task management AI tasked with cleaning the formatting of and reprioritizing the following tasks: ${minifiedTaskList}. `,
      `Consider the ultimate objective of your team: ${objective}. `,
      "Do not remove any tasks. Return the result as a JSON-formatted list of dictionaries.\n",
      "Create new tasks based on the result of last task if necessary for the objective. Limit tasks types to those that can be completed with the available tools listed below. Task description should be detailed.",
      "The maximum task list length is 7. Do not add an 8th task.",
      `The last completed task has the following result: ${result}. `,
      `Current tool option is [text-completion] ${webSearchVar} and [web-scrape] only.`, // web-search is added automatically if SERPAPI exists
      "For tasks using [web-scrape], provide only the URL to scrape as the task description. Do not provide placeholder URLs, but use ones provided by a search step or the initial objective.",
      // "If the objective is research related, use at least one [web-search] with the query as the task description, and after, add up to three URLs from the search result as a task with [web-scrape], then use [text-completion] to write a comprehensive summary of each site thas has been scraped.'",
      "For tasks using [web-search], provide the search query, and only the search query to use (eg. not 'research waterproof shoes, but 'waterproof shoes')",
      "dependent_task_id should always be null or a number.",
      "Do not reorder completed tasks. Only reorder and dedupe incomplete tasks.\n",
      "Make sure all task IDs are in chronological order.\n",
      "Do not provide example URLs for [web-scrape].\n",
      "Do not include the result from the last task in the JSON, that will be added after..\n",
      "The last step is always to provide a final summary report of all tasks.\n",
      "An example of the desired output format is: ",
      '[{"id": 1, "task": "https://untapped.vc", "tool": "web-scrape", "dependent_task_id": null, "status": "incomplete", "result": null, "result_summary": null}, {"id": 2, "task": "Analyze the contents of...", "tool": "text-completion", "dependent_task_id": 1, "status": "incomplete", "result": null, "result_summary": null}, {"id": 3, "task": "Untapped Capital", "tool": "web-search", "dependent_task_id": null, "status": "incomplete", "result": null, "result_summary": null}].',
    ].join("");

    console.log(chalk.gray.italic(`\nRunning task manager agent...`));

    const text = await generateText(
      new OpenAIChatModel({
        model: "gpt-4",
        temperature: 0.2,
      }),
      [
        OpenAIChatMessage.system("You are a task manager AI."),
        OpenAIChatMessage.user(prompt),
      ]
    );

    console.log(chalk.gray.italic(`\nDone!\n`));

    // Extract the content of the assistant's response and parse it as JSON
    try {
      // Addition to original BabyBeeAGI: GPT-4 tends to wrap JSON in ```json ... ```
      // Extract the JSON first:
      const jsonStart = text.indexOf("```json") + 7;
      const jsonEnd = text.indexOf("```", jsonStart);

      taskList = JSON.parse(text.substring(jsonStart, jsonEnd));
    } catch (error) {
      console.log(text);
      console.log(error);
    }

    // Add the 'result' field back in
    for (let i = 0; i < taskList.length && i < originalTaskList.length; i++) {
      if ("result" in originalTaskList[i]) {
        taskList[i].result = originalTaskList[i].result;
      }
    }

    taskList[currentTaskId].result = text;

    return taskList;
  }

  async function summarizerAgent(input: string) {
    return await generateText(
      new OpenAITextGenerationModel({
        model: "text-davinci-003",
        temperature: 0.5,
        maxTokens: 100,
      }),
      [
        `Please summarize the following text:`,
        input.substring(0, 4000),
        `Summary:`,
      ].join("\n")
    );
  }

  async function overviewAgent(lastTaskId: number) {
    const completedTasks = getCompletedTasks();

    const completedTasksText = completedTasks
      .map(
        (task) =>
          `${task.id}. ${task.task} - ${task.resultSummary ?? task.result}`
      )
      .join("\n");

    return await generateText(
      new OpenAITextGenerationModel({
        model: "text-davinci-003",
        temperature: 0.5,
        maxTokens: 200,
      }),
      [
        `Here is the current session summary:`,
        sessionSummary,
        `The last completed task is task ${lastTaskId}. Please update the session summary with the information of the last task:`,
        completedTasksText,
        `Updated session summary, which should describe all tasks in chronological order:`,
      ].join("\n")
    );
  }

  // ### Main Loop ##############################

  // Add the first task
  addTask({
    id: 1,
    task: firstTask,
    tool: "text-completion",
    status: "incomplete",
  });

  console.log(chalk.cyan.bold("\n*****OBJECTIVE*****\n"));
  console.log(objective);

  // Continue the loop while there are incomplete tasks
  while (taskList.some((task) => task.status === "incomplete")) {
    // Get incomplete tasks
    const incompleteTasks = taskList.filter(
      (task) => task.status === "incomplete"
    );

    // Sort tasks by ID
    incompleteTasks.sort((a, b) => a.id - b.id);

    // Pull the first task
    const task = incompleteTasks[0];

    // Execute task & call task manager from function
    await executeTask(task);

    // Print task list and session summary
    console.log(chalk.magenta.bold("\n*****TASK LIST*****\n"));

    for (const task of taskList) {
      const dependentTask =
        task.dependentTaskId != null
          ? chalk.red.bold(`<dependency: #${task.dependentTaskId}>`)
          : "";

      const statusColor =
        task.status === "complete" ? chalk.green.bold : chalk.red.bold;

      console.log(
        `${task.id}: ${task.task} ${statusColor(
          `[${task.status}]`
        )} ${chalk.yellow.bold(`[${task.tool}]`)} ${dependentTask}`
      );
    }

    console.log(chalk.cyan.bold("\n*****SESSION SUMMARY*****\n"));
    console.log(sessionSummary);

    // Sleep before checking the task list again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // ### Objective complete ##############################

  // Print the full task list if there are no incomplete tasks
  if (taskList.every((task) => task.status !== "incomplete")) {
    console.log(chalk.green.bold("\n*****ALL TASKS COMPLETED*****\n"));
    for (const task of taskList) {
      console.log(`ID: ${task.id}, Task: ${task.task}, Result: ${task.result}`);
    }
  }
}
