const fs = require('fs');
const path = require('path');

// Define the directory path
const svgDir = path.join(__dirname, 'node_modules', '@fabric-msft', 'svg-icons', 'dist', 'svg');
const readmePath = path.join(__dirname, 'README.md');

// Read the directory contents
fs.readdir(svgDir, (err, files) => {
  if (err) {
    return console.error('Unable to read directory:', err);
  }

  // Filter for .svg files
  const svgFiles = files.filter(file => path.extname(file) === '.svg');

  // Open the README.md file for writing
  const writeStream = fs.createWriteStream(readmePath, { flags: 'w' });
  writeStream.write('# fabric-icons\n\n');

  // Loop through the .svg files
  svgFiles.forEach(file => {
    console.log('Found SVG file:', file);
    const line = `![${file}](node_modules/@fabric-msft/svg-icons/dist/svg/${file})\n`;
    writeStream.write(line);
  });

  // Close the write stream
  writeStream.end(() => {
    console.log('Finished writing to README.md');
  });
  
});