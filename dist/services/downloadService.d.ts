import ytdl, { videoFormat } from "@distube/ytdl-core";
export interface DownloadOptions {
    url: string;
    container?: "mp4" | "mp3";
    quality?: string;
    savePath?: string;
    mp3Bitrate?: string;
}
export declare const fetchVideoMetadata: (url: string) => Promise<ytdl.videoInfo>;
export declare const getAvailableResolutions: (formats: videoFormat[]) => ("144p" | "144p 15fps" | "144p60 HDR" | "240p" | "240p60 HDR" | "270p" | "360p" | "360p60 HDR" | "480p" | "480p60 HDR" | "720p" | "720p60" | "720p60 HDR" | "1080p" | "1080p60" | "1080p60 HDR" | "1440p" | "1440p60" | "1440p60 HDR" | "2160p" | "2160p60" | "2160p60 HDR" | "4320p" | "4320p60")[];
export declare const downloadService: (options: DownloadOptions) => Promise<void>;
