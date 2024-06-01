"use strict";

function mmToPixels(mm) {
  // https://www.calculatorsoup.com/calculators/technology/ppi-calculator.php
  const screenWidth = 1512; // Screen width in pixels
  const screenHeight = 982; // Screen height in pixels
  const screenDiagonal = 14.42; // Screen diagonal in pixel

  const inches = mm / 25.4;
  let result = inches * 151;
  //result = result.toFixed(2);
  //let res = Number(result);
  return result;

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

function testStartDistanceFromPreviousEnd(startX, startY) {
  if (!this.previousTrialEnd) {
    console.log("No previous trial to compare with.");
    return true;
  }

  let screenWidth = window.innerWidth;

  // Calculate the distance between the previous trial's end (target) and current trial's start
  let actualDistance = this.getDistance(
    startX,
    startY,
    this.previousTrialEnd.x,
    this.previousTrialEnd.y,
  );

  // Check if the actual distance is within the screen width
  if (actualDistance <= screenWidth) {
    console.log(
      "Test passed: The start is within screen width from the previous end.",
    );
  } else {
    console.log(
      "Test failed: The start exceeds screen width from the previous end.",
    );
  }
  return actualDistance <= screenWidth;
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

function calculateWrappingDimensions(
  rect1Width,
  rect1Height,
  rect2Width,
  rect2Height,
  distance,
  angle,
) {
  let radians = (angle * Math.PI) / 180;

  let x2 = distance * Math.cos(radians);
  let y2 = distance * Math.sin(radians);

  let minX = Math.min(0, x2);
  let maxX = Math.max(rect1Width, x2 + rect2Width);
  let minY = Math.min(0, y2);
  let maxY = Math.max(rect1Height, y2 + rect2Height);

  let wrappingWidth = maxX - minX;
  let wrappingHeight = maxY - minY;

  return { width: wrappingWidth, height: wrappingHeight };
}

function getCopyTrial(trial) {
  const copy = new Trial(
    trial.trialRep,
    trial.trialDirection,
    trial.startWidth,
    trial.startHeight,
    trial.targetWidth,
    trial.targetHeight,
    trial.amplitude,
  );
  copy.HIT = trial.HIT;
  copy.clicksCoords = trial.clicksCoords;
  copy.startCoords = trial.startCoords;
  copy.targetCoords = trial.targetCoords;
  copy.endCoords = trial.endCoords;
  copy.ambiguityMarginHit = trial.ambiguityMarginHit;
  copy.firstClickDone = false;
  copy.trialCompleted = false;
  copy.toBeRepeatedTrial = false;
  copy.targetPressIn = false;
  copy.targetReleaseIn = false;
  copy.previousTrial = null;
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
