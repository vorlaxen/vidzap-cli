import ytdl, { videoFormat, videoInfo } from "@distube/ytdl-core";
import Logger from "../utils/logger.js";
import { updateProgress, stopBar } from "../utils/bar.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import os from "os";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoCache = new Map<string, videoInfo>();

const sanitizeFilename = (filename: string) =>
  filename.replace(/[\x00-\x1f<>:"/\\|?*\u{7f}]/gu, "-").trim();

const ensureDirExists = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const getAvailableFilename = (filePath: string) => {
  if (!fs.existsSync(filePath)) return filePath;

  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  for (let i = 1; i < 100; i++) {
    const newPath = path.join(dir, `${name} (${i})${ext}`);
    if (!fs.existsSync(newPath)) return newPath;
  }

  throw new Error("Filename not found after 100 tries. Change the name.");
};

const findClosestResolution = (
  formats: videoFormat[],
  targetRes: string
): videoFormat | null => {
  const targetNum = parseInt(targetRes);
  if (isNaN(targetNum)) return null;

  const filtered = formats
    .map((f) => ({ format: f, resNum: parseInt(f.qualityLabel ?? "") }))
    .filter((f) => !isNaN(f.resNum));

  filtered.sort((a, b) => Math.abs(a.resNum - targetNum) - Math.abs(b.resNum - targetNum));

  return filtered[0]?.format ?? null;
};

const streamToFile = (
  stream: NodeJS.ReadableStream,
  filePath: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    let downloaded = 0;

    stream.on("data", (chunk: Buffer) => {
      downloaded += chunk.length;
      updateProgress(downloaded, 0);
    });

    stream.pipe(fileStream);

    stream.on("error", reject);
    fileStream.on("finish", () => {
      stopBar();
      resolve();
    });
    fileStream.on("close", () => {
      stopBar();
      resolve();
    });
  });

export interface DownloadOptions {
  url: string;
  container?: "mp4" | "mp3";
  quality?: string;
  savePath?: string;
  mp3Bitrate?: string;
}

export const fetchVideoMetadata = async (url: string) => {
  if (!ytdl.validateURL(url)) throw new Error("Invalid URL.");

  if (videoCache.has(url)) {
    return videoCache.get(url)!;
  }

  const info = await ytdl.getInfo(url);

  if (!info.videoDetails.videoId) throw new Error("Video unavailable.");
  if (info.videoDetails.isPrivate) throw new Error("Private video.");
  if (info.videoDetails.isLiveContent) throw new Error("Live stream not supported.");

  videoCache.set(url, info);
  return info;
};

export const getAvailableResolutions = (formats: videoFormat[]) => {
  return formats
    .filter(f => f.qualityLabel)
    .map(f => f.qualityLabel)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => parseInt(b) - parseInt(a));
};

export const downloadService = async (options: DownloadOptions) => {
  const {
    url,
    container = "mp4",
    quality = "720p",
    savePath,
    mp3Bitrate = 128
  } = options;
  try {
    const info = await fetchVideoMetadata(url);

    const tempDir = path.join(os.tmpdir(), "vidzap_temp");
    const outputDir = path.resolve(__dirname, savePath || '../output');

    ensureDirExists(tempDir);
    ensureDirExists(outputDir);

    const cleanTitle = sanitizeFilename(info.videoDetails.title);
    const baseOutput = path.join(outputDir, `${cleanTitle}.${container}`);
    const outputPath = getAvailableFilename(baseOutput);

    if (container === "mp4") {
      const muxedFormats = ytdl.filterFormats(info.formats, "videoandaudio").filter(f => f.container === "mp4");
      const videoOnlyFormats = ytdl.filterFormats(info.formats, "videoonly").filter(f => f.container === "mp4");
      const audioOnlyFormats = ytdl.filterFormats(info.formats, "audioonly");

      let selectedFormat = muxedFormats.find(f => f.qualityLabel === quality) ?? findClosestResolution(videoOnlyFormats, quality ?? "");

      if (!selectedFormat) throw new Error("No suitable video format found.");

      if (muxedFormats.includes(selectedFormat)) {
        Logger.info(`Downloading ${selectedFormat.qualityLabel} muxed video...`);
        const videoStream = ytdl.downloadFromInfo(info, { format: selectedFormat });
        await streamToFile(videoStream, outputPath);
        Logger.success(`Video downloaded: ${outputPath}`);
      } else {
        Logger.warn(`Muxed format not found. Downloading separately.`);

        const bestAudio = audioOnlyFormats.reduce((prev, curr) => (curr.audioBitrate ?? 0) > (prev.audioBitrate ?? 0) ? curr : prev);
        if (!bestAudio) throw new Error("No suitable audio format found.");

        const tempVideoPath = path.join(tempDir, `video.${selectedFormat.container}`);
        const tempAudioPath = path.join(tempDir, `audio.${bestAudio.container}`);

        await streamToFile(ytdl.downloadFromInfo(info, { format: selectedFormat }), tempVideoPath);
        await streamToFile(ytdl.downloadFromInfo(info, { format: bestAudio }), tempAudioPath);

        await new Promise<void>((resolve, reject) => {
          ffmpeg()
            .input(tempVideoPath)
            .input(tempAudioPath)
            .outputOptions(["-c:v copy", "-c:a aac"])
            .on("end", () => {
              try { fs.unlinkSync(tempVideoPath); fs.unlinkSync(tempAudioPath); } catch { }
              Logger.success(`Video and audio merged: ${outputPath}`);
              resolve();
            })
            .on("error", (err) => reject(err))
            .save(outputPath);
        });
      }
    } else if (container === "mp3") {
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      const bestAudio = audioFormats.reduce((prev, curr) => (curr.audioBitrate ?? 0) > (prev.audioBitrate ?? 0) ? curr : prev);
      if (!bestAudio) throw new Error("No audio format found.");

      const tempAudioPath = path.join(tempDir, `audio.${bestAudio.container}`);
      await streamToFile(ytdl.downloadFromInfo(info, { format: bestAudio }), tempAudioPath);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempAudioPath)
          .audioBitrate(mp3Bitrate)
          .toFormat("mp3")
          .on("end", () => { fs.unlinkSync(tempAudioPath); Logger.success(`MP3 downloaded: ${outputPath}`); resolve(); })
          .on("error", reject)
          .save(outputPath);
      });
    } else {
      throw new Error("Unsupported container.");
    }

  } catch (err) {
    Logger.error("Download failed", err);
    throw err;
  }
};
