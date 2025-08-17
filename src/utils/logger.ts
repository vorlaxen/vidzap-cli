import chalk from "chalk";

class Logger {
  static info(message: string) {
    console.log(chalk.blue("[INFO]"), message);
  }

  static success(message: string) {
    console.log(chalk.green("[SUCCESS]"), message);
  }

  static warn(message: string) {
    console.log(chalk.yellow("[WARN]"), message);
  }

  static error(message: string, error?: unknown) {
    console.error(chalk.red("[ERROR]"), message);
    if (error instanceof Error) {
      console.error(chalk.gray(error.stack || error.message));
    }
  }

  static debug(message: string) {
    if (process.env.DEBUG === "true") {
      console.log(chalk.magenta("[DEBUG]"), message);
    }
  }
}

export default Logger;