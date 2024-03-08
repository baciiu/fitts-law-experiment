class Trial {
  TOP_MARGIN_PX = mmToPixels(5);
  OTHER_MARGINS_PX = mmToPixels(3);
  FAILED_TRIAL_THRESHOLD = 4;
  AMBIGUITY_MARGIN_PX = mmToPixels(20);
  PressAndReleaseMustBeInsideTarget = true;
  EndTrialByTargetPress = false;

  // T & F => press inside, release inside, end trial
  // T & T => no sense cannot be both true at the same time
  // F & T => press inside, end trial
  // F & F => no sense cannot be both false at the same time

  constructor(
    trialId,
    trialRep,
    trialDirection,
    experimentType,
    intDevice,
    startWidth,
    startHeight,
    targetWidth,
    targetHeight,
    amplitude,
    maxScreenPercentage,
  ) {
    this.trialId = trialId;
    this.trialRep = trialRep;
    this.trialDirection = trialDirection;
    this.experimentType = experimentType;
    this.intDevice = intDevice;
    this.startWidth = startWidth;
    this.startHeight = startHeight;
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.amplitude = amplitude;
    this.maxScreenPercentage = maxScreenPercentage;
    this.previousTrialEnd = {};
    this.isAmbiguityMarginHit = false;

    this.successSound = new Audio("./sounds/success.wav");
    this.errorSound = new Audio("./sounds/err1.wav");

    this.start = document.getElementById("start");
    this.target = document.getElementById("target");
    this.body = document.getElementById("body");

    this.firstClickDone = false;
    this.trialCompleted = false;
    this.isFailedTrial = false;
    this.bodyIsPressed = false;

    this.startCoords = { x: null, y: null };
    this.targetCoords = { x: null, y: null };
    this.HIT = null;

    this.clicksTime = [];
    this.clicksCoords = [];
  }

  drawStart(start) {
    this.start.style.display = "block";
    this.start.style.width = mmToPixels(this.startWidth) + "px";
    this.start.style.height = mmToPixels(this.startHeight) + "px";
    this.start.style.position = "absolute";
    this.start.style.left = start.x + "px";
    this.start.style.top = start.y + "px";
    this.startCoords = start;
    this.start.style.backgroundColor = "gray";
  }

  drawTarget(target) {
    this.target.style.display = "block";
    this.target.style.width = mmToPixels(this.targetWidth) + "px";
    this.target.style.height = mmToPixels(this.targetHeight) + "px";
    this.target.style.position = "absolute";
    this.target.style.left = target.x + "px";
    this.target.style.top = target.y + "px";
    this.targetCoords = target;
    this.target.style.backgroundColor = "yellow";
  }

  drawBody() {
    this.body.style.display = "block";
    this.body.style.width = window.innerWidth + "px";
    this.body.style.height = window.innerHeight + "px";
  }

  drawShapes() {
    if (this.experimentType === "discrete") {
      this.drawDiscreteShapes();
    } else if (this.experimentType === "reciprocal") {
      this.drawReciprocalShapes();
    } else {
      throw Error("[MY ERROR]: Experiment type undefined.");
    }
  }

  drawDiscreteShapes() {
    this.trialCompleted = false;

    const pos = this.generateDiscretePositions();
    this.checkIfCoordinatesFitTheScreen(pos);

    this.drawStart(pos.start);
    this.drawTarget(pos.target);
    this.drawBody();

    // testStartDistanceFromPreviousEnd(pos.start.x, pos.start.y);
    this.setupEventHandlers();
  }

  drawReciprocalShapes() {
    this.trialCompleted = false;

    const pos = this.generateReciprocalPositions();
    this.checkIfCoordinatesFitTheScreen(pos);
    this.drawStart(pos.start);
    this.drawTarget(pos.target);
    this.drawBody();

    // testStartDistanceFromPreviousEnd(pos.start.x, pos.start.y);
    this.setupEventHandlers();
  }

  checkIfCoordinatesFitTheScreen(pos) {
    if (
      !(
        pos.start &&
        pos.target &&
        pos.start.x &&
        pos.start.y &&
        pos.target.x &&
        pos.target.y
      )
    ) {
      throw Error(
        "[MY ERROR]: Could not generate a valid position for the screen size! ",
      );
    }
  }

  setupEventHandlers() {
    this.boundHandleStartPress = this.handleStartPress.bind(this);
    this.boundHandleStartRelease = this.handleStartRelease.bind(this);
    this.boundHandleBodyPress = this.handleBodyPress.bind(this);
    this.boundHandleBodyRelease = this.handleBodyRelease.bind(this);

    this.start.addEventListener("mousedown", this.boundHandleStartPress);
    this.start.addEventListener("mouseup", this.boundHandleStartRelease);
  }

  handleStartPress(event) {
    console.log("handleStartPress");
    const isTouchEvent = event.touches && event.touches.length > 0;

    if (!this.firstClickDone) {
      this.logMouseEvent(event, 0);
      this.successSound.play();
      this.firstClickDone = true;
      this.trialStarted = true;
    } else {
      this.errorSound.play();
      this.start.removeEventListener("mousedown", this.boundHandleStartPress);
      this.start.removeEventListener("touchstart", this.boundHandleStartPress);
    }
  }

  handleStartRelease(event) {
    console.log("handleStartRelease");
    const isTouchEvent = event.touches && event.touches.length > 0;
    const isInsideStart = this.isCursorInsideShape(event, this.start);
    if (!this.trialStarted) {
      this.errorSound.play();
    } else if (this.trialStarted) {
      if (isInsideStart) {
        this.logMouseEvent(event, 1);
        this.target.style.backgroundColor = "green";
        this.start.style.display = "none";
        this.start.removeEventListener("mouseup", this.boundHandleStartRelease);
        this.start.removeEventListener(
          "touchend",
          this.boundHandleStartRelease,
        ); // Remove touchend listener if added
        this.body.addEventListener("mousedown", this.boundHandleBodyPress);
        this.body.addEventListener("touchstart", this.boundHandleBodyPress); // Add touchstart listener for the body
        this.body.addEventListener("mouseup", this.boundHandleBodyRelease);
        this.body.addEventListener("touchend", this.boundHandleBodyRelease); // Add touchend listener for the body
      } else {
        this.errorSound.play();
      }
    }
  }

  handleBodyPress(event) {
    console.log("handleBodyPress");
    const isTouchEvent = event.touches && event.touches.length > 0;
    if (this.trialStarted && this.firstClickDone) {
      this.logMouseEvent(event, 2);

      const insideTarget = this.isCursorInsideShape(event, this.target);
      this.HIT = insideTarget ? 1 : 0;
      this.bodyIsPressed = true;
      console.log(this.HIT);

      if (insideTarget) {
        if (this.EndTrialByTargetPress) {
          this.successSound.play();
          this.target.style.display = "none";
          this.endTrial();
        } else if (!this.PressAndReleaseMustBeInsideTarget) {
          // Scenario (F & F): Press does not have to be inside target; ignore this scenario or treat as invalid
          console.log("Scenario (F & F) is not handled or invalid.");
        }
      } else {
        this.errorSound.play();
        if (
          this.PressAndReleaseMustBeInsideTarget ||
          this.EndTrialByTargetPress
        ) {
          this.target.style.display = "none";
          this.isFailedTrial = this.isFailed();
          this.endTrial();
        }
      }
      this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
      this.body.removeEventListener("touchstart", this.boundHandleBodyPress);
    }
  }

  handleBodyRelease(event) {
    console.log("handleBodyRelease");
    const isTouchEvent =
      event.changedTouches && event.changedTouches.length > 0;
    const insideTarget = this.isCursorInsideShape(event, this.target);
    const isInsideStart = this.isCursorInsideShape(event, this.start);
    if (this.trialStarted && this.firstClickDone && this.bodyIsPressed) {
      console.log("handleBodyRelease OK");
      this.logMouseEvent(event, 3);

      if (
        this.PressAndReleaseMustBeInsideTarget &&
        !this.EndTrialByTargetPress
      ) {
        // Scenario (T & F): Both press and release must be inside target
        if (insideTarget && this.HIT === 1) {
          this.successSound.play();
          this.target.style.display = "none";
          this.endTrial();
        } else {
          this.errorSound.play();
          this.isFailedTrial = this.isFailed();
          this.endTrial();
        }
      } else {
        // If (F & T) was handled in press, this block might not be needed
        console.log(
          "Release action under (F & T) or (F & F) is not applicable.",
        );
      }
      this.body.removeEventListener("mouseup", this.boundHandleBodyRelease);
      this.body.removeEventListener("touchend", this.boundHandleBodyRelease);
    }
  }

  isCursorInsideShape(event, shape) {
    const rect = shape.getBoundingClientRect();

    let isCursorInsideShape =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    //console.log("isCursorInsideShape: " + isCursorInsideShape);

    if (this.intDevice === "Touch") {
      const extendedRect = {
        left: rect.left - this.AMBIGUITY_MARGIN_PX,
        top: rect.top - this.AMBIGUITY_MARGIN_PX,
        right: rect.right + this.AMBIGUITY_MARGIN_PX,
        bottom: rect.bottom + this.AMBIGUITY_MARGIN_PX,
      };

      let isTouchInsideMargin =
        event.clientX >= extendedRect.left &&
        event.clientX <= extendedRect.right &&
        event.clientY >= extendedRect.top &&
        event.clientY <= extendedRect.bottom;

      if (!isCursorInsideShape && isTouchInsideMargin) {
        this.isAmbiguityMarginHit = true;
      }
      //console.log("isTouchInsideMargin: " + isTouchInsideMargin);
      return isTouchInsideMargin;
    }
    return isCursorInsideShape;
  }

  endTrial() {
    const trialData = this.getExportDataTrial();
    const trialCopy = JSON.parse(JSON.stringify(this));

    this.cleanupTrial();
    // Dispatch the custom event with the trial data
    const event = new CustomEvent("trialCompleted", {
      detail: { trialData, trialCopy },
    });
    document.dispatchEvent(event);
  }

  cleanupTrial() {
    // Your cleanup code here...
    this.firstClickDone = false;
    this.trialStarted = false;
    this.bodyIsPressed = false;

    this.target.removeEventListener("mousedown", this.boundHandleTargetPress);
    this.target.removeEventListener("mouseup", this.boundHandleTargetRelease);
    this.start.removeEventListener("mousedown", this.boundHandleStartPress);
    this.start.removeEventListener("mouseup", this.boundHandleStartRelease);
    this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
  }

  getTrialID() {
    return this.trialId;
  }

  isFailed() {
    const clickStartX1 = this.startCoords.x;
    const clickStartY1 = this.startCoords.y;

    if (this.clicksCoords.at(2) === undefined) {
      return true;
    }
    const clickTargetX2 = this.clicksCoords.at(2).x;
    const clickTargetY2 = this.clicksCoords.at(2).y;

    let distance = getDistance(
      clickStartX1,
      clickStartY1,
      clickTargetX2,
      clickTargetY2,
    );
    return distance < mmToPixels(this.amplitude) / this.FAILED_TRIAL_THRESHOLD;
  }

  getRandomPoint(width1, height1) {
    const x1 =
      Math.random() * (window.innerWidth - width1 - 2 * this.OTHER_MARGINS_PX) +
      width1 / 2 +
      this.OTHER_MARGINS_PX;
    const y1 =
      Math.random() *
        (window.innerHeight -
          height1 -
          this.TOP_MARGIN_PX -
          this.OTHER_MARGINS_PX) +
      height1 / 2 +
      this.TOP_MARGIN_PX;
    return { x: x1, y: y1 };
  }

  isShapeWithinBounds(x, y, width, height) {
    return (
      this.isLeftEdgeWithinBounds(x, width) &&
      this.isRightEdgeWithinBounds(x, width) &&
      this.isTopEdgeWithinBounds(y, height) &&
      this.isBottomEdgeWithinBounds(y, height)
    );
  }

  isLeftEdgeWithinBounds(x, width) {
    return x - width / 2 > this.OTHER_MARGINS_PX;
  }

  isRightEdgeWithinBounds(x, width) {
    return x + width / 2 < window.innerWidth - this.OTHER_MARGINS_PX;
  }

  isTopEdgeWithinBounds(y, height) {
    return y - height / 2 > this.TOP_MARGIN_PX;
  }

  isBottomEdgeWithinBounds(y, height) {
    return y + height / 2 < window.innerHeight - this.TOP_MARGIN_PX;
  }

  isAmplitude(x1, y1, x2, y2, amplitude) {
    const distance = getDistance(x1, y1, x2, y2);
    const tolerance = 1;
    return Math.abs(distance - amplitude) <= tolerance;
  }

  generateDiscretePositions() {
    let amplitude = mmToPixels(this.amplitude);
    let width1 = mmToPixels(this.startWidth);
    let height1 = mmToPixels(this.startHeight);
    let width2 = mmToPixels(this.targetWidth);
    let height2 = mmToPixels(this.targetHeight);
    let start,
      target,
      x1,
      y1,
      x2,
      y2,
      count = 0,
      maxcount = 100;

    do {
      const startCoords = this.getRandomPoint(width1, height1);
      x1 = startCoords.x;
      y1 = startCoords.y;

      let angle = this.trialDirection;

      const targetCoords = generateCenterPointWithAmplitude(
        x1,
        y1,
        amplitude,
        angle,
      );
      x2 = targetCoords.x;
      y2 = targetCoords.y;

      if (
        this.isAmplitude(x1, y1, x2, y2, amplitude) &&
        this.isShapeWithinBounds(x2, y2, width2, height2)
      ) {
        start = { x: x1 - width1 / 2, y: y1 - height1 / 2 };
        target = { x: x2 - width2 / 2, y: y2 - height2 / 2 };
        return { start, target };
      }
    } while (!start || !target);
    if (count > maxcount) {
      const dis = this.generateReciprocalPositions();
      if (
        !dis.start ||
        !dis.target ||
        !dis.start.x ||
        !dis.start.y ||
        !dis.target.x ||
        !dis.target.y
      ) {
        throw Error("[MY ERROR]:  Could not generate a valid position");
      }
      start = dis.start;
      target = dis.target;
      return { start, target };
    }
    return { start, target };
  }

  generateReciprocalPositions() {
    let amplitude = mmToPixels(this.amplitude);
    let width1 = mmToPixels(this.startWidth);
    let height1 = mmToPixels(this.startHeight);
    let width2 = mmToPixels(this.targetWidth);
    let height2 = mmToPixels(this.targetHeight);
    let start, target, x1, y1, x2, y2;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const angle = this.trialDirection;

    const radians = (angle * Math.PI) / 180; // Convert angle to radians

    x1 = centerX + (amplitude / 2) * Math.cos(radians);
    y1 = centerY + (amplitude / 2) * Math.sin(radians);

    x2 = centerX - (amplitude / 2) * Math.cos(radians);
    y2 = centerY - (amplitude / 2) * Math.sin(radians);

    if (
      this.isAmplitude(x1, y1, x2, y2, amplitude) &&
      this.isShapeWithinBounds(x2, y2, width2, height2)
    ) {
      start = { x: x1 - width1 / 2, y: y1 - height1 / 2 };
      target = { x: x2 - width2 / 2, y: y2 - height2 / 2 };
      return { start, target };
    }
    if (!start || !target) {
      throw Error("[MY ERROR]: Could not generate a valid position");
    }
    return { start, target };
  }

  logMouseEvent(event, index) {
    this.clicksTime[index] = new Date();
    this.clicksCoords[index] = { x: event.clientX, y: event.clientY };
  }

  getExportDataTrial() {
    return {
      userNumber: "",
      blockNumber: "",
      trialNumber: this.trialId,
      trialRep: this.trialRep,
      experimentType: this.experimentType,
      device: this.intDevice,

      amplitudeMM: this.amplitude,
      amplitudePx: mmToPixels(this.amplitude),
      directionDegree: this.trialDirection,
      direction: getDirection(this.trialDirection),

      startX: this.startCoords.x,
      startY: this.startCoords.y,
      startWidthPx: mmToPixels(this.startWidth),
      startHeightPx: mmToPixels(this.startHeight),

      targetX: this.targetCoords.x,
      targetY: this.targetCoords.y,
      targetWidthPx: mmToPixels(this.targetWidth),
      targetHeightPx: mmToPixels(this.targetHeight),

      HIT: this.HIT ? 1 : 0,
      AmbiguityMarginHIT: this.isAmbiguityMarginHit ? 1 : 0,
      isFailedTrial: this.isFailedTrial,

      PressAndReleaseMustBeInsideTarget: this.PressAndReleaseMustBeInsideTarget,
      EndTrialByTargetPress: this.EndTrialByTargetPress,

      T0: getTimeFormat(this.clicksTime.at(0)),
      T1: getTimeFormat(this.clicksTime.at(1)),
      T2: getTimeFormat(this.clicksTime.at(2)),
      T3: getTimeFormat(this.clicksTime.at(3)),

      "T1-T0": getOnlyTimeFormat(this.clicksTime.at(1) - this.clicksTime.at(0)),
      "T2-T0": getOnlyTimeFormat(this.clicksTime.at(2) - this.clicksTime.at(0)),
      "T3-T0": getOnlyTimeFormat(this.clicksTime.at(3) - this.clicksTime.at(0)),
      "T2-T1": getOnlyTimeFormat(this.clicksTime.at(2) - this.clicksTime.at(1)),
      "T3-T1": getOnlyTimeFormat(this.clicksTime.at(3) - this.clicksTime.at(1)),
      "T3-T2": getOnlyTimeFormat(this.clicksTime.at(3) - this.clicksTime.at(2)),

      "Click T0 X": this.clicksCoords.at(0)?.x,
      "Click T0 Y": this.clicksCoords.at(0)?.y,

      "Click T1 X": this.clicksCoords.at(1)?.x,
      "Click T1 Y": this.clicksCoords.at(1)?.y,

      "Click T2 X": this.clicksCoords.at(2)?.x,
      "Click T2 Y": this.clicksCoords.at(2)?.y,

      "Click T3 X": this.clicksCoords.at(3)?.x,
      "Click T3 Y": this.clicksCoords.at(3)?.y,

      "Distance T1 to T0 ": getDistance(
        this.clicksCoords.at(0)?.x,
        this.clicksCoords.at(0)?.y,
        this.clicksCoords.at(1)?.x,
        this.clicksCoords.at(1)?.y,
      ),
      "Distance T2 toT0 ": getDistance(
        this.clicksCoords.at(0)?.x,
        this.clicksCoords.at(0)?.y,
        this.clicksCoords.at(2)?.x,
        this.clicksCoords.at(2)?.y,
      ),
      "Distance T3 to T0 ": getDistance(
        this.clicksCoords.at(0)?.x,
        this.clicksCoords.at(0)?.y,
        this.clicksCoords.at(3)?.x,
        this.clicksCoords.at(3)?.y,
      ),
      "Distance T2 to T1 ": getDistance(
        this.clicksCoords.at(1)?.x,
        this.clicksCoords.at(1)?.y,
        this.clicksCoords.at(2)?.x,
        this.clicksCoords.at(2)?.y,
      ),
      "Distance T3 to T1 ": getDistance(
        this.clicksCoords.at(1)?.x,
        this.clicksCoords.at(1)?.y,
        this.clicksCoords.at(3)?.x,
        this.clicksCoords.at(3)?.y,
      ),
      "Distance T3 to T2 ": getDistance(
        this.clicksCoords.at(2)?.x,
        this.clicksCoords.at(2)?.y,
        this.clicksCoords.at(3)?.x,
        this.clicksCoords.at(3)?.y,
      ),
    };
  }
}
