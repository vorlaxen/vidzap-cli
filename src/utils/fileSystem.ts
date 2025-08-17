import fs from "fs";
import path from "path";

export const fileSystem = {
  exists: (p: string) => fs.existsSync(path.resolve(p)),
  writeFile: (p: string, data: string) =>
    fs.writeFileSync(path.resolve(p), data),
  mkdir: (p: string) => fs.mkdirSync(path.resolve(p), { recursive: true }),
};