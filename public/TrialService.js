"use strict";

function mmToPixels(mm) {
  // https://www.calculatorsoup.com/calculators/technology/ppi-calculator.php
  //const screenWidth = 1512; // Screen width in pixels
  //const screenHeight = 982; // Screen height in pixels
  //const screenDiagonal = 14.42; // Screen diagonal in pixel

  const inches = mm / 25.4;
  return inches * 126.5;

  // Pixels per inch (PPI)
  // resolution 1800px x 1169 px  diag inch 14.4 => ppi 149.1 // update 151 is more accurate
  // resolution 1512 px x 982 px diag inch 14.4 => ppi 125.20 // update 127 is more accurate
}

function convertToCSVHeader(array) {
  let csvContent = "";
  if (array.length > 0) {
    const headers = Object.keys(array[0]).join(",");
    csvContent += headers + "\r\n";
  }
  return csvContent;
}

function convertToCSVRow(array) {
  let csvContent = "";
  array.forEach((obj) => {
    const row = Object.values(obj).join(",");
    csvContent += row + "\r\n";
  });
  return csvContent;
}

function createServerFile() {
  fetch(`/create-csv-file`, {
    method: "POST",
    headers: {
      "Content-Type": "text/csv",
    },
    body: "",
  })
    .then((response) => response.text())
    .then((result) => {
      console.log("Display the server response:");
      console.log(result);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function sendDataAsCSVToServer(csvContent) {
  fetch(`/append-csv/${USER}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/csv",
    },
    body: csvContent,
  })
    .then((response) => response.text())
    .then((result) => {
      console.log("Display the server response:");
      console.log(result);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getTimeFormat(date) {
  const now = new Date(date);
  const month = String(now.getMonth() + 1).padStart(2, "0"); // January is 0 in JavaScript
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `${day}.${month} T ${hour}:${minutes}:${seconds}.${milliseconds}`;
}

function getOnlyTimeFormat(date) {
  const now = new Date(date);
  const min = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `${min}${seconds}${milliseconds}`;
}

function assignConstellationToTrial(
  trial,
  constellationMap,
  constellationTemp,
) {
  const index = constellationMap.size + 1;
  if (!constellationMap.has(constellationTemp)) {
    constellationMap.set(constellationTemp, index);
  }
  trial.constellationInt = constellationMap.get(constellationTemp);
  trial.constellationString = constellationTemp;
}

function getConstellationForDiscrete(target, angle, amplitude) {
  return `W_${target.width}_H_${target.height}_D_${angle}_Amp_${amplitude}`;
}

function getConstellationForReciprocal(target, angle, amplitude, travelIndex) {
  const travelParity = travelIndex % 2 == 0 ? 0 : 1;
  return `W_${target.width}_H_${target.height}_D_${angle}_Amp_${amplitude}_T_${travelParity}`;
}

// Euclidean distance takes 2 points (x1,y1) and (x2,y2) and returns the straight-line distance between them
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function deepCopy(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    const arrCopy = [];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepCopy(obj[i]);
    }
    return arrCopy;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  const copy = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
}

function generateCenterPointWithAmplitude(x, y, amplitude, angle) {
  const angleRadians = angle * (Math.PI / 180);
  return {
    x: x + amplitude * Math.cos(angleRadians),
    y: y + amplitude * Math.sin(angleRadians),
  };
}

const EX_TYPE = Object.freeze({
  DISCRETE: "discrete",
  RECIPROCAL: "reciprocal",
});

const DEV_TYPE = Object.freeze({
  TOUCH: "touch",
  MOUSE: "mouse",
});

function insertTrialInArray(array, trial, startIndex) {
  checkIfInstanceOfTrialDiscrete(trial);
  insertItemAfterGivenIndex(array, trial, startIndex);
}

function insertReciprocalTrialInArray(array, reciprocalTrial, startIndex) {
  checkIfInstanceOfReciprocalGroup(reciprocalTrial);
  insertItemAfterGivenIndex(array, reciprocalTrial, startIndex);
}

// Fisher-Yates Algorithm
function insertItemAfterGivenIndex(array, newItem, startIndex) {
  // Ensure the startIndex is within the array bounds and not the last element

  if (startIndex < 0 || startIndex >= array.length - 1) {
    throw Error("[MY ERROR]: Invalid startIndex. Item not inserted.");
  }

  // Generate a random index in the range from startIndex + 1 to the array length inclusive
  const rand = Math.random();
  const randomIndex =
    Math.floor(rand * (array.length - startIndex)) + startIndex + 1;

  // Insert the new item at the random index
  array.splice(randomIndex, 0, newItem);
}

function checkIfInstanceOfTrialDiscrete(newItem) {
  if (!(newItem instanceof TrialDiscrete)) {
    throw Error(ERROR_TRIAL_INSTANCE_DISCRETE);
  } else {
    return true;
  }
}

function checkIfInstanceOfTrialReciprocal(newItem) {
  if (!(newItem instanceof TrialReciprocal)) {
    throw Error(ERROR_TRIAL_INSTANCE_RECIPROCAL);
  } else {
    return true;
  }
}

function checkIfInstanceOfReciprocalGroup(reciprocalGroup) {
  if (!(reciprocalGroup instanceof ReciprocalGroup)) {
    throw Error(ERROR_GROUP_INSTANCE);
  } else {
    return true;
  }
}

function insertItemAtPosition(array, item, index) {
  // Check if the index is within the bounds of the array
  this.checkIfInstanceOfTrialDiscrete(item);
  console.log(array);
  if (index >= 0 && index <= array.length) {
    // Use splice to add the item at the specified index
    array.splice(index, 0, item);
  } else {
    console.error("[MY ERROR]:Index out of bounds");
  }
  console.log(array);
}

function checkForNullOrUndefined(input) {
  if (input === undefined || input === null) {
    throw Error("[MY ERROR]: Could not parse input");
  }
}

function isDiscrete() {
  return EXPERIMENT_TYPE === "discrete";
}

function isReciprocal() {
  return EXPERIMENT_TYPE === "reciprocal";
}

function isShapeWithinBounds(x, y, width, height) {
  return (
    isLeftEdgeWithinBounds(x, width) &&
    isRightEdgeWithinBounds(x, width) &&
    isTopEdgeWithinBounds(y, height) &&
    isBottomEdgeWithinBounds(y, height)
  );
}

function isAmplitude(x1, y1, x2, y2, amplitude) {
  const distance = getDistance(x1, y1, x2, y2);
  const tolerance = 1;
  return distance - amplitude <= tolerance;
}

function isLeftEdgeWithinBounds(x, width) {
  return x - width / 2 > OTHER_MARGINS_PX;
}

function isRightEdgeWithinBounds(x, width) {
  return x + width / 2 < window.innerWidth - OTHER_MARGINS_PX;
}

function isTopEdgeWithinBounds(y, height) {
  return y - height / 2 > TOP_MARGIN_PX;
}

function isBottomEdgeWithinBounds(y, height) {
  return y + height / 2 < window.innerHeight - TOP_MARGIN_PX;
}

function getRandomPoint(width1, height1) {
  const x1 =
    Math.random() * (window.innerWidth - width1 - 2 * OTHER_MARGINS_PX) +
    width1 / 2 +
    OTHER_MARGINS_PX;
  const y1 =
    Math.random() *
      (window.innerHeight - height1 - TOP_MARGIN_PX - OTHER_MARGINS_PX) +
    height1 / 2 +
    TOP_MARGIN_PX;
  return { x: x1, y: y1 };
}

function getRandomPointWithRespectToPreviousTarget(previous) {
  const midpoint = {
    x: (previous.startX + previous.targetX) / 2,
    y: (previous.startY + previous.targetY) / 2,
  };

  const radius = (window.innerWidth * MAX_SCREEN_DISTANCE) / 100;

  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;

  const x = midpoint.x + distance * Math.cos(angle);
  const y = midpoint.y + distance * Math.sin(angle);

  return { x: x, y: y };
}

function isCursorInsideShape(event, shape) {
  const rect = shape.getBoundingClientRect();
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

function getTrialData(trial) {
  return {
    no: "",
    experimentType: EXPERIMENT_TYPE,
    userNumber: "",
    blockNumber: "",
    trialId: trial.trialId,
    constNr: trial.constellationInt,
    constStr: trial.constellationString,
    copyOfTrial: trial.getCopyOfTrial(),
    trialRep: trial.getRepeatNumber(),

    currTravel: trial.currentTravel,
    travelsNumber:
      EXPERIMENT_TYPE === EX_TYPE.RECIPROCAL ? TRAVELS_NUMBER : null,
    amplitudeMM: trial.amplitude,
    amplitudePx: trial.amplitudePX,
    directionDegree: trial.trialDirection,

    rect1_PressIn: trial.startPressIn,
    rect1_ReleaseIn: trial.startReleaseIn,

    rect2_PressIn: trial.targetPressIn,
    rect2_ReleaseIn: trial.targetReleaseIn,

    HIT: trial.isHit(),

    isRepetitionOfMistake: trial.isTrialAMistakeRepetition,

    toBeRepeatedTrial: trial.isToBeRepeatedTrial(),

    /** Start info **/
    rect1_X: trial.startCoords.x,
    rect1_Y: trial.startCoords.y,

    rect1_WidthMM: trial.startWidth,
    rect1_HeightMM: trial.startHeight,

    rect1_WidthPx: trial.startWidthPx,
    rect1_HeightPx: trial.startHeightPX,

    /** Target info **/
    rect2_X: trial.targetCoords.x,
    rect2_Y: trial.targetCoords.y,

    rect2_WidthMM: trial.targetWidth,
    rect2_HeightMM: trial.targetHeight,

    rect2_WidthPx: trial.targetWidthPx,
    rect2_HeightPx: trial.targetHeightPx,

    rect1_Press_coord_X: trial.clicksCoords.at(0)?.x,
    rect1_Press_coord_Y: trial.clicksCoords.at(0)?.y,

    rect1_Release_coord_X: trial.clicksCoords.at(1)?.x,
    rect1_Release_coord_Y: trial.clicksCoords.at(1)?.y,

    rect2_Press_coord_X: trial.clicksCoords.at(2)?.x,
    rect2_Press_coord_Y: trial.clicksCoords.at(2)?.y,

    rect2_Release_coord_X: trial.clicksCoords.at(3)?.x,
    rect2_Release_coord_Y: trial.clicksCoords.at(3)?.y,

    rect1_Press_timeT1: getTimeFormat(trial.clicksTime.at(0)),
    rect1_Release_timeT2: getTimeFormat(trial.clicksTime.at(1)),
    rect2_Press_timeT3: getTimeFormat(trial.clicksTime.at(2)),
    rect2_Release_timeT4: getTimeFormat(trial.clicksTime.at(3)),

    T2_T1_rect1_Release_rect1_Press_ms: getOnlyTimeFormat(
      trial.clicksTime.at(1) - trial.clicksTime.at(0),
    ),
    T3_T1_rect2_Press_rect1_Press_ms: getOnlyTimeFormat(
      trial.clicksTime.at(2) - trial.clicksTime.at(0),
    ),
    T4_T1_rect2_Release_rect1_Press_ms: getOnlyTimeFormat(
      trial.clicksTime.at(3) - trial.clicksTime.at(0),
    ),
    T3_T2_rect2_Press_rect1_Release_ms: getOnlyTimeFormat(
      trial.clicksTime.at(2) - trial.clicksTime.at(1),
    ),
    T4_T2_rect2_Release_rect1_Release_ms: getOnlyTimeFormat(
      trial.clicksTime.at(3) - trial.clicksTime.at(1),
    ),
    T4_T3_rect2_Release_rect2_Press_ms: getOnlyTimeFormat(
      trial.clicksTime.at(3) - trial.clicksTime.at(2),
    ),

    D2_D1_rect1_Release_rect1_Press_px: getDistance(
      trial.clicksCoords.at(0)?.x,
      trial.clicksCoords.at(0)?.y,
      trial.clicksCoords.at(1)?.x,
      trial.clicksCoords.at(1)?.y,
    ),
    D3_D1_rect2_Press_rect1_Press_px: getDistance(
      trial.clicksCoords.at(0)?.x,
      trial.clicksCoords.at(0)?.y,
      trial.clicksCoords.at(2)?.x,
      trial.clicksCoords.at(2)?.y,
    ),
    D4_D1_rect2_Release_rect1_Press_px: getDistance(
      trial.clicksCoords.at(0)?.x,
      trial.clicksCoords.at(0)?.y,
      trial.clicksCoords.at(3)?.x,
      trial.clicksCoords.at(3)?.y,
    ),
    D3_D2_rect2_Press_rect1_Release_px: getDistance(
      trial.clicksCoords.at(1)?.x,
      trial.clicksCoords.at(1)?.y,
      trial.clicksCoords.at(2)?.x,
      trial.clicksCoords.at(2)?.y,
    ),
    D4_D2_rect2_Release_rect1_Release_px: getDistance(
      trial.clicksCoords.at(1)?.x,
      trial.clicksCoords.at(1)?.y,
      trial.clicksCoords.at(3)?.x,
      trial.clicksCoords.at(3)?.y,
    ),
    D4_D3_rect2_Release_rect2_Press_px: getDistance(
      trial.clicksCoords.at(2)?.x,
      trial.clicksCoords.at(2)?.y,
      trial.clicksCoords.at(3)?.x,
      trial.clicksCoords.at(3)?.y,
    ),
    device: DEVICE_TYPE,
  };
}
