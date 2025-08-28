import { Command } from "commander";
import { downloadService, fetchVideoMetadata, getAvailableResolutions } from "../services/downloadService.js";
import Logger from "../utils/logger.js";
import inquirer from "inquirer";
import ytdl, { videoFormat, videoInfo } from "@distube/ytdl-core";

export const downloadCommand = new Command("download")
  .description("Download a Youtube video")
  .requiredOption("-n, --url <url>", "Youtube Video Url")
  .action(async (args, cmd) => {
    try {
      const { url } = cmd.opts();
      
      const info: videoInfo = await fetchVideoMetadata(url);
      const videoFormats: videoFormat[] = ytdl.filterFormats(info.formats, "videoonly");
      const resolutions = getAvailableResolutions(videoFormats);

      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "container",
          message: "Select the file container: ",
          choices: ["mp4", "mp3"],
          default: "mp4",
        },
        {
          type: "list",
          name: "quality",
          message: "Select the video quality:",
          choices: resolutions,
          when: (answers) => answers.container === "mp4",
        },
        {
          type: "confirm",
          name: "subtitles",
          message: "Do you want subtitles?",
          default: false,
        },
        {
          type: "input",
          name: "savePath",
          message: "Enter the full path to save the file (folder or full filename):",
          default: "../output",
        },
      ]);

      await downloadService({
        url,
        container: answers.container,
        quality: answers.quality,
        savePath: answers.savePath
      });

      Logger.info("Successfully downloaded this video!");
    } catch (err: any) {
      Logger.error(`Download failed: ${err.message}`);
    }
  });
