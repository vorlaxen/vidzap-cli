import cliProgress from "cli-progress";
import chalk from "chalk";

interface ProgressPayload {
  speed: string;
  eta_formatted: string;
}

const bar = new cliProgress.SingleBar(
  {
    format: `${chalk.cyan('Downloading')} |${chalk.green('{bar}')}| {percentage}% | {value}/{total} bytes | {speed} KB/s | ETA: {eta_formatted}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    fps: 20,
    barsize: process.stdout.columns ? process.stdout.columns - 50 : 30,
    linewrap: true
  },
  cliProgress.Presets.shades_classic
);

let barStarted = false;
let lastTime = 0;
let lastValue = 0;

export function updateProgress(downloaded: number, total: number): void {
  const now = Date.now();

  if (!barStarted) {
    bar.start(total, 0, {
      speed: "0.00",
      eta_formatted: "N/A"
    } as ProgressPayload);

    barStarted = true;
    lastTime = now;
    lastValue = 0;
    return;
  }

  const elapsed = Math.max((now - lastTime) / 1000, 0.001);
  const delta = downloaded - lastValue;

  const speedKB = delta / 1024 / elapsed;

  const etaSeconds = speedKB > 0 ? (total - downloaded) / 1024 / speedKB : 0;
  const etaFormatted = new Date(etaSeconds * 1000).toISOString().substr(11, 8);

  bar.update(downloaded, {
    speed: speedKB.toFixed(2),
    eta_formatted: etaFormatted
  } as ProgressPayload);

  lastTime = now;
  lastValue = downloaded;
}

export function stopBar(): void {
  if (barStarted) {
    bar.stop();
    barStarted = false;
    lastTime = 0;
    lastValue = 0;
  }
}

export default bar;
