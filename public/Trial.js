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
    this.ambiguityMarginHit = false;

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
    this.targetPressIn = false;
    this.targetReleaseIn = false;

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
      shape.style.width = mmToPixels(this.targetWidth) + "px";
      shape.style.height = mmToPixels(this.targetHeight) + "px";
      this.targetCoords = coords;
    } else {
      shape.style.width = mmToPixels(this.startWidth) + "px";
      shape.style.height = mmToPixels(this.startHeight) + "px";
      this.startCoords = coords;
    }
  }

  isFirstTrial() {
    if (isDiscrete()) {
      return this.trialId === 1;
    } else if (isReciprocal()) {
      return this.trialRep == this.trialId;
    } else {
      console.error("[MY ERROR]: EXPERIMENT TYPE !");
    }
  }

  drawBody() {
    this.body.style.display = "block";
    this.body.style.width = window.innerWidth + "px";
    this.body.style.height = window.innerHeight + "px";
  }

  drawDiscreteShapes() {
    this.trialCompleted = false;

    let pos;

    if (USE_CENTER_OF_SCREEN) {
      pos = this.generateCenteredPositions();
    } else {
      pos = this.generateNotCenteredPositions();
    }

    this.checkIfCoordinatesFitTheScreen(pos);

    this.drawShape(pos.target, this.target, true);
    this.target.style.backgroundColor = "yellow";
    this.drawShape(pos.start, this.start, false);
    this.start.style.backgroundColor = "grey";
    this.drawBody();

    this.setupEventHandlers();
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

  drawReciprocalShapes() {
    this.trialCompleted = false;

    let pos;

    if (USE_CENTER_OF_SCREEN) {
      pos = this.generateCenteredPositions();
    } else {
      pos = this.generateNotCenteredPositions();
    }

    this.checkIfCoordinatesFitTheScreen(pos);

    this.drawShape(pos.target, this.target, true);
    this.target.style.backgroundColor = "orange";
    this.drawShape(pos.start, this.start, false);
    this.start.style.backgroundColor = "red";

    if (this.isFirstTrial()) {
      this.start.style.backgroundColor = "gray";
    }

    this.drawBody();

    this.setupEventHandlers();
  }

  getParity(number) {
    const parts = number.toString().split(".");
    if (parts[1] && Number(parts[1]) % 2 !== 0) {
      return 1;
    } else {
      return 0;
    }
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
    if (!this.firstClickDone) {
      this.logMouseEvent(event, 0);
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
      if (isInsideStart) {
        this.logMouseEvent(event, 1);

        if (isDiscrete()) {
          this.start.style.display = "none";
          this.target.style.backgroundColor = "green";
        } else {
          this.target.style.backgroundColor = "red";
          this.start.style.backgroundColor = "orange";
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
    if (this.trialStarted && this.firstClickDone) {
      this.logMouseEvent(event, 2);

      this.targetPressIn = this.isCursorInsideShape(event, this.target);
      this.bodyIsPressed = true;
    } else {
      this.targetPressIn = false;
      errorSound.play();
    }
    this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
    this.body.removeEventListener("touchstart", this.boundHandleBodyPress);
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
          this.target.style.backgroundColor = "red";
          this.start.style.backgroundColor = "orange";
        }
      } else {
        errorSound.play();
      }
      this.body.removeEventListener("mouseup", this.boundHandleBodyRelease);
      this.body.removeEventListener("touchend", this.boundHandleBodyRelease);
      this.endTrial();
    } else if (this.trialStarted && this.firstClickDone) {
      // release on start
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
    /*
                                                                    console.log("************** END TRIAL INFO START ******************");
                                                                    console.log("targetPressIn: " + this.targetPressIn);
                                                                    console.log("targetReleaseIn: " + this.targetReleaseIn);
                                                                
                                                                    console.log("PressInReleaseIn: " + this.isPressInReleaseIn());
                                                                    console.log("PressInReleaseOut: " + this.isPressInReleaseOut());
                                                                    console.log("PressOutReleaseIn: " + this.isPressOutReleaseIn());
                                                                    console.log("PressOutReleaseOut: " + this.isPressOutReleaseOut());
                                                                    console.log("************** END TRIAL INFO END ******************");
                                                                    const trialData = this.getExportDataTrial();
                                                                     */
    const trialCopy = JSON.parse(JSON.stringify(this));
    const trialData = this.getExportDataTrial();

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

  isAmbiguityMarginHit() {
    return this.ambiguityMarginHit;
  }

  isClickAMistake() {
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
    return distance < mmToPixels(this.amplitude) / FAILED_TRIAL_THRESHOLD;
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
      let startCoords;

      if (this.getPreviousTrial().startY != null) {
        startCoords = this.getRandomPointWithRespectToPreviousTarget();
        while (
          !this.isShapeWithinBounds(
            startCoords.x,
            startCoords.y,
            width1,
            height1,
          )
        ) {
          startCoords = this.getRandomPointWithRespectToPreviousTarget();
        }
      } else {
        startCoords = this.getRandomPoint(width1, height1);
      }

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
    let amplitude = mmToPixels(this.amplitude);
    let width1 = mmToPixels(this.startWidth);
    let height1 = mmToPixels(this.startHeight);
    let width2 = mmToPixels(this.targetWidth);
    let height2 = mmToPixels(this.targetHeight);
    let start, target, x1, y1, x2, y2;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const angle = this.trialDirection;

    // Convert angle to radians
    const radians = (angle * Math.PI) / 180;

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

  setPreviousTrial(prevTrial) {
    this.previousTrial = prevTrial;
  }

  getPreviousTrial() {
    return this.previousTrial;
  }

  getExportDataTrial() {
    return {
      userNumber: "",
      blockNumber: "",
      trialNumber: this.trialId,
      trialRep: this.trialRep,
      experimentType: EXPERIMENT_TYPE,
      device: DEVICE_TYPE,

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

      targetPressIn: this.targetPressIn,
      targetReleaseIn: this.targetReleaseIn,

      HIT: this.isHit(),
      AmbiguityMarginHIT: this.isAmbiguityMarginHit(),
      toBeRepeatedTrial: this.isToBeRepeatedTrial(),

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
