const fs = require('fs');
const path = require('path');

// Define the directory path
const svgDir = path.join(__dirname, 'node_modules', '@fabric-msft', 'svg-icons', 'dist', 'svg');
const readmePath = path.join(__dirname, 'README.md');
const packageJsonPath = path.join(__dirname, 'node_modules', '@fabric-msft', 'svg-icons', 'package.json');

// Function to filter files based on a pattern
const filterFiles = (files, pattern) => {
  return files.filter(file => pattern.test(file));
};

// Function to group files by base name
const groupFilesByBaseName = (files) => {
  return files.reduce((groups, file) => {
    const baseName = file.replace(/(_\d+[_a-zA-Z\-]*)\.svg$/, '');
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
  writeStream.write(`# fabric-icons (${version})\n\n`);

  // Function to write grouped files to README.md
  const writeGroupedFiles = (groupedFiles, header) => {
    writeStream.write(`## ${header}\n\n`);

    Object.entries(groupedFiles).forEach(([baseName, files]) => {
      console.log(`Processing ${baseName}...`);
      writeStream.write(`### ${baseName}\n\n`);

      files.forEach(file => {
        const line = `![${file}](node_modules/@fabric-msft/svg-icons/dist/svg/${file})\n`;
        writeStream.write(line);
      });

      writeStream.write('\n');
    });
  };

  // Write grouped item files and other files to README.md
  writeGroupedFiles(groupedItemFiles, 'Items');
  writeGroupedFiles(groupedOtherFiles, 'Other');

  // Close the write stream
  writeStream.end(() => {
    console.log('Finished writing to README.md');
  });
});