import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function loadCommands() {
  const commands = [];
  const featuresPath = join(__dirname, "../../features");
  const featureDirectories = readdirSync(featuresPath).filter((file) =>
    statSync(join(featuresPath, file)).isDirectory(),
  );

  for (const featureDir of featureDirectories) {
    const featurePath = join(featuresPath, featureDir);
    const files = readdirSync(featurePath).filter((file) =>
      file.endsWith("-command.js"),
    );

    for (const file of files) {
      const filePath = join(featurePath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        commands.push(command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  return commands;
}

export default { loadCommands };
