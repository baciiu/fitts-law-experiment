const fs = require("fs");

let REFERENCE_YEAR = 2025;

function addTimeCalculationColumn(inputCsvPath, outputCsvPath = "result.csv") {
  const raw = fs.readFileSync(inputCsvPath, "utf-8");
  const { header, rows } = parseCsv(raw);

  // Append new column to header
  header.push("time from release to release");

  const processedRows = rows.map((row) => {
    let diffSeconds = "";

    try {
      const t1 = parseTimestamp(row.rect1_Release_timeT2);
      const t2 = parseTimestamp(row.rect2_Release_timeT4);
      diffSeconds = (t2 - t1) / 1000;
    } catch {
      // Leave empty if invalid
      diffSeconds = "";
    }

    return {
      ...row,
      "time from release to release": diffSeconds,
    };
  });

  writeCsv(header, processedRows, outputCsvPath);
}

function appendRect2ReleaseXDiff(inputCsvPath, outputCsvPath) {
  const raw = fs.readFileSync(inputCsvPath, "utf-8");
  const { header, rows } = parseCsv(raw);

  const REQUIRED_COLUMNS = [
    "rect2_X",
    "rect2_WidthPx",
    "rect2_Release_coord_X",
  ];

  for (const col of REQUIRED_COLUMNS) {
    if (!header.includes(col)) {
      throw new Error(`Missing required column: ${col}`);
    }
  }

  // Append new headers
  header.push("rect2_release_x_diff", "abs_rect2_release_x_diff");

  const processedRows = rows.map((row) => {
    const rect2X = Number(row.rect2_X);
    const rect2W = Number(row.rect2_WidthPx);
    const rect2ReleaseX = Number(row.rect2_Release_coord_X);

    if (
      !Number.isFinite(rect2X) ||
      !Number.isFinite(rect2W) ||
      !Number.isFinite(rect2ReleaseX)
    ) {
      return {
        ...row,
        rect2_release_x_diff: "",
        abs_rect2_release_x_diff: "",
      };
    }

    const rect2CenterX = rect2X + rect2W / 2;
    const diff = rect2ReleaseX - rect2CenterX;

    return {
      ...row,
      rect2_release_x_diff: diff,
      abs_rect2_release_x_diff: Math.abs(diff),
    };
  });

  writeCsv(header, processedRows, outputCsvPath);
}

function parseCsv(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines
    .shift()
    .split(",")
    .map((h) => h.trim());

  const rows = lines.map((line) => {
    const values = line.split(",");
    const record = {};
    header.forEach((h, i) => {
      record[h] = values[i]?.trim() ?? "";
    });
    return record;
  });

  return { header, rows };
}

/**
 * Timestamp parser: DD.MM T HH:mm:ss.SSS
 */
function parseTimestamp(value) {
  const match = value.match(
    /^(\d{2})\.(\d{2}) T (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/,
  );

  if (!match) {
    throw new Error("Invalid timestamp format");
  }

  const [, day, month, hour, minute, second, ms] = match.map(Number);

  return new Date(
    REFERENCE_YEAR,
    month - 1,
    day,
    hour,
    minute,
    second,
    ms,
  ).getTime();
}

/**
 * CSV writer (preserves column order)
 */
function writeCsv(header, rows, outputPath) {
  const lines = [
    header.join(","),
    ...rows.map((row) => header.map((h) => row[h]).join(",")),
  ];

  fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");
}

module.exports = { addTimeCalculationColumn, appendRect2ReleaseXDiff };
// Example usage
/*addTimeCalculationColumn(
  "./outputReciprocal/aggregatedReciprocal.csv",
  "./outputReciprocal/aggregatedReciprocal.csv",
);
 */

/*appendRect2ReleaseXDiff(
  "./outputDiscrete/aggregatedDiscrete.csv",
  "./outputDiscrete/aggregatedDiscreteWithDiff.csv",
);
*/
appendRect2ReleaseXDiff(
  "./outputReciprocal/aggregatedReciprocal.csv",
  "./outputReciprocal/aggregatedReciprocalWithDiff.csv",
);
