class Trial {
  constructor(
    trialId,
    trialRep,
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
    (this.trialRep = trialRep), (this.trialDirection = trialDirection);
    this.intDevice = intDevice;
    this.startSize = startSize;
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.amplitude = amplitude;
    this.maxScreenPercentage = maxScreenPercentage;
    this.previousTrialEnd = {};
    this.isDone = isDone;
    this.isFailedNumber = 4; // Trial failed if distance < mmToPixels(this.amplitude) / this.isFailedNumber;

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

    this.startCoords = { x: null, y: null };
    this.targetCoords = { x: null, y: null };
    this.HIT = null;

    this.clicksTime = [];
    this.clicksCoords = [];

    this.mouseEvents = [];
  }

  drawShapes() {
    console.log("Trial id: " + this.trialId);
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

    this.start.style.left = pos.start.x + "px";
    this.start.style.top = pos.start.y + "px";
    this.target.style.left = pos.target.x + "px";
    this.target.style.top = pos.target.y + "px";

    this.startCoords = pos.start;
    this.targetCoords = pos.target;

    this.body.style.display = "block";
    this.body.style.width = window.innerWidth + "px";
    this.body.style.height = window.innerHeight + "px";

    this.testDiagonalPositions(this);
    //this.testStartDistanceFromPreviousEnd(pos.start.x, pos.start.y);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.boundHandleStartPress = this.handleStartPress.bind(this);
    this.boundHandleStartRelease = this.handleStartRelease.bind(this);
    this.boundHandleTargetPress = this.handleTargetPress.bind(this);
    this.boundHandleTargetRelease = this.handleTargetRelease.bind(this);
    this.boundHandleBodyPress = this.handleBodyPress.bind(this);
    this.boundHandleBodyRelease = this.handleBodyRelease.bind(this);
    // Use bind to ensure 'this' inside the handlers refers to the Block instance
    this.start.addEventListener("mousedown", this.boundHandleStartPress);
    this.start.addEventListener("mouseup", this.boundHandleStartRelease);
  }

  handleStartPress(event) {
    if (event.button === 0 && !this.firstClickDone) {
      this.trialStarted = true;
      this.target.style.backgroundColor = "green";
      this.firstClickData = {
        name: "start",
        x: event.clientX,
        y: event.clientY,
        time: new Date(),
        startHit: this.isCursorInsideShape(event, this.start),
      };
      this.firstClickDone = true;
      if (this.firstClickData.startHit) {
        this.successSound.play();

        this.logMouseEvent(event);
      }
    }
  }

  handleStartRelease(event) {
    if (!this.trialStarted) {
      this.errorSound.play();
    }

    this.logMouseEvent(event);

    this.start.style.display = "none";
    this.target.addEventListener("mousedown", this.boundHandleTargetPress);
    this.target.addEventListener("mouseup", this.boundHandleTargetRelease);
    this.body.addEventListener("mousedown", this.boundHandleBodyPress);
    this.body.addEventListener("mouseup", this.boundHandleBodyRelease);
  }

  handleTargetRelease(event) {
    if (!this.trialStarted) {
      this.errorSound.play();
    }

    this.logMouseEvent(event);

    this.endTrial();
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
        time: new Date(),
        targetHit: this.isCursorInsideShape(event, this.target),
      };
      this.logMouseEvent(event);

      if (this.targetClickData.targetHit) {
        this.HIT = this.targetClickData.targetHit;
        this.successSound.play();
      } else {
        this.HIT = 0;
        this.errorSound.play();
      }
    }
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
        time: new Date(),
        bodyHit: this.isCursorInsideShape(event, this.body),
      };

      this.logMouseEvent(event);

      if (this.bodyClickData.bodyHit) {
        this.HIT = 0;
        this.errorSound.play();
      }
      this.target.style.display = "none";
    }

    this.target.removeEventListener("mousedown", this.boundHandleTargetPress);
    this.target.removeEventListener("mousedown", this.boundHandleTargetRelease);
  }

  handleBodyRelease(event) {
    if (!this.targetClickData && this.bodyClickData) {
      this.logMouseEvent(event);

      this.endTrial();
    }
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
    //this.getExportDataTrial();
    experimentFrame.data = this.getExportDataTrial();
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

  getTrialID() {
    return this.trialId;
  }

  getTimeFormat(date) {
    const now = new Date(date);
    const month = String(now.getMonth() + 1).padStart(2, "0"); // January is 0 in JavaScript
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    return `${day}.${month} T ${hour}:${minutes}:${seconds}.${milliseconds}`;
  }

  getOnlyTimeFormat(date) {
    const now = new Date(date);
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    return `${seconds}.${milliseconds}`;
  }

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
    return this.targetCoords;
  }

  isFailed() {
    const clickStartX1 = this.startCoords.x;
    const clickStartY1 = this.startCoords.y;

    if (this.clicksCoords.at(2).x === undefined) {
      return true;
    }
    const clickTargetX2 = this.clicksCoords.at(2).x;
    const clickTargetY2 = this.clicksCoords.at(2).y;

    let distance = this.getDistance(
      clickStartX1,
      clickStartY1,
      clickTargetX2,
      clickTargetY2,
    );
    return distance < mmToPixels(this.amplitude) / this.isFailedNumber;
  }

  // Euclidean distance takes 2 points (x1,y1) and (x2,y2) and returns the straight-line distance between them
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
    const positions = this.generateDiagonalPositions();
    const centerX1 = positions.start.x + mmToPixels(this.startSize) / 2;
    const centerY1 = positions.start.y + mmToPixels(this.startSize) / 2;
    const centerX2 = positions.target.x + mmToPixels(this.targetWidth) / 2;
    const centerY2 = positions.target.y + mmToPixels(this.targetHeight) / 2;

    const distance = this.getDistance(centerX1, centerY1, centerX2, centerY2);
    const amplitudeInPixels = mmToPixels(this.amplitude);

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

    let screenWidth = (this.maxScreenPercentage * window.innerWidth) / 100;

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
      console.error(
        "Test failed: The start exceeds screen width from the previous end.",
      );
    }
    return actualDistance <= screenWidth;
  }

  logMouseEvent(event) {
    this.clicksTime.push(new Date());
    this.clicksCoords.push({
      x: event.clientX,
      y: event.clientY,
    });
  }

  getExportDataTrial() {
    return {
      userNumber: null,
      blockNumber: null,
      trialNumber: this.trialId,
      trialRep: this.trialRep,
      experimentType: null,

      amplitudeMM: this.amplitude,
      amplitudePx: mmToPixels(this.amplitude),
      directionDegree: this.trialDirection,
      direction: this.getDirection(this.trialDirection),

      startX: this.startCoords.x,
      startY: this.startCoords.y,
      startWidthPx: mmToPixels(this.startSize),
      startHeightPx: mmToPixels(this.startSize),

      targetX: this.targetCoords.x,
      targetY: this.targetCoords.y,
      targetWidthPx: mmToPixels(this.targetWidth),
      targetHeightPx: mmToPixels(this.targetHeight),

      HIT: this.HIT ? 1 : 0,
      isFailed: this.isFailed(),

      T0: this.getTimeFormat(this.clicksTime.at(0)), //this.clicksTime.at(0),
      T1: this.getTimeFormat(this.clicksTime.at(1)),
      T2: this.getTimeFormat(this.clicksTime.at(2)),
      T3: this.getTimeFormat(this.clicksTime.at(3)),

      "T1-T0": this.getOnlyTimeFormat(
        this.clicksTime.at(1) - this.clicksTime.at(0),
      ),
      "T2-T0": this.getOnlyTimeFormat(
        this.clicksTime.at(2) - this.clicksTime.at(0),
      ),
      "T3-T0": this.getOnlyTimeFormat(
        this.clicksTime.at(3) - this.clicksTime.at(0),
      ),
      "T2-T1": this.getOnlyTimeFormat(
        this.clicksTime.at(2) - this.clicksTime.at(1),
      ),
      "T3-T1": this.getOnlyTimeFormat(
        this.clicksTime.at(3) - this.clicksTime.at(1),
      ),
      "T3-T2": this.getOnlyTimeFormat(
        this.clicksTime.at(3) - this.clicksTime.at(2),
      ),

      "Click T0 X": this.clicksCoords.at(0).x,
      "Click T0 Y": this.clicksCoords.at(0).y,

      "Click T1 X": this.clicksCoords.at(1).x,
      "Click T1 Y": this.clicksCoords.at(1).y,

      "Click T2 X": this.clicksCoords.at(2).x,
      "Click T2 Y": this.clicksCoords.at(2).y,

      "Click T3 X": this.clicksCoords.at(3).x,
      "Click T3 Y": this.clicksCoords.at(3).y,

      "Distance T1 to T0 ": this.getDistance(
        this.clicksCoords.at(0).x,
        this.clicksCoords.at(0).y,
        this.clicksCoords.at(1).x,
        this.clicksCoords.at(1).y,
      ),
      "Distance T2 toT0 ": this.getDistance(
        this.clicksCoords.at(0).x,
        this.clicksCoords.at(0).y,
        this.clicksCoords.at(2).x,
        this.clicksCoords.at(2).y,
      ),
      "Distance T3 to T0 ": this.getDistance(
        this.clicksCoords.at(0).x,
        this.clicksCoords.at(0).y,
        this.clicksCoords.at(3).x,
        this.clicksCoords.at(3).y,
      ),
      "Distance T2 to T1 ": this.getDistance(
        this.clicksCoords.at(1).x,
        this.clicksCoords.at(1).y,
        this.clicksCoords.at(2).x,
        this.clicksCoords.at(2).y,
      ),
      "Distance T3 to T1 ": this.getDistance(
        this.clicksCoords.at(1).x,
        this.clicksCoords.at(1).y,
        this.clicksCoords.at(3).x,
        this.clicksCoords.at(3).y,
      ),
      "Distance T3 to T2 ": this.getDistance(
        this.clicksCoords.at(2).x,
        this.clicksCoords.at(2).y,
        this.clicksCoords.at(3).x,
        this.clicksCoords.at(3).y,
      ),
    };
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
