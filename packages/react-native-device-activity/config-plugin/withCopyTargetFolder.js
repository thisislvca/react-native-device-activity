/* eslint-disable no-undef */
const fs = require("fs");
const path = require("path");

/** @type {import('@expo/config-plugins').ConfigPlugin<{ appGroup: string; copyToTargetFolder?: boolean }>} */
const withCopyTargetFolder = (config, { copyToTargetFolder = true }) => {
  if (!copyToTargetFolder && !process.env.COPY_TO_TARGET_FOLDER) {
    return config;
  }

  const projectRoot = config._internal.projectRoot;

  const packageTargetFolderPath = __dirname + "/../targets";
  const projectTargetFolderPath = projectRoot + "/targets";

  const sharedFilePath = __dirname + "/../ios/Shared.swift";

  if (!fs.existsSync(projectTargetFolderPath)) {
    fs.mkdirSync(projectTargetFolderPath);
  }

  fs.cpSync(packageTargetFolderPath, projectTargetFolderPath, {
    recursive: true,
  });

  const nativeTargets = fs.readdirSync(packageTargetFolderPath, {
    withFileTypes: false,
  });

  const targetsNeedingSharedFile = new Set([
    "ActivityMonitorExtension",
    "ShieldAction",
    "ShieldConfiguration",
  ]);

  for (const nativeTarget of nativeTargets) {
    const targetPath = projectTargetFolderPath + "/" + nativeTarget;
    // check if is directory
    if (
      fs.lstatSync(targetPath).isDirectory() &&
      targetsNeedingSharedFile.has(path.basename(targetPath))
    ) {
      fs.cpSync(sharedFilePath, targetPath + "/Shared.swift");
    }
  }

  return config;
};

module.exports = withCopyTargetFolder;
