import cliProgress from "cli-progress";
declare const bar: cliProgress.SingleBar;
export declare function updateProgress(downloaded: number, total: number): void;
export declare function stopBar(): void;
export default bar;
