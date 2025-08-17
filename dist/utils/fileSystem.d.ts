export declare const fileSystem: {
    exists: (p: string) => boolean;
    writeFile: (p: string, data: string) => void;
    mkdir: (p: string) => string | undefined;
};
