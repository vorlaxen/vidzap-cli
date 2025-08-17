#!/usr/bin/env node
import { Command } from "commander";
import { downloadCommand } from "./commands/download.js";
import { setupErrorHandlers } from "./utils/errorHandler.js";
import chalk from "chalk";
import gradient, { cristal } from "gradient-string";
import figlet from "figlet";

setupErrorHandlers();

const program = new Command();

console.log(
  cristal(figlet.textSync("Vidzap", { horizontalLayout: "full" }))
);

program
  .name(chalk.cyan.bold('vidzap'))
  .description(chalk.gray('The ultimate YouTube video downloader!'))
  .version(chalk.yellow('0.1.0'), '-V, --version', 'output the version number');

program.addCommand(downloadCommand);

program.helpOption(true);

program.parse(process.argv);
