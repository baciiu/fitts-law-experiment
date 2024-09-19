"use strict";

class TrialReciprocal {
  constructor(
    trialId,
    trialRep,
    currentTravel,
    trialDirection,
    rectangleStart,
    rectangleTarget,
    amplitude,
  ) {
    this.trialId = trialId;
    this.trialRep = trialRep;
    this.currentTravel = currentTravel;
    this.trialDirection = trialDirection;
    this.startWidth = rectangleStart.width;
    this.startHeight = rectangleStart.height;
    this.targetWidth = rectangleTarget.width;
    this.targetHeight = rectangleTarget.height;
    this.amplitude = amplitude;
    this.constelationInt = 0;
    this.constelationString = "";

    this.initPXVariables();
    this.initDOMElements();
    this.initFlags();
    this.initPreviousTrial();
    this.initClickVariables();
    //this.printTrialConstructor();
  }

  printTrialConstructor() {
    console.log("==========================");
    console.log(`Trial ID           : ${this.trialId}`);
    console.log(`Trial Repetition   : ${this.trialRep}`);
    console.log(`Current Travel     : ${this.currentTravel}`);
    console.log(`Trial Direction    : ${this.trialDirection}`);
    console.log(`Start Height       : ${this.startHeight}`);
    console.log(`Target Width       : ${this.targetWidth}`);
    console.log(`Target Height      : ${this.targetHeight}`);
    console.log(`Amplitude          : ${this.amplitude}`);
    console.log("==========================\n");
  }

  initPXVariables() {
    if (this.isFirstTrialInReciprocalGroup()) {
      this.startWidthPx = mmToPixels(START_SIZE);
      this.startHeightPX = mmToPixels(START_SIZE);
    } else {
      this.startWidthPx = mmToPixels(this.startWidth);
      this.startHeightPX = mmToPixels(this.startHeight);
    }
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

  prefillClickDataFromPrevTrial() {
    if (
      this.previousTrial.clicksTime.length != 4 ||
      this.previousTrial.clicksCoords.length != 4
    ) {
      console.error("Prev trial was not saved correctly");
    }

    if (this.isPreviousTrialValid()) {
      this.clicksTime.push(this.previousTrial.clicksTime.at(2));
      this.clicksCoords.push(this.previousTrial.clicksCoords.at(2));

      this.clicksTime.push(this.previousTrial.clicksTime.at(3));
      this.clicksCoords.push(this.previousTrial.clicksCoords.at(3));

      this.startPressIn = this.previousTrial.targetPressIn;
      this.startReleaseIn = this.previousTrial.targetReleaseIn;
    }
  }

  initPreviousTrial() {
    this.previousTrial = {
      trialId: null,
      trialRep: null,
      startX: null,
      startY: null,
      targetX: null,
      targetY: null,
      clicksTime: [],
      clicksCoords: [],
      startCoords: {},
      targetCoords: {},
      startPressIn: false,
      startReleaseIn: false,
      targetPressIn: false,
      targetReleaseIn: false,
    };
  }

  drawShapes() {
    if (!this.isFirstTrialInReciprocalGroup()) {
      this.prefillClickDataFromPrevTrial();
    }
    this.drawReciprocalShapes();
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

  isFirstTrialInReciprocalGroup() {
    return this.currentTravel == 0;
  }

  isBackTravelTrialInReciprocalGroup() {
    return this.currentTravel % 2 != 0 && !this.isFirstTrialInReciprocalGroup();
  }

  isForthTravelTrialInReciprocalGroup() {
    return this.currentTravel % 2 == 0 && !this.isFirstTrialInReciprocalGroup();
  }

  drawBody() {
    this.body.style.display = "block";
    this.body.style.width = `${window.innerWidth}px`;
    this.body.style.height = `${window.innerHeight}px`;
  }

  drawTravelStart() {
    if (this.isFirstTrialInReciprocalGroup()) {
      this.start.style.backgroundColor = START_COLOR;
    }
  }

  drawReciprocalShapes() {
    this.trialCompleted = false;

    let pos = this.getPosition();

    this.drawShape(pos.target, this.target, true);
    this.drawShape(pos.start, this.start, false);

    if (this.isForthTravelTrialInReciprocalGroup()) {
      this.target.style.backgroundColor = CLICK_COLOR;
      this.start.style.backgroundColor = WAIT_COLOR;
    } else {
      this.target.style.backgroundColor = WAIT_COLOR;
      this.start.style.backgroundColor = CLICK_COLOR;
    }

    this.drawTravelStart();

    this.drawBody();

    this.setupEventHandlers();
  }

  getPosition() {
    let pos;
    do {
      if (this.isSamePositionAsPreviousTrial() && this.isPreviousTrialValid()) {
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
    let start;
    let target;
    if (this.currentTravel == 1) {
      let startSizePx = mmToPixels(START_SIZE);
      const startCenter = {
        x: this.previousTrial.startX + startSizePx / 2,
        y: this.previousTrial.startY + startSizePx / 2,
      };
      start = {
        x: startCenter.x - this.targetWidthPx / 2,
        y: startCenter.y - this.targetHeightPx / 2,
      };
    } else {
      start = {
        x: this.previousTrial.startX,
        y: this.previousTrial.startY,
      };
    }
    target = {
      x: this.previousTrial.targetX,
      y: this.previousTrial.targetY,
    };
    return { start, target };
  }

  isSamePositionAsPreviousTrial() {
    return !this.isFirstTrialInReciprocalGroup();
  }

  isPreviousTrialValid() {
    return !!(
      this.previousTrial.startX &&
      this.previousTrial.startY &&
      this.previousTrial.targetX &&
      this.previousTrial.targetY &&
      this.previousTrial.trialRep &&
      this.previousTrial.clicksTime &&
      this.previousTrial.clicksCoords
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

  isStartNotMandatoryOnReciprocal() {
    return START_HIT_MANDATORY;
  }

  setupEventHandlers() {
    this.boundHandleStartPress = this.handleStartPress.bind(this);
    this.boundHandleStartRelease = this.handleStartRelease.bind(this);
    this.boundHandleBodyPress = this.handleBodyPress.bind(this);
    this.boundHandleBodyRelease = this.handleBodyRelease.bind(this);

    if (
      this.isStartNotMandatoryOnReciprocal() &&
      !this.isFirstTrialInReciprocalGroup()
    ) {
      this.body.addEventListener("mousedown", this.boundHandleBodyPress);
      this.body.addEventListener("mouseup", this.boundHandleBodyRelease);
    } else {
      this.start.addEventListener("mousedown", this.boundHandleStartPress);
      this.start.addEventListener("mouseup", this.boundHandleStartRelease);
    }
  }

  handleStartPress(event) {
    if (!this.firstClickDone) {
      console.log("start press on travel :" + this.currentTravel);
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
        console.log("start release on travel :" + this.currentTravel);
        this.logMouseEvent(event, 1);
        if (this.isFirstTrialInReciprocalGroup()) {
          this.target.style.backgroundColor = CLICK_COLOR;
          this.start.style.backgroundColor = WAIT_COLOR;
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

        if (!this.isFirstTrialInReciprocalGroup()) {
          console.log("End Trial ---> start release");
          this.endTrial();
        } else {
          console.log(" WAit for the second click on the travel 0");
        }
      } else {
        errorSound.play();
      }
    }
  }

  handleBodyPress(event) {
    if (
      !this.trialStarted &&
      this.isStartNotMandatoryOnReciprocal() &&
      !this.isFirstTrialInReciprocalGroup()
    ) {
      this.handleBodyPressAsStartPress(event);
    } else if (this.trialStarted && this.firstClickDone) {
      this.logMouseEvent(event, 2);

      this.targetPressIn = isCursorInsideShape(event, this.target);
      this.bodyIsPressed = true;
      console.log("Body Press on travel " + this.currentTravel);
    } else {
      this.targetPressIn = false;
      errorSound.play();
    }
    if (!this.isStartNotMandatoryOnReciprocal()) {
      this.removeBodyPressListeners();
    }
  }

  handleBodyRelease(event) {
    if (this.trialStarted && this.firstClickDone && this.bodyIsPressed) {
      this.logMouseEvent(event, 3);

      this.targetReleaseIn = isCursorInsideShape(event, this.target);

      this.handleTargetRelease();

      if (!this.isStartNotMandatoryOnReciprocal()) {
        this.removeBodyReleaseListeners();
      }
      console.log("Body Release on travel " + this.currentTravel);
      console.log("MOUSE EVENTS:");
      console.log(this.clicksCoords);
      console.log(this.clicksTime);
      this.endTrial();
    } else if (this.trialStarted && this.firstClickDone) {
      if (
        this.isStartNotMandatoryOnReciprocal() &&
        !this.isFirstTrialInReciprocalGroup()
      ) {
        this.handleBodyReleaseAsStartRelease(event);
        console.log(
          "Body Release as Start Release on travel " + this.currentTravel,
        );
        if (!this.isFirstTrialInReciprocalGroup()) {
          this.endTrial();
        } else {
          console.log("WAit for the second click on the travel 0");
        }
      }
    }
  }

  handleTargetRelease() {
    if (this.targetPressIn) {
      successSound.play();
      this.target.style.backgroundColor = CLICK_COLOR;
      this.start.style.backgroundColor = WAIT_COLOR;
    } else {
      errorSound.play();
    }
  }

  removeBodyReleaseListeners() {
    this.body.removeEventListener("mouseup", this.boundHandleBodyRelease);
    this.body.removeEventListener("touchend", this.boundHandleBodyRelease);
  }

  removeBodyPressListeners() {
    this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
    this.body.removeEventListener("touchstart", this.boundHandleBodyPress);
  }

  handleBodyPressAsStartPress(event) {
    console.log("start pressed on travel " + this.currentTravel);
    this.logMouseEvent(event, 0);
    this.firstClickDone = true;
    this.trialStarted = true;
    let isInsideShape;

    if (this.isBackTravelTrialInReciprocalGroup()) {
      isInsideShape = isCursorInsideShape(event, this.start);
      this.targetPressIn = isInsideShape;
    } else if (this.isForthTravelTrialInReciprocalGroup()) {
      isInsideShape = isCursorInsideShape(event, this.target);
      this.targetPressIn = isInsideShape;
    } else {
      console.error("wtf is this" + this.currentTravel);
    }
    if (isInsideShape) {
      successSound.play();
    } else {
      errorSound.play();
    }
  }

  handleBodyReleaseAsStartRelease(event) {
    console.log("start release on travel :" + this.currentTravel);
    let isInsideShape;

    if (this.isBackTravelTrialInReciprocalGroup()) {
      isInsideShape = isCursorInsideShape(event, this.start);
      this.targetReleaseIn = isInsideShape;
    } else if (this.isForthTravelTrialInReciprocalGroup()) {
      isInsideShape = isCursorInsideShape(event, this.target);
      this.targetReleaseIn = isInsideShape;
    } else {
      console.error("wtf is this" + this.currentTravel);
    }

    console.log("Log Mouse Event 1");
    this.logMouseEvent(event, 1);
    this.target.style.backgroundColor = CLICK_COLOR;
    this.start.style.backgroundColor = WAIT_COLOR;

    if (isInsideShape) {
      successSound.play();
    } else {
      errorSound.play();
    }
  }

  endTrial() {
    console.error("end trial");

    if (this.isBackTravelTrialInReciprocalGroup()) {
      console.log(`BACK TRAVEL on: ${this.currentTravel} `);
    } else if (this.isForthTravelTrialInReciprocalGroup()) {
      console.log(`FORTH TRAVEL on: ${this.currentTravel} `);
    }
    console.log(`
    Travel : ${this.currentTravel}
    Start Press In: ${this.startPressIn}
    Start Release In: ${this.startReleaseIn}
    Target Press In: ${this.targetPressIn}
    Target Release In: ${this.targetReleaseIn}`);

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
      console.log("CLick was a mistake ");
      return true;
    }
    if (REP_PRESS_OUT_REL_OUT) {
      console.log("REP_PRESS_OUT_REL_OUT: " + this.isPressOutReleaseOut());
      return this.isPressOutReleaseOut();
    }
    if (REP_PRESS_OUT_REL_IN) {
      console.log("REP_PRESS_OUT_REL_IN: " + this.isPressOutReleaseIn());
      return this.isPressOutReleaseIn();
    }
    if (REP_PRESS_IN_REL_OUT) {
      console.log("REP_PRESS_IN_REL_OUT: " + this.isPressInReleaseOut());
      return this.isPressInReleaseOut();
    }
    if (REP_PRESS_IN_REL_IN) {
      console.log("REP_PRESS_IN_REL_IN: " + this.isPressInReleaseIn());
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
    }
    return this.targetPressIn;
  }

  isClickAMistake() {
    // TODO: Adapt based on coordinates ;
    //  make sure the click coords are set correctly on each trial
    console.log(
      "clicksCoords.at(0):",
      this.clicksCoords.at(0),
      "clicksCoords.at(1):",
      this.clicksCoords.at(1),
      "clicksCoords.at(2):",
      this.clicksCoords.at(2),
      "clicksCoords.at(3):",
      this.clicksCoords.at(3),
    );

    if (
      this.clicksCoords.at(0) === undefined ||
      this.clicksCoords.at(1) === undefined ||
      this.clicksCoords.at(2) === undefined ||
      this.clicksCoords.at(3) === undefined
    ) {
      console.error("Click was a mistake because click data is missing");
      return true;
    }
    let coordX1;
    let coordY1;
    let coordX2;
    let coordY2;

    if (!this.startPressIn && this.targetPressIn) {
      return false;
    } else if (this.startPressIn && !this.targetPressIn) {
      console.log("calculating distance using center of the start.");
      const startCenterCoords = this.getCenterCoordinatesOfStartShape();
      coordX1 = startCenterCoords.x;
      coordY1 = startCenterCoords.y;
      coordX2 = this.clicksCoords.at(2).x;
      coordY2 = this.clicksCoords.at(2).y;
    } else if (!this.startPressIn && !this.targetPressIn) {
      console.log("calculating distance using click data.");
      coordX1 = this.clicksCoords.at(0).x;
      coordY1 = this.clicksCoords.at(0).y;
      coordX2 = this.clicksCoords.at(2).x;
      coordY2 = this.clicksCoords.at(2).y;
    } else {
      return false;
    }

    let distance = getDistance(coordX1, coordY1, coordX2, coordY2);
    let condition = distance < this.amplitudePX / FAILED_TRIAL_THRESHOLD;

    if (condition) {
      console.log(`
      Click was a mistake; distance is too small.
      Distance is: ${distance}
      Amplitude/threshold is: ${this.amplitudePX / FAILED_TRIAL_THRESHOLD}
    `);
    } else {
      console.log(`
      Click was ok;
      Distance is: ${distance}
      Amplitude/threshold  is: ${this.amplitudePX / FAILED_TRIAL_THRESHOLD}
    `);
    }
    return condition;
  }

  getCenterCoordinatesOfStartShape() {
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

  logMouseEvent(event) {
    this.clicksTime.push(new Date());
    this.clicksCoords.push({ x: event.clientX, y: event.clientY });
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
    return this.parseTrialRepByIndex(0);
  }

  getRepeatNumber() {
    return this.parseTrialRepByIndex(1);
  }

  getExportDataTrial() {
    return {
      no: "",
      experimentType: EXPERIMENT_TYPE,
      userNumber: "",
      blockNumber: "",
      trialId: this.trialId,
      constNr: this.constelationInt,
      constStr: this.constelationString,
      copyOfTrial: this.getCopyOfTrial(),
      trialRep: this.getRepeatNumber(),

      currTravel: this.currentTravel,
      travelsNumber: TRAVELS_NUMBER,
      amplitudeMM: this.amplitude,
      amplitudePx: this.amplitudePX,
      directionDegree: this.trialDirection,

      rect1_PressIn: this.startPressIn,
      rect1_ReleaseIn: this.startReleaseIn,

      rect2_PressIn: this.targetPressIn,
      rect2_ReleaseIn: this.targetReleaseIn,

      HIT: this.isHit(),

      isRepetitionOfMistake: this.isTrialAMistakeRepetition,

      toBeRepeatedTrial: this.isToBeRepeatedTrial(),

      /** Start info **/
      rect1_X: this.startCoords.x,
      rect1_Y: this.startCoords.y,

      rect1_WidthMM: this.startWidth,
      rect1_HeightMM: this.startHeight,

      rect1_WidthPx: this.startWidthPx,
      rect1_HeightPx: this.startHeightPX,

      /** Target info **/
      rect2_X: this.targetCoords.x,
      rect2_Y: this.targetCoords.y,

      rect2_WidthMM: this.targetWidth,
      rect2_HeightMM: this.targetHeight,

      rect2_WidthPx: this.targetWidthPx,
      rect2_HeightPx: this.targetHeightPx,

      rect1_Press_coord_X: this.clicksCoords.at(0)?.x,
      rect1_Press_coord_Y: this.clicksCoords.at(0)?.y,

      rect1_Release_coord_X: this.clicksCoords.at(1)?.x,
      rect1_Release_coord_Y: this.clicksCoords.at(1)?.y,

      rect2_Press_coord_X: this.clicksCoords.at(2)?.x,
      rect2_Press_coord_Y: this.clicksCoords.at(2)?.y,

      rect2_Release_coord_X: this.clicksCoords.at(3)?.x,
      rect2_Release_coord_Y: this.clicksCoords.at(3)?.y,

      rect1_Press_timeT1: getTimeFormat(this.clicksTime.at(0)),
      rect1_Release_timeT2: getTimeFormat(this.clicksTime.at(1)),
      rect2_Press_timeT3: getTimeFormat(this.clicksTime.at(2)),
      rect2_Release_timeT4: getTimeFormat(this.clicksTime.at(3)),

      T2_T1_rect1_Release_rect1_Press_ms: getOnlyTimeFormat(
        this.clicksTime.at(1) - this.clicksTime.at(0),
      ),
      T3_T1_rect2_Press_rect1_Press_ms: getOnlyTimeFormat(
        this.clicksTime.at(2) - this.clicksTime.at(0),
      ),
      T4_T1_rect2_Release_rect1_Press_ms: getOnlyTimeFormat(
        this.clicksTime.at(3) - this.clicksTime.at(0),
      ),
      T3_T2_rect2_Press_rect1_Release_ms: getOnlyTimeFormat(
        this.clicksTime.at(2) - this.clicksTime.at(1),
      ),
      T4_T2_rect2_Release_rect1_Release_ms: getOnlyTimeFormat(
        this.clicksTime.at(3) - this.clicksTime.at(1),
      ),
      T4_T3_rect2_Release_rect2_Press_ms: getOnlyTimeFormat(
        this.clicksTime.at(3) - this.clicksTime.at(2),
      ),

      D2_D1_rect1_Release_rect1_Press_px: getDistance(
        this.clicksCoords.at(0)?.x,
        this.clicksCoords.at(0)?.y,
        this.clicksCoords.at(1)?.x,
        this.clicksCoords.at(1)?.y,
      ),
      D3_D1_rect2_Press_rect1_Press_px: getDistance(
        this.clicksCoords.at(0)?.x,
        this.clicksCoords.at(0)?.y,
        this.clicksCoords.at(2)?.x,
        this.clicksCoords.at(2)?.y,
      ),
      D4_D1_rect2_Release_rect1_Press_px: getDistance(
        this.clicksCoords.at(0)?.x,
        this.clicksCoords.at(0)?.y,
        this.clicksCoords.at(3)?.x,
        this.clicksCoords.at(3)?.y,
      ),
      D3_D2_rect2_Press_rect1_Release_px: getDistance(
        this.clicksCoords.at(1)?.x,
        this.clicksCoords.at(1)?.y,
        this.clicksCoords.at(2)?.x,
        this.clicksCoords.at(2)?.y,
      ),
      D4_D2_rect2_Release_rect1_Release_px: getDistance(
        this.clicksCoords.at(1)?.x,
        this.clicksCoords.at(1)?.y,
        this.clicksCoords.at(3)?.x,
        this.clicksCoords.at(3)?.y,
      ),
      D4_D3_rect2_Release_rect2_Press_px: getDistance(
        this.clicksCoords.at(2)?.x,
        this.clicksCoords.at(2)?.y,
        this.clicksCoords.at(3)?.x,
        this.clicksCoords.at(3)?.y,
      ),
      device: DEVICE_TYPE,
    };
  }

  setIsFirstTrial(isFirstTrial) {
    this.firstTrial = isFirstTrial;
  }

  setIsTrialAMistakeRepetition(isMistake) {
    this.isTrialAMistakeRepetition = isMistake;
  }

  setCurrentTravel(travel) {
    this.currentTravel = travel;
  }
}
