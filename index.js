const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Define the directory path
const svgDir = path.join(__dirname, 'node_modules', '@fabric-msft', 'svg-icons', 'dist', 'svg');
const readmePath = path.join(__dirname, 'README.md');
const packageJsonPath = path.join(__dirname, 'node_modules', '@fabric-msft', 'svg-icons', 'package.json');
const configPath = path.join(__dirname, 'config.yml');

// Function to filter files based on a pattern
const filterFiles = (files, pattern) => {
  return files.filter(file => pattern.test(file));
};

// Function to group files by base name
const groupFilesByBaseName = (files) => {
  return files.reduce((groups, file) => {
    const baseName = file.replace(/(_\d+[_a-zA-Z\-]*)\s?\.svg$/, '');
    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    groups[baseName].push(file);
    return groups;
  }, {});
};

// Read the version number from package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Read and parse the config.yml file
let workloads = [];
try {
  const configFile = fs.readFileSync(configPath, 'utf8');
  const config = yaml.load(configFile);
  workloads = config.workloads || [];
} catch (e) {
  console.error('Error reading config.yml:', e);
}

// Read the directory contents
fs.readdir(svgDir, (err, files) => {
  if (err) {
    return console.error('Unable to read directory:', err);
  }

  // Filter for .svg files ending in "_item.svg"
  const itemFiles = filterFiles(files, /_items?\.svg$/);
  const groupedItemFiles = groupFilesByBaseName(itemFiles);

  // All other .svg files
  const otherFiles = filterFiles(files, /\.svg$/).filter(file => !/_items?\.svg$/.test(file));
  const groupedOtherFiles = groupFilesByBaseName(otherFiles);

  // Open the README.md file for writing
  const writeStream = fs.createWriteStream(readmePath, { flags: 'w' });
  // Write header
  writeStream.write(`![NPM Version](https://img.shields.io/npm/v/%40fabric-msft%2Fsvg-icons?label=svg-icons)\n\n`);
  writeStream.write(`# fabric-icons (${version})\n\n`);

  // Function to write grouped files to README.md
  const writeGroupedFiles = (groupedFiles, header, include = [], exclude = []) => {
    if (include && include.length > 0 && exclude && exclude.length > 0) {
      throw new Error('Cannot provide both include and exclude arrays.');
    }

    writeStream.write(`## ${header}\n\n`);

    Object.entries(groupedFiles).forEach(([baseName, files]) => {
      if (include && include.length > 0 && !include.includes(baseName)) {
        return;
      }
      if (exclude && exclude.length > 0 && exclude.includes(baseName)) {
        return;
      }

      console.log(`Processing ${baseName}...`);
      writeStream.write(`### ${baseName}\n\n`);

      files.forEach(file => {
        const encodedFile = file.replace(/\s/g, '%20');
        const line = `![${file}](node_modules/@fabric-msft/svg-icons/dist/svg/${encodedFile})\n`;
        writeStream.write(line);
      });

      writeStream.write('\n');
    });
  };

  // Write grouped item files and other files to README.md
  writeGroupedFiles(groupedOtherFiles, 'Workloads', workloads, null);
  writeGroupedFiles(groupedItemFiles, 'Items');
  writeGroupedFiles(groupedOtherFiles, 'Other', null, workloads);

  // Close the write stream
  writeStream.end(() => {
    console.log('Finished writing to README.md');
  });
});