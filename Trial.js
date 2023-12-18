class Trial {
  constructor(
    trialId,
    trialDirection,
    intDevice,
    startSize,
    targetWidth,
    targetHeight,
    amplitude,
    maxScreenPercentage,
    isDone,
  ) {
    this.trialId = trialId;
    this.trialDirection = trialDirection;
    this.intDevice = intDevice;
    this.startSize = startSize;
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.amplitude = amplitude;
    this.maxScreenPercentage = maxScreenPercentage;
    this.previousTrialEnd = {};
    this.targetPosition;
    this.isDone = isDone;

    this.successSound = new Audio("./sounds/success.wav");
    this.errorSound = new Audio("./sounds/err1.wav");

    this.start = document.getElementById("start");
    this.target = document.getElementById("target");
    this.body = document.getElementById("body");

    this.firstClickDone = false;
    this.firstClickData = false;
    this.targetClickData = null;
    this.bodyClickData = null;
    this.trialCompleted = false;
  }

  drawShapes() {
    this.trialCompleted = false;
    this.start.style.display = "block";
    this.start.style.width = mmToPixels(this.startSize) + "px";
    this.start.style.height = mmToPixels(this.startSize) + "px";
    this.start.style.position = "absolute";
    this.start.style.backgroundColor = "gray";

    this.target.style.display = "block";
    this.target.style.width = mmToPixels(this.targetWidth) + "px";
    this.target.style.height = mmToPixels(this.targetHeight) + "px";
    this.target.style.position = "absolute";
    this.target.style.backgroundColor = "yellow";

    const pos = this.generateDiagonalPositions();
    console.log(this.trialDirection);
    console.log(this.getDirection());
    this.start.style.left = pos.start.x + "px";
    this.start.style.top = pos.start.y + "px";
    this.target.style.left = pos.target.x + "px";
    this.target.style.top = pos.target.y + "px";
    this.setEndTrialPosition(pos.target);

    this.body.style.display = "block";
    this.body.style.width = window.innerWidth + "px";
    this.body.style.height = window.innerHeight + "px";

    this.testDiagonalPositions(this);
    this.testStartDistanceFromPreviousEnd(pos.start.x, pos.start.y);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.boundHandleStartPress = this.handleStartPress.bind(this);
    this.boundHandleStartRelease = this.handleStartRelease.bind(this);
    this.boundHandleTargetPress = this.handleTargetPress.bind(this);
    this.boundHandleTargetRelease = this.handleTargetRelease.bind(this);
    this.boundHandleBodyPress = this.handleBodyPress.bind(this);
    // Use bind to ensure 'this' inside the handlers refers to the Block instance
    this.start.addEventListener("mousedown", this.boundHandleStartPress);
    this.start.addEventListener("mouseup", this.boundHandleStartRelease);
  }

  handleStartPress(event) {
    if (event.button === 0 && !this.firstClickDone) {
      this.trialStartTime = Date.now();
      this.trialStarted = true;
      this.target.style.backgroundColor = "green";
      this.firstClickData = {
        name: "start",
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
        startHit: this.isCursorInsideShape(event, this.start),
      };
      console.log(this.firstClickData);
      this.firstClickDone = true;

      if (this.firstClickData.startHit) {
        this.successSound.play();
      }
    }
  }

  handleStartRelease(event) {
    if (!this.trialStarted) {
      this.errorSound.play();
    }
    this.start.style.display = "none";
    this.target.addEventListener("mousedown", this.boundHandleTargetPress);
    this.target.addEventListener("mouseup", this.boundHandleTargetRelease);
    this.body.addEventListener("mousedown", this.boundHandleBodyPress);
  }

  handleTargetRelease(event) {
    if (!this.trialStarted) {
      this.errorSound.play();
    }
    this.start.style.display = "none";
  }

  handleTargetPress(event) {
    if (
      event.button === 0 &&
      this.firstClickDone &&
      this.bodyClickData == null
    ) {
      this.targetClickData = {
        name: "target",
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
        targetHit: this.isCursorInsideShape(event, this.target),
      };

      console.log(this.targetClickData);

      if (this.targetClickData.targetHit) {
        this.successSound.play();
      } else {
        this.errorSound.play();
      }

      this.target.style.display = "none";
    }
    this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
    this.endTrial();
  }

  handleBodyPress(event) {
    if (
      event.button === 0 &&
      this.firstClickDone &&
      this.firstClickData != null &&
      this.targetClickData == null
    ) {
      this.bodyClickData = {
        name: "body",
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
        bodyHit: this.isCursorInsideShape(event, this.body),
      };
      console.log(this.bodyClickData);

      if (this.bodyClickData.bodyHit) {
        this.errorSound.play();
      }
      this.target.style.display = "none";
    }

    this.target.removeEventListener("mousedown", this.boundHandleTargetPress);
    this.target.removeEventListener("mousedown", this.boundHandleTargetRelease);
    this.endTrial();
  }

  isCursorInsideShape(event, shape) {
    const rect = shape.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  endTrial() {
    this.firstClickDone = false;
    this.targetClickData = null;
    this.firstClickData = null;
    this.bodyClickData = null;
    this.trialStarted = false;

    this.target.removeEventListener("mousedown", this.boundHandleTargetPress);
    this.target.removeEventListener("mouseup", this.boundHandleTargetRelease);
    this.start.removeEventListener("mousedown", this.boundHandleStartPress);
    this.start.removeEventListener("mouseup", this.boundHandleStartRelease);
    this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
    this.trialCompleted = true;
    this.isDone = experimentFrame.trialCompleted();
  }

  getTimeFormat(date) {
    // Get the individual components of the date.
    const now = new Date(date);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // January is 0 in JavaScript
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    // Construct the formatted timestamp string.
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}.${milliseconds}`;
  }

  formatDuration = (ms) => {
    if (ms < 0) ms = -ms;
    const time = {
      day: Math.floor(ms / 86400000),
      hour: Math.floor(ms / 3600000) % 24,
      minute: Math.floor(ms / 60000) % 60,
      second: Math.floor(ms / 1000) % 60,
      millisecond: Math.floor(ms) % 1000,
    };
    return Object.entries(time)
      .filter((val) => val[1] !== 0)
      .map(([key, val]) => `${val} ${key}${val !== 1 ? "s" : ""}`)
      .join(", ");
  };

  getDirection() {
    switch (this.trialDirection) {
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
    return "wrong direction!";
  }

  setPreviousTrialPosition(trialEnd) {
    this.previousTrialEnd = trialEnd;
  }

  getEndTrialPosition() {
    return this.targetPosition;
  }

  setEndTrialPosition(t) {
    this.targetPosition = t;
  }

  getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  generateDiagonalPositions() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let maxDistanceWidth = (this.maxScreenPercentage * canvasWidth) / 100;
    let maxDistanceHeight = (this.maxScreenPercentage * canvasHeight) / 100;
    let maxDiagonalDistance = Math.sqrt(
      Math.pow(maxDistanceWidth, 2) + Math.pow(maxDistanceHeight, 2),
    );
    let amplitude = mmToPixels(this.amplitude);
    let width1 = mmToPixels(this.startSize);
    let height1 = mmToPixels(this.startSize);
    let width2 = mmToPixels(this.targetWidth);
    let height2 = mmToPixels(this.targetHeight);

    let topMargin = mmToPixels(5);
    let otherMargins = mmToPixels(3);
    let start, target, x1, y1, x2, y2;

    do {
      // Generate potential start coordinates within bounds and margins
      x1 =
        Math.random() * (canvasWidth - width1 - 2 * otherMargins) +
        width1 / 2 +
        otherMargins;
      y1 =
        Math.random() * (canvasHeight - height1 - topMargin - otherMargins) +
        height1 / 2 +
        topMargin;

      // Calculate target position based on amplitude and angle
      let angle = this.trialDirection;
      x2 = x1 + amplitude * Math.cos((angle * Math.PI) / 180);
      y2 = y1 + amplitude * Math.sin((angle * Math.PI) / 180);

      // Check if the target is within bounds and the distance is correct
      if (
        this.getDistance(x1, y1, x2, y2) === amplitude &&
        x2 - width2 / 2 > otherMargins &&
        x2 + width2 / 2 < canvasWidth - otherMargins &&
        y2 - height2 / 2 > topMargin &&
        y2 + height2 / 2 < canvasHeight - otherMargins
      ) {
        start = { x: x1 - width1 / 2, y: y1 - height1 / 2 };
        target = { x: x2 - width2 / 2, y: y2 - height2 / 2 };
        return { start, target };
      }
    } while (!start || !target); // Repeat if a valid position was not found

    return { start, target };
  }

  testDiagonalPositions() {
    // Generate the positions
    const positions = this.generateDiagonalPositions();

    // Extract the centers of the start and target rectangles
    const centerX1 = positions.start.x + mmToPixels(this.startSize) / 2;
    const centerY1 = positions.start.y + mmToPixels(this.startSize) / 2;
    const centerX2 = positions.target.x + mmToPixels(this.targetWidth) / 2;
    const centerY2 = positions.target.y + mmToPixels(this.targetHeight) / 2;

    // Calculate the distance between the centers
    const distance = this.getDistance(centerX1, centerY1, centerX2, centerY2);

    // Convert the amplitude from millimeters to pixels
    const amplitudeInPixels = mmToPixels(this.amplitude);
    console.log("amplitudepx:" + amplitudeInPixels);
    console.log("amplitudemm:" + this.amplitude);
    console.log("distancepx:" + distance);
    console.log("distancemm:" + pxToMM(distance));

    // Check if the distance is equal to the amplitude
    if (Math.abs(distance - amplitudeInPixels) < 1e-5) {
      // Using a small threshold to account for floating point inaccuracies
    } else {
      console.error(
        "Test failed: The distance between the centers is not equal to the amplitude.",
      );
      throw Error("DISTANCE NOT OK");
    }
  }

  testStartDistanceFromPreviousEnd(startX, startY) {
    if (!this.previousTrialEnd) {
      console.log("No previous trial to compare with.");
      return;
    }

    // Calculate the screen width
    let screenWidth = (this.maxScreenPercentage * window.innerWidth) / 100;

    // Calculate the distance between the previous trial's end (target) and current trial's start
    let actualDistance = this.getDistance(
      startX,
      startY,
      this.previousTrialEnd.x,
      this.previousTrialEnd.y,
    );

    console.log("MAX WIDTH: " + screenWidth);
    console.log("actual distance: " + actualDistance);
    // Check if the actual distance is within the screen width
    if (actualDistance <= screenWidth) {
      console.log(
        "Test passed: The start is within screen width from the previous end.",
      );
    } else {
      console.error(
        "Test failed: The start exceeds screen width from the previous end.",
      );
    }
    return actualDistance <= screenWidth;
  }
}

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

function pxToMM(px) {
  return (px / 151) * 25.4;
}
