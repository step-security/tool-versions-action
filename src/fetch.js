import fs from "fs";
import path from "path";

const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1 MiB

export const fetch = function(filePath) {
  const baseDir = path.resolve(process.env.GITHUB_WORKSPACE || process.cwd());
  const resolvedPath = path.resolve(baseDir, filePath);

  if (resolvedPath !== baseDir && !resolvedPath.startsWith(baseDir + path.sep)) {
    throw new Error(`path "${filePath}" resolves outside of the workspace directory`);
  }

  const { size } = fs.statSync(resolvedPath);
  if (size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`file "${filePath}" exceeds maximum allowed size of ${MAX_FILE_SIZE_BYTES} bytes`);
  }

  return fs
    .readFileSync(resolvedPath)
    .toString()
    .split("\n")
    .reduce((acc, current) => {
      const [key, value] = current.trim().split(/\s+/);
      if (value) {
        switch (key) {
          case "elixir":
            acc[key] = value.replace(/-otp.+/, "");
            break;
          case "hugo":
            const is_extended = value.startsWith("extended_");
            acc[key] = JSON.stringify({
              version: is_extended ? value.replace("extended_", "") : value,
              is_extended,
            });
            break;

          default:
            acc[key] = value;
            break;
        }
      }
      return acc;
    }, {});
};
