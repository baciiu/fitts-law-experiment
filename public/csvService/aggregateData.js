// aggregate-csv-no-headers.js
const fs = require("fs");
const path = require("path");

// Folder containing your CSV files
//const inputDir = "./temp"; // replace with your folder

function aggregateData(inputDir, outputDir, fileName) {
  const outputFile = path.join(outputDir, fileName);

  // Get all CSV files
  const csvFiles = fs
    .readdirSync(inputDir)
    .filter((file) => path.extname(file) === ".csv");

  let aggregatedContent = "";

  csvFiles.forEach((file) => {
    const filePath = path.join(inputDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    // Split into lines and remove empty lines
    const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");

    aggregatedContent += lines.join("\n") + "\n";
  });

  // Write to output
  fs.writeFileSync(outputFile, aggregatedContent, "utf8");
  console.log(`Aggregated ${csvFiles.length} CSV files into ${outputFile}`);
}

module.exports = { aggregateData };

aggregateData("outputDiscrete", "outputDiscrete", "aggregatedDiscrete.csv");
