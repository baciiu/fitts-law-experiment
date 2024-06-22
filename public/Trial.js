"use strict";

class Trial {
  constructor(
    trialId,
    trialRep,
    trialDirection,
    startWidth,
    startHeight,
    targetWidth,
    targetHeight,
    amplitude,
  ) {
    this.trialId = trialId;
    this.trialRep = trialRep;
    this.trialDirection = trialDirection;
    this.startWidth = startWidth;
    this.startHeight = startHeight;
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.amplitude = amplitude;
    this.previousTrialEnd = {};

    this.startWidthPx = mmToPixels(startWidth);
    this.startHeightPX = mmToPixels(startHeight);
    this.targetWidthPx = mmToPixels(targetWidth);
    this.targetHeightPx = mmToPixels(targetHeight);
    this.amplitudePX = mmToPixels(amplitude);

    this.start = document.getElementById("start");
    this.target = document.getElementById("target");
    this.body = document.getElementById("body");

    this.firstClickDone = false;
    this.trialCompleted = false;
    this.toBeRepeatedTrial = false;
    this.bodyIsPressed = false;

    this.startCoords = { x: null, y: null };
    this.targetCoords = { x: null, y: null };
    this.HIT = null;
    this.startPressIn = false;
    this.startReleaseIn = false;
    this.targetPressIn = false;
    this.targetReleaseIn = false;

    this.firstTrial = false;

    this.previousTrial = {
      trialId: null,
      trialRep: null,
      startX: null,
      startY: null,
      targetX: null,
      targetY: null,
    };

    this.clicksTime = [];
    this.clicksCoords = [];
  }

  drawShapes() {
    if (isDiscrete()) {
      this.drawDiscreteShapes();
    } else if (isReciprocal()) {
      this.drawReciprocalShapes();
    } else {
      throw Error("[MY ERROR]: Experiment type undefined.");
    }
  }

  drawShape(coords, shape, isTarget) {
    shape.style.display = "block";
    shape.style.position = "absolute";
    shape.style.left = coords.x + "px";
    shape.style.top = coords.y + "px";

    if (isTarget) {
      shape.style.width = this.targetWidthPx + "px";
      shape.style.height = this.targetHeightPx + "px";
      this.targetCoords = coords;
    } else {
      shape.style.width = this.startWidthPx + "px";
      shape.style.height = this.startHeightPX + "px";
      this.startCoords = coords;
    }
  }

  isFirstTrialInReciprocalGroup() {
    return !this.trialRep.toString().includes(".");
  }

  drawBody() {
    this.body.style.display = "block";
    this.body.style.width = window.innerWidth + "px";
    this.body.style.height = window.innerHeight + "px";
  }

  drawDiscreteShapes() {
    this.trialCompleted = false;

    let pos = this.getPosition();

    this.drawShape(pos.target, this.target, true);
    this.target.style.backgroundColor = "yellow";
    this.drawShape(pos.start, this.start, false);
    this.start.style.backgroundColor = "grey";
    this.drawBody();

    this.setupEventHandlers();
  }

  drawReciprocalShapes() {
    this.trialCompleted = false;

    let pos = this.getPosition();

    this.drawShape(pos.target, this.target, true);
    this.target.style.backgroundColor = "yellow";
    this.drawShape(pos.start, this.start, false);
    this.start.style.backgroundColor = "green";

    if (this.isFirstTrialInReciprocalGroup()) {
      this.start.style.backgroundColor = "gray";
    }

    this.drawBody();

    this.setupEventHandlers();
  }

  getPosition() {
    let pos;
    do {
      if (this.isSamePositionAsPreviousTrial()) {
        pos = this.getPreviousTrialPosition();
        if (this.checkIfCoordinatesFitTheScreen(pos)) {
          return pos;
        }
      }
      if (this.firstTrial || USE_CENTER_OF_SCREEN) {
        pos = this.generateCenteredPositions();
      } else {
        pos = this.generateNotCenteredPositions();
      }
    } while (!this.checkIfCoordinatesFitTheScreen(pos));
    return pos;
  }

  getPreviousTrialPosition() {
    const start = {
      x: this.previousTrial.startX,
      y: this.previousTrial.startY,
    };
    const target = {
      x: this.previousTrial.targetX,
      y: this.previousTrial.targetY,
    };
    return { start, target };
  }

  isSamePositionAsPreviousTrial() {
    if (isDiscrete()) {
      return false;
    }
    return !this.isFirstTrialInReciprocalGroup();
  }

  isPreviousTrial() {
    return !!(
      this.previousTrial.startX &&
      this.previousTrial.startY &&
      this.previousTrial.targetX &&
      this.previousTrial.targetY &&
      this.previousTrial.trialRep
    );
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
    } else {
      return true;
    }
  }

  isStartNotMandatoryOnReciprocal() {
    return isReciprocal() && START_HIT_NOT_MANDATORY;
  }

  setupEventHandlers() {
    this.boundHandleStartPress = this.handleStartPress.bind(this);
    this.boundHandleStartRelease = this.handleStartRelease.bind(this);
    this.boundHandleBodyPress = this.handleBodyPress.bind(this);
    this.boundHandleBodyRelease = this.handleBodyRelease.bind(this);

    if (this.isStartNotMandatoryOnReciprocal()) {
      this.body.addEventListener("mousedown", this.boundHandleBodyPress);
      this.body.addEventListener("mouseup", this.boundHandleBodyRelease);
    } else {
      this.start.addEventListener("mousedown", this.boundHandleStartPress);
      this.start.addEventListener("mouseup", this.boundHandleStartRelease);
    }
  }

  handleStartPress(event) {
    if (!this.firstClickDone) {
      this.logMouseEvent(event, 0);
      this.startPressIn = true;
      successSound.play();
      this.firstClickDone = true;
      this.trialStarted = true;
    } else {
      errorSound.play();
      this.start.removeEventListener("mousedown", this.boundHandleStartPress);
      this.start.removeEventListener("touchstart", this.boundHandleStartPress);
    }
  }

  handleStartRelease(event) {
    const isInsideStart = this.isCursorInsideShape(event, this.start);
    if (!this.trialStarted) {
      errorSound.play();
    } else if (this.trialStarted) {
      this.startReleaseIn = isInsideStart;
      if (isInsideStart) {
        this.logMouseEvent(event, 1);
        if (isDiscrete()) {
          this.start.style.display = "none";
          this.target.style.backgroundColor = "green";
        } else {
          this.target.style.backgroundColor = "green";
          this.start.style.backgroundColor = "yellow";
        }

        this.start.removeEventListener("mouseup", this.boundHandleStartRelease);
        this.start.removeEventListener(
          "touchend",
          this.boundHandleStartRelease,
        );
        this.body.addEventListener("mousedown", this.boundHandleBodyPress);
        this.body.addEventListener("touchstart", this.boundHandleBodyPress);
        this.body.addEventListener("mouseup", this.boundHandleBodyRelease);
        this.body.addEventListener("touchend", this.boundHandleBodyRelease);
      } else {
        errorSound.play();
      }
    }
  }

  handleBodyPress(event) {
    if (!this.trialStarted && this.isStartNotMandatoryOnReciprocal()) {
      this.handleBodyPressAsStartPress(event);
    } else if (this.trialStarted && this.firstClickDone) {
      this.logMouseEvent(event, 2);

      this.targetPressIn = this.isCursorInsideShape(event, this.target);
      this.bodyIsPressed = true;
    } else {
      this.targetPressIn = false;
      errorSound.play();
    }
    if (!this.isStartNotMandatoryOnReciprocal()) {
      this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
      this.body.removeEventListener("touchstart", this.boundHandleBodyPress);
    }
  }

  handleBodyRelease(event) {
    if (this.trialStarted && this.firstClickDone && this.bodyIsPressed) {
      this.logMouseEvent(event, 3);
      this.targetReleaseIn = this.isCursorInsideShape(event, this.target);

      if (this.targetPressIn) {
        successSound.play();

        if (isDiscrete()) {
          this.start.style.display = "none";
          this.target.style.backgroundColor = "green";
        } else {
          this.target.style.backgroundColor = "green";
          this.start.style.backgroundColor = "yellow";
        }
      } else {
        errorSound.play();
      }
      if (!this.isStartNotMandatoryOnReciprocal()) {
        this.body.removeEventListener("mouseup", this.boundHandleBodyRelease);
        this.body.removeEventListener("touchend", this.boundHandleBodyRelease);
      }
      this.endTrial();
    } else if (this.trialStarted && this.firstClickDone) {
      if (this.isStartNotMandatoryOnReciprocal()) {
        this.handleBodyReleaseAsStartRelease(event);
      }
    }
  }

  handleBodyPressAsStartPress(event) {
    console.log("start pressed");
    this.logMouseEvent(event, 0);
    this.firstClickDone = true;
    this.trialStarted = true;
    const isInsideStart = this.isCursorInsideShape(event, this.start);
    this.startPressIn = isInsideStart;
    if (isInsideStart) {
      successSound.play();
    } else {
      errorSound.play();
    }
  }

  handleBodyReleaseAsStartRelease(event) {
    console.log("release on start");
    const isInsideStart = this.isCursorInsideShape(event, this.start);
    this.startReleaseIn = isInsideStart;
    this.logMouseEvent(event, 1);
    this.target.style.backgroundColor = "green";
    this.start.style.backgroundColor = "yellow";
    if (isInsideStart) {
      successSound.play();
    } else {
      errorSound.play();
    }
  }

  isCursorInsideShape(event, shape) {
    const rect = shape.getBoundingClientRect();

    let isCursorInsideShape =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (DEV_TYPE == "touch") {
      const extendedRect = {
        left: rect.left - AMBIGUITY_MARGIN_PX,
        top: rect.top - AMBIGUITY_MARGIN_PX,
        right: rect.right + AMBIGUITY_MARGIN_PX,
        bottom: rect.bottom + AMBIGUITY_MARGIN_PX,
      };

      let isTouchInsideMargin =
        event.clientX >= extendedRect.left &&
        event.clientX <= extendedRect.right &&
        event.clientY >= extendedRect.top &&
        event.clientY <= extendedRect.bottom;

      if (!isCursorInsideShape && isTouchInsideMargin) {
        this.ambiguityMarginHit = true;
      }
      return isTouchInsideMargin;
    }
    return isCursorInsideShape;
  }

  endTrial() {
    this.trialCompleted = true;
    const trialData = this.getExportDataTrial();
    const trialCopy = JSON.parse(JSON.stringify(this));

    this.cleanupTrial();
    const event = new CustomEvent("trialCompleted", {
      detail: { trialData, trialCopy },
    });
    document.dispatchEvent(event);
  }

  cleanupTrial() {
    this.firstClickDone = false;
    this.trialStarted = false;
    this.bodyIsPressed = false;

    this.start.removeEventListener("mousedown", this.boundHandleStartPress);
    this.start.removeEventListener("mouseup", this.boundHandleStartRelease);
    this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
  }

  getTrialID() {
    return this.trialId;
  }

  isToBeRepeatedTrial() {
    if (this.isClickAMistake()) {
      console.log("Click was a mistake, trial to be repeated: " + true);
      return true;
    }
    if (REP_PRESS_OUT_REL_OUT) {
      return this.isPressOutReleaseOut();
    }
    if (REP_PRESS_OUT_REL_IN) {
      return this.isPressOutReleaseIn();
    }
    if (REP_PRESS_IN_REL_OUT) {
      return this.isPressInReleaseOut();
    }
    if (REP_PRESS_IN_REL_IN) {
      return this.isPressInReleaseIn();
    }
  }

  isPressOutReleaseOut() {
    return !this.targetPressIn && !this.targetReleaseIn;
  }

  isPressOutReleaseIn() {
    return !this.targetPressIn && this.targetReleaseIn;
  }

  isPressInReleaseOut() {
    return this.targetPressIn && !this.targetReleaseIn;
  }

  isPressInReleaseIn() {
    return this.targetPressIn && this.targetReleaseIn;
  }

  isHit() {
    if (HIT_ON_PRESS_AND_RELEASE) {
      return this.isPressInReleaseIn();
    } else {
      return this.isPressInReleaseOut() || this.isPressInReleaseIn();
    }
  }

  isClickAMistake() {
    if (
      this.clicksCoords.at(0) === undefined ||
      this.clicksCoords.at(1) === undefined ||
      this.clicksCoords.at(2) === undefined ||
      this.clicksCoords.at(3) === undefined
    ) {
      return true;
    }
    let coordX1;
    let coordY1;
    let coordX2;
    let coordY2;

    if (!this.startPressIn && this.targetPressIn) {
      return false;
    } else if (this.startPressIn && !this.targetPressIn) {
      coordX1 = this.getCenterCoordinatesOfStartShape().x;
      coordY1 = this.getCenterCoordinatesOfStartShape().y;
      coordX2 = this.targetCoords.x;
      coordY2 = this.targetCoords.y;
    } else if (!this.startPressIn && !this.targetPressIn) {
      coordX1 = this.startCoords.x;
      coordY1 = this.startCoords.y;
      coordX2 = this.targetCoords.x;
      coordY2 = this.targetCoords.y;
    } else {
      return false;
    }

    let distance = getDistance(coordX1, coordY1, coordX2, coordY2);
    console.log("Distance is: " + distance);
    console.log(
      "Amplitude / threshold  is: " + this.amplitudePX / FAILED_TRIAL_THRESHOLD,
    );
    return distance < this.amplitudePX / FAILED_TRIAL_THRESHOLD;
  }

  getCenterCoordinatesOfStartShape() {
    console.log("getCenterOfStartShape() not implemented yet.");
    const posX = this.startCoords.x + this.startWidth / 2;
    const posY = this.startCoords.y + this.startHeight / 2;
    return { x: posX, y: posY };
  }

  getRandomPoint(width1, height1) {
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

  getRandomPointWithRespectToPreviousTarget() {
    const previous = this.getPreviousTrial();

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

  isShapeWithinBounds(x, y, width, height) {
    return (
      this.isLeftEdgeWithinBounds(x, width) &&
      this.isRightEdgeWithinBounds(x, width) &&
      this.isTopEdgeWithinBounds(y, height) &&
      this.isBottomEdgeWithinBounds(y, height)
    );
  }

  isLeftEdgeWithinBounds(x, width) {
    return x - width / 2 > OTHER_MARGINS_PX;
  }

  isRightEdgeWithinBounds(x, width) {
    return x + width / 2 < window.innerWidth - OTHER_MARGINS_PX;
  }

  isTopEdgeWithinBounds(y, height) {
    return y - height / 2 > TOP_MARGIN_PX;
  }

  isBottomEdgeWithinBounds(y, height) {
    return y + height / 2 < window.innerHeight - TOP_MARGIN_PX;
  }

  isAmplitude(x1, y1, x2, y2, amplitude) {
    const distance = getDistance(x1, y1, x2, y2);
    const tolerance = 1;
    return distance - amplitude <= tolerance;
  }

  generateNotCenteredPositions() {
    let start,
      target,
      x1,
      y1,
      x2,
      y2,
      count = 0,
      maxcount = 100;

    do {
      let startCoords;

      if (this.isPreviousTrial()) {
        startCoords = this.getRandomPointWithRespectToPreviousTarget();
        while (
          !this.isShapeWithinBounds(
            startCoords.x,
            startCoords.y,
            this.startWidthPx,
            this.startHeightPX,
          )
        ) {
          startCoords = this.getRandomPointWithRespectToPreviousTarget();
        }
      } else {
        startCoords = this.getRandomPoint(
          this.startWidthPx,
          this.startHeightPX,
        );
      }

      x1 = startCoords.x;
      y1 = startCoords.y;

      let angle = this.trialDirection;

      const targetCoords = generateCenterPointWithAmplitude(
        x1,
        y1,
        this.amplitudePX,
        angle,
      );
      x2 = targetCoords.x;
      y2 = targetCoords.y;

      if (
        this.isAmplitude(x1, y1, x2, y2, this.amplitudePX) &&
        this.isShapeWithinBounds(
          x2,
          y2,
          this.targetWidthPx,
          this.targetHeightPx,
        )
      ) {
        start = {
          x: x1 - this.startWidthPx / 2,
          y: y1 - this.startHeightPX / 2,
        };
        target = {
          x: x2 - this.targetWidthPx / 2,
          y: y2 - this.targetHeightPx / 2,
        };
        return { start, target };
      }
    } while (!start || !target);
    if (count > maxcount) {
      const dis = this.generateCenteredPositions();
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

  generateCenteredPositions() {
    let start, target, x1, y1, x2, y2;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const angle = this.trialDirection;

    // Convert angle to radians
    const radians = (angle * Math.PI) / 180;

    x1 = centerX + (this.amplitudePX / 2) * Math.cos(radians);
    y1 = centerY + (this.amplitudePX / 2) * Math.sin(radians);

    x2 = centerX - (this.amplitudePX / 2) * Math.cos(radians);
    y2 = centerY - (this.amplitudePX / 2) * Math.sin(radians);

    if (
      this.isAmplitude(x1, y1, x2, y2, this.amplitudePX) &&
      this.isShapeWithinBounds(x2, y2, this.targetWidthPx, this.targetHeightPx)
    ) {
      start = { x: x1 - this.startWidthPx / 2, y: y1 - this.startHeightPX / 2 };
      target = {
        x: x2 - this.targetWidthPx / 2,
        y: y2 - this.targetHeightPx / 2,
      };
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

  setPreviousTrial(prevTrial) {
    this.previousTrial = prevTrial;
  }

  getPreviousTrial() {
    return this.previousTrial;
  }

  getExportDataTrial() {
    return {
      no: "",
      userNumber: "",
      blockNumber: "",
      trialNumber: this.trialId,
      trialRep: this.trialRep,
      experimentType: EXPERIMENT_TYPE,
      device: DEVICE_TYPE,
      centerOfScreen: USE_CENTER_OF_SCREEN,

      amplitudeMM: this.amplitude,
      amplitudePx: this.amplitudePX,
      directionDegree: this.trialDirection,
      direction: getDirection(this.trialDirection),

      startX: this.startCoords.x,
      startY: this.startCoords.y,
      startWidthPx: this.startWidthPx,
      startHeightPx: this.startHeightPX,

      startPressIn: this.startPressIn,
      startReleaseIn: this.startReleaseIn,

      targetX: this.targetCoords.x,
      targetY: this.targetCoords.y,
      targetWidthPx: this.targetWidthPx,
      targetHeightPx: this.targetHeightPx,

      targetPressIn: this.targetPressIn,
      targetReleaseIn: this.targetReleaseIn,

      HIT: this.isHit(),
      toBeRepeatedTrial: this.isToBeRepeatedTrial(),

      "Click T0 X": this.clicksCoords.at(0)?.x,
      "Click T0 Y": this.clicksCoords.at(0)?.y,

      "Click T1 X": this.clicksCoords.at(1)?.x,
      "Click T1 Y": this.clicksCoords.at(1)?.y,

      "Click T2 X": this.clicksCoords.at(2)?.x,
      "Click T2 Y": this.clicksCoords.at(2)?.y,

      "Click T3 X": this.clicksCoords.at(3)?.x,
      "Click T3 Y": this.clicksCoords.at(3)?.y,

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

  setIsFirstTrial(isFirstTrial) {
    this.firstTrial = isFirstTrial;
  }
}
