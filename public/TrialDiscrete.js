"use strict";

class TrialDiscrete {
  constructor(
    trialId,
    trialRep,
    trialDirection,
    rectangleStart,
    rectangleTarget,
    amplitude,
  ) {
    this.trialId = trialId;
    this.trialRep = trialRep;
    this.trialDirection = trialDirection;
    this.startWidth = rectangleStart.width;
    this.startHeight = rectangleStart.height;
    this.targetWidth = rectangleTarget.width;
    this.targetHeight = rectangleTarget.height;
    this.amplitude = amplitude;
    this.constellationInt = 0;
    this.constellationString = "";

    // this.printTrialConstructor();

    this.initPXVariables();
    this.initDOMElements();
    this.initClickVariables();
    this.initFlags();
    this.initPreviousTrial();
  }

  printTrialConstructor() {
    console.log(this.trialId);
    console.log(this.trialRep);
    console.log(this.trialDirection);
    console.log(this.startHeight);
    console.log(this.targetWidth);
    console.log(this.targetHeight);
    console.log(this.amplitude);
  }

  initPXVariables() {
    this.startWidthPx = mmToPixels(this.startWidth);
    this.startHeightPX = mmToPixels(this.startHeight);
    this.targetWidthPx = mmToPixels(this.targetWidth);
    this.targetHeightPx = mmToPixels(this.targetHeight);
    this.amplitudePX = mmToPixels(this.amplitude);
  }

  initDOMElements() {
    this.start = document.getElementById("start");
    this.target = document.getElementById("target");
    this.body = document.getElementById("body");
  }

  initFlags() {
    this.firstClickDone = false;
    this.bodyIsPressed = false;

    this.firstTrial = false;
    this.isTrialAMistakeRepetition = false;

    this.trialCompleted = false;
    this.toBeRepeatedTrial = false;
  }

  initClickVariables() {
    this.HIT = null;

    this.startCoords = { x: null, y: null };
    this.targetCoords = { x: null, y: null };

    this.startPressIn = false;
    this.startReleaseIn = false;
    this.targetPressIn = false;
    this.targetReleaseIn = false;

    this.clicksTime = [];
    this.clicksCoords = [];
  }

  initPreviousTrial() {
    this.previousTrial = {
      trialId: null,
      trialRep: null,
      startX: null,
      startY: null,
      targetX: null,
      targetY: null,
    };
  }

  drawShapes() {
    this.drawDiscreteShapes();
  }

  drawShape(coords, shape, isTarget) {
    shape.style.display = "block";
    shape.style.position = "absolute";
    shape.style.left = `${coords.x}px`;
    shape.style.top = `${coords.y}px`;

    if (isTarget) {
      shape.style.width = `${this.targetWidthPx}px`;
      shape.style.height = `${this.targetHeightPx}px`;
      this.targetCoords = coords;
    } else {
      shape.style.width = `${this.startWidthPx}px`;
      shape.style.height = `${this.startHeightPX}px`;
      this.startCoords = coords;
    }
  }

  drawBody() {
    this.body.style.display = "block";
    this.body.style.width = `${window.innerWidth}px`;
    this.body.style.height = `${window.innerHeight}px`;
  }

  drawDiscreteShapes() {
    this.trialCompleted = false;

    let pos = this.getPosition();

    this.drawShape(pos.target, this.target, true);
    this.target.style.backgroundColor = WAIT_COLOR;
    this.drawShape(pos.start, this.start, false);
    this.start.style.backgroundColor = START_COLOR;
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
    return false;
  }

  isPreviousTrialValid() {
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
      throw Error(ERROR_GENERATE_POSITION);
    } else {
      return true;
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
    const isInsideStart = isCursorInsideShape(event, this.start);
    if (!this.trialStarted) {
      errorSound.play();
    } else if (this.trialStarted) {
      this.startReleaseIn = isInsideStart;
      if (isInsideStart) {
        this.logMouseEvent(event, 1);
        this.start.style.display = "none";
        this.target.style.backgroundColor = CLICK_COLOR;
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
      this.targetPressIn = isCursorInsideShape(event, this.target);
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
      this.targetReleaseIn = isCursorInsideShape(event, this.target);

      if (this.targetPressIn) {
        successSound.play();

        if (isDiscrete()) {
          this.start.style.display = "none";
          this.target.style.backgroundColor = CLICK_COLOR;
        } else {
          this.target.style.backgroundColor = CLICK_COLOR;
          this.start.style.backgroundColor = WAIT_COLOR;
        }
      } else {
        errorSound.play();
      }
      this.body.removeEventListener("mouseup", this.boundHandleBodyRelease);
      this.body.removeEventListener("touchend", this.boundHandleBodyRelease);

      this.endTrial();
    }
  }

  endTrial() {
    this.trialCompleted = true;
    const trialData = getTrialData(this);
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
    return false;
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
      const startCenterCoords = this.getCenterCoordinatesOfStartShape();
      coordX1 = startCenterCoords.x;
      coordY1 = startCenterCoords.y;
      coordX2 = this.clicksCoords.at(2).x;
      coordY2 = this.clicksCoords.at(2).y;
    } else if (!this.startPressIn && !this.targetPressIn) {
      coordX1 = this.clicksCoords.at(0).x;
      coordY1 = this.clicksCoords.at(0).y;
      coordX2 = this.clicksCoords.at(2).x;
      coordY2 = this.clicksCoords.at(2).y;
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

  generateNotCenteredPositions() {
    // TODO: refactor to reduce complexity
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

      if (this.isPreviousTrialValid()) {
        startCoords = getRandomPointWithRespectToPreviousTarget(
          this.getPreviousTrial(),
        );
        while (
          !isShapeWithinBounds(
            startCoords.x,
            startCoords.y,
            this.startWidthPx,
            this.startHeightPX,
          )
        ) {
          startCoords = getRandomPointWithRespectToPreviousTarget(
            this.getPreviousTrial(),
          );
        }
      } else {
        startCoords = getRandomPoint(this.startWidthPx, this.startHeightPX);
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
        isAmplitude(x1, y1, x2, y2, this.amplitudePX) &&
        isShapeWithinBounds(x2, y2, this.targetWidthPx, this.targetHeightPx)
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
        throw Error(ERROR_GENERATE_POSITION);
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
      isAmplitude(x1, y1, x2, y2, this.amplitudePX) &&
      isShapeWithinBounds(x2, y2, this.targetWidthPx, this.targetHeightPx)
    ) {
      start = { x: x1 - this.startWidthPx / 2, y: y1 - this.startHeightPX / 2 };
      target = {
        x: x2 - this.targetWidthPx / 2,
        y: y2 - this.targetHeightPx / 2,
      };
      return { start, target };
    }
    if (!start || !target) {
      throw Error(ERROR_GENERATE_POSITION);
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

  parseTrialRepByIndex(index) {
    const rep = this.trialRep;
    const elements = rep.split(".");
    return parseInt(elements[index], 10);
  }

  getCopyOfTrial() {
    if (this.parseTrialRepByIndex(0)) {
      return this.parseTrialRepByIndex(0);
    } else {
      return 0;
    }
  }

  getRepeatNumber() {
    if (this.parseTrialRepByIndex(1)) {
      return this.parseTrialRepByIndex(1);
    } else {
      return 0;
    }
  }

  setIsFirstTrial(isFirstTrial) {
    this.firstTrial = isFirstTrial;
  }

  setIsTrialAMistakeRepetition(isMistake) {
    this.isTrialAMistakeRepetition = isMistake;
  }
}
