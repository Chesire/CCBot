const fs = require("node:fs");
const path = require("node:path");

function loadCommands() {
  const commands = [];
  const featuresPath = path.join(__dirname, "../../features");
  const featureDirectories = fs.readdirSync(featuresPath).filter((file) =>
    fs.statSync(path.join(featuresPath, file)).isDirectory(),
  );

  for (const featureDir of featureDirectories) {
    const featurePath = path.join(featuresPath, featureDir);
    const files = fs
      .readdirSync(featurePath)
      .filter((file) => file.endsWith("-command.js"));

    for (const file of files) {
      const filePath = path.join(featurePath, file);
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

module.exports = { loadCommands };
