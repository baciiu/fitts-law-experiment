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

function generateCenterPointWithAmplitude(x, y, amplitude, angle) {
  const angleRadians = angle * (Math.PI / 180);
  return {
    x: x + amplitude * Math.cos(angleRadians),
    y: y + amplitude * Math.sin(angleRadians),
  };
}

function getInput() {
  return [
    { width: 10, height: 10, angle: 0, amplitude: 100 },
    { width: 15, height: 10, angle: 180, amplitude: 100 },
    { width: 20, height: 20, angle: 0, amplitude: 100 },
    { width: 10, height: 20, angle: 180, amplitude: 100 },
    { width: 20, height: 20, angle: 90, amplitude: 100 },
    { width: 10, height: 20, angle: 270, amplitude: 100 },
    { width: 20, height: 20, angle: 90, amplitude: 100 },
    { width: 10, height: 20, angle: 270, amplitude: 100 },
    //{ width: 20, height: 10 },
    //{ width: 25, height: 10 },
    //{ width: 40, height: 20 },
  ];
}
