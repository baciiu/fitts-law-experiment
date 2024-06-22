"use strict";

function mmToPixels(mm) {
  // https://www.calculatorsoup.com/calculators/technology/ppi-calculator.php
  //const screenWidth = 1512; // Screen width in pixels
  //const screenHeight = 982; // Screen height in pixels
  //const screenDiagonal = 14.42; // Screen diagonal in pixel

  const inches = mm / 25.4;
  let result = inches * 126.5;
  //result = result.toFixed(2);
  //let res = Number(result);
  return result;

  // Pixels per inch (PPI)
  // resolution 1800px x 1169 px  diag inch 14.4 => ppi 149.1 // update 151 is more accurate
  // resolution 1512 px x 982 px diag inch 14.4 => ppi 125.20 // update 127 is more accurate
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
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `${seconds}.${milliseconds}`;
}

function isMobile() {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}

function getDirection(direction) {
  switch (direction) {
    case 0:
      return "right";
    case 90:
      return "down";
    case 180:
      return "left";
    case 270:
      return "up";
    default:
      return "diagonal";
  }
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

function getRandomIndexForItem(array, startIndex) {
  // Ensure the startIndex is within the array bounds and not the last element
  if (startIndex < 0 || startIndex >= array.length - 1) {
    throw Error("[MY ERROR]: Invalid startIndex. Item not inserted.");
  }

  // Generate a random index in the range from startIndex + 1 to the array length inclusive
  const rand = Math.random();
  const randomIndex =
    Math.floor(rand * (array.length - startIndex)) + startIndex + 1;
  return randomIndex;
}

function insertTrialInArray(array, trial, startIndex) {
  checkIfInstanceOfTrial(trial);
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

function checkIfInstanceOfTrial(newItem) {
  if (!(newItem instanceof Trial)) {
    throw Error(ERROR_TRIAL_INSTANCE);
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
  this.checkIfInstanceOfTrial(item);
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

function getDirectionList(startAngle, stepSize) {
  const endAngle = 360;
  let angles = [];
  for (let angle = startAngle; angle < endAngle; angle += stepSize) {
    angles.push(angle);
  }
  console.log(angles);
  return angles;
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
