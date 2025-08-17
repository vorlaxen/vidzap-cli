import fs from "fs";
import path from "path";
export const fileSystem = {
    exists: (p) => fs.existsSync(path.resolve(p)),
    writeFile: (p, data) => fs.writeFileSync(path.resolve(p), data),
    mkdir: (p) => fs.mkdirSync(path.resolve(p), { recursive: true }),
};
