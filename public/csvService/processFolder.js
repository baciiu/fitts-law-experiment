const fs = require("fs");
const path = require("path");

const { filterFailedTrials } = require("./filterFailedTrials");
const { addTimeCalculationColumn } = require("./releaseTimeCalculator");
const { aggregateData } = require("./aggregateData");

// Folders
const INPUT_DIR = path.join(__dirname, "outputReciprocal");
const OUTPUT_DIR = path.join(__dirname, "outputReciprocal");
const TEMP_DIR = path.join(__dirname, "temp");

// Ensure output and temp folders exist
[OUTPUT_DIR, TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function runBatch() {
  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((file) => file.endsWith(".csv"));

  if (files.length === 0) {
    console.log("No CSV files found.");
    return;
  }

  for (const file of files) {
    console.log(`Processing: ${file}`);

    const inputPath = path.join(INPUT_DIR, file);
    const tempPath = path.join(TEMP_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);

    try {
      //filterFailedTrials(inputPath, tempPath);
      //addTimeCalculationColumn(tempPath, outputPath);
      //aggregateData(inputPath, outputPath, "aggregatedReciprocal.csv");
      console.log(`✓ Completed: ${file}`);
    } catch (err) {
      console.error(`✗ Failed: ${file}`);
      console.error(err.message);
    }
  }
}

// Run
runBatch();
