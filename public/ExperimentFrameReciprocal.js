"use strict";

class ExperimentFrameReciprocal {
  constructor(userNumber) {
    this.blockNumber = 1;
    this.trialNumber = -1;
    this.experiment = new Experiment();
    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.setupContinueButton();
    this.endTrialPos = null;
    this.trial = null;
    this.trialsData = [];
    this.userNumber = userNumber;
    this.trialIndex = 0;
    this.reciprocalGroupIndex = 0;
    this.trialRep = null;
    this.trialIndexInExperiment = 0;
    this.trialIsFailed = false;
    this.skippedTrials = 0;

    this.prevTrial = {
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

    document.addEventListener(
      "trialCompleted",
      this.handleTrialCompleted.bind(this),
    );
  }

  init() {
    this.printTrialsCalculation();
    this.showTrial();
  }

  printTrialsCalculation() {
    console.log(
      `2 INPUT: \nBlocks: ${BLOCKS_NUMBER} x Targets:${
        INPUT.length
      } x Amplitudes: ${AMPLITUDE_LIST.length} x Directions: ${
        DIRECTION_LIST.length
      } x Travels: ${TRAVELS_NUMBER}+1  x Repetitions: ${REPETITION_PER_TRIAL}+1   = ${
        BLOCKS_NUMBER *
        INPUT.length *
        AMPLITUDE_LIST.length *
        DIRECTION_LIST.length *
        (TRAVELS_NUMBER + 1) *
        (REPETITION_PER_TRIAL + 1)
      }
      Total Reciprocal Trials Number: ${this.getReciprocalTotalTrials()}`,
    );
    console.log(
      `4 INPUT: \nBlocks: ${BLOCKS_NUMBER} x Input Dimensions:${INPUT.length}
        } x Travels: ${TRAVELS_NUMBER}+1  x Repetitions: ${REPETITION_PER_TRIAL}+1   = ${
          BLOCKS_NUMBER *
          INPUT.length *
          (TRAVELS_NUMBER + 1) *
          (REPETITION_PER_TRIAL + 1)
        }
      Total Reciprocal Trials Number: ${this.getReciprocalTotalTrials()}`,
    );
  }

  handleTrialCompleted(event) {
    const detail = event.detail;
    this.trialCompleted(detail);
  }

  trialCompleted(trialEmitted) {
    let trialData = trialEmitted.trialData;
    let trialCopy = trialEmitted.trialCopy;

    this.prevTrial.startPressIn = trialCopy.startPressIn;
    this.prevTrial.startReleaseIn = trialCopy.startReleaseIn;
    this.prevTrial.targetPressIn = trialCopy.targetPressIn;
    this.prevTrial.targetReleaseIn = trialCopy.targetReleaseIn;

    checkForNullOrUndefined(trialData);

    trialData.no = this.getTrialIndexInExperiment();
    trialData.blockNumber = this.blockNumber;
    trialData.userNumber = this.userNumber;

    this.endTrialPos = trialData.endTrialPos;
    this.trialsData.push(trialData);

    console.log(" *******   TRIAL DATA   ******* ");
    console.log(this.trialsData);

    if (trialData.toBeRepeatedTrial) {
      this.markFailedGroup(trialData);
      this.trialIsFailed = true;
      console.log("REPEAT TRIAL");
      this.insertReciprocalTrialToBlock(trialCopy);
    } else {
      this.trialIsFailed = false;
    }

    if (this.getTrialIndexInExperiment() == 1) {
      createServerFile();
      sendDataAsCSVToServer(convertToCSVHeader(this.trialsData));
    }

    if (this.isReciprocalGroupDoneOrInterrupted()) {
      sendDataAsCSVToServer(convertToCSVRow(this.trialsData));
      this.trialsData.length = 0;
    }

    this.prepareForNextTrialOrFinishReciprocal();
  }

  isReciprocalGroupDoneOrInterrupted() {
    if (this.trial.isToBeRepeatedTrial() && INTERRUPT_RECIPROCAL_GROUP) {
      console.log("Trial is failed and group will be interrupted.");
      return true;
    }
    if (this.trial.currentTravel == TRAVELS_NUMBER) {
      console.log("Group of trials done!");
      return true;
    }
    return false;
  }

  insertReciprocalTrialToBlock(failedTrial) {
    const currentBlock = this.experiment.getBlock(this.blockNumber);
    const constellationMap = currentBlock.constellationMap;

    const failedTrialGroupOriginal = currentBlock
      .getReciprocalList()
      [this.reciprocalGroupIndex].getTrialsGroup();

    let newReciprocalTrial = this.getCopyOfGroup(
      failedTrial.trialRep,
      failedTrialGroupOriginal,
      constellationMap,
    );

    console.log(
      "Trying to insert failed trial to the index: " +
        this.reciprocalGroupIndex,
    );

    if (
      currentBlock.getReciprocalList().length - 1 >
      this.reciprocalGroupIndex + 1
    ) {
      insertReciprocalTrialInArray(
        currentBlock.getReciprocalList(),
        newReciprocalTrial,
        this.reciprocalGroupIndex + 1,
      );
    } else if (
      currentBlock.getReciprocalList().length - 1 >
      this.reciprocalGroupIndex
    ) {
      insertReciprocalTrialInArray(
        currentBlock.getReciprocalList(),
        newReciprocalTrial,
        this.reciprocalGroupIndex,
      );
    } else {
      currentBlock.getReciprocalList().push(newReciprocalTrial);
    }
    this.skippedTrials += TRAVELS_NUMBER - (this.reciprocalGroupIndex + 1);
  }

  getCopyOfGroup(trialRep, group, constellationMap) {
    const reciprocalGroup = new ReciprocalGroup(trialRep);
    let trialId = this.getCurrentBlock().getReciprocalTotalTrialsNumber() + 1;
    for (const trial of group) {
      trialId++;
      const target = new Rectangle(trial.startWidth, trial.startHeight);
      const copyTrial = new TrialReciprocal(
        trialId,
        trial.trialRep,
        trial.currentTravel,
        trial.trialDirection,
        target,
        target,
        trial.amplitude,
      );

      const constellationTemp = getConstellationForReciprocal(
        target,
        copyTrial.trialDirection,
        copyTrial.amplitude,
        copyTrial.currentTravel,
      );

      assignConstellationToTrial(
        copyTrial,
        constellationMap,
        constellationTemp,
      );

      copyTrial.setIsTrialAMistakeRepetition(true);

      reciprocalGroup.addTrial(copyTrial);
    }
    return reciprocalGroup;
  }

  prepareForNextTrialOrFinishReciprocal() {
    if (this.trialIsFailed) {
      this.handleFailedReciprocalTrial();
    }
    this.trialIndex++;

    if (this.isExperimentFinished()) {
      this.handleFinish();
    } else if (this.hasBlockTrials()) {
      this.handleNextTrialInBlock();
    } else {
      console.error("block has no lists of trials");
    }
  }

  handleNextTrialInBlock() {
    if (this.isNextTrialInGroup()) {
      this.handleNextTrialInGroup();
    } else if (this.isCurrentTrialLastTrialInGroup()) {
      this.goToNextBlock();
    } else {
      console.error("list of reciprocal group is empty");
    }
  }

  goToNextBlock() {
    this.blockNumber++;
    this.trialIndex = -1;
    this.reciprocalGroupIndex = 0;
    this.prepareForNextTrialOrFinishReciprocal();
  }

  handleNextTrialInGroup() {
    const currentBlock = this.experiment.getBlock(this.blockNumber);
    let listOfReciprocalGroups = currentBlock.getReciprocalList();
    const reciprocalGroup = listOfReciprocalGroups[this.reciprocalGroupIndex];

    if (reciprocalGroup != null) {
      const trialList = reciprocalGroup.getTrialsGroup();

      if (trialList.length >= 1 && this.trialIndex < trialList.length) {
        this.showTrial();
      } else if (trialList.length >= 1 && this.trialIndex == trialList.length) {
        // go to next trialGroup
        this.reciprocalGroupIndex++;
        this.trialIndex = -1;
        this.prepareForNextTrialOrFinishReciprocal();
      } else {
        console.error("trial List is empty");
      }
    } else {
      console.error("reciprocal group is empty.");
    }
  }

  isNextTrialInGroup() {
    const currentBlock = this.experiment.getBlock(this.blockNumber);
    let listOfReciprocalGroups = currentBlock.getReciprocalList();
    return (
      listOfReciprocalGroups.length >= 1 &&
      this.reciprocalGroupIndex < listOfReciprocalGroups.length
    );
  }

  isCurrentTrialLastTrialInGroup() {
    const currentBlock = this.experiment.getBlock(this.blockNumber);
    let listOfReciprocalGroups = currentBlock.getReciprocalList();
    return (
      listOfReciprocalGroups.length >= 1 &&
      this.reciprocalGroupIndex == listOfReciprocalGroups.length
    );
  }

  hasBlockTrials() {
    const currentBlock = this.experiment.getBlock(this.blockNumber);
    return currentBlock.getReciprocalList() != null;
  }

  isExperimentFinished() {
    return this.blockNumber > BLOCKS_NUMBER;
  }

  handleFailedReciprocalTrial() {
    if (INTERRUPT_RECIPROCAL_GROUP) {
      console.log("trial index: " + this.trialIndex);
      this.trialIndex = -1;
      this.reciprocalGroupIndex++;
    }
    this.trialIsFailed = false;
  }

  getCurrentBlock() {
    return this.experiment.getBlock(this.blockNumber);
  }

  showTrial() {
    if (!this.printedFirstBlock) {
      this.printedFirstBlock = true;
      this.getFirstReciprocalTrial();
    }

    const currentBlock = this.experiment.getBlock(this.blockNumber);
    const trialList = currentBlock
      .getReciprocalList()
      [this.reciprocalGroupIndex].getTrialsGroup();

    const trial = trialList[this.trialIndex];

    if (checkIfInstanceOfTrialReciprocal(trial)) {
      this.trial = trial;
    } else {
      console.log("EXIT");
      return;
    }

    this.increaseTrialIndexInExperiment();

    const prev = deepCopy(this.prevTrial);

    this.trial.setPreviousTrial(prev);

    this.trial.drawShapes();

    this.showReciprocalIndexes(); // do subtraction

    this.setPrevTrialOnExperimentFrame();

    if (this.getTrialIndexInExperiment() % TRIALS_PER_BREAK == 0) {
      this.displayBreakWindow();
    }
  }

  getTrialIndexInExperiment() {
    return this.trialIndexInExperiment;
  }

  increaseTrialIndexInExperiment() {
    this.trialIndexInExperiment++;
  }

  setPrevTrialOnExperimentFrame() {
    this.prevTrial = {
      trialId: this.trial.trialId,
      trialRep: this.trial.trialRep,
      startX: this.trial.startCoords.x,
      startY: this.trial.startCoords.y,
      targetX: this.trial.targetCoords.x,
      targetY: this.trial.targetCoords.y,
      clicksTime: this.trial.clicksTime,
      clicksCoords: this.trial.clicksCoords,
      startCoords: this.trial.startCoords,
      targetCoords: this.trial.targetCoords,
      startPressIn: this.trial.startPressIn,
      startReleaseIn: this.trial.startReleaseIn,
      targetPressIn: this.trial.targetPressIn,
      targetReleaseIn: this.trial.targetReleaseIn,
    };
  }

  showReciprocalIndexes() {
    let index = this.getTrialIndexInExperiment();
    const trialsToBlockIndexEI = document.getElementById("trialsToBreak");
    trialsToBlockIndexEI.innerText = this.getReciprocalRemainingTrials() + "";

    const currentTrialIndexEl = document.getElementById("trialNumber");
    currentTrialIndexEl.innerText = index;

    const currentBlockIndexEl = document.getElementById("totalTrials");
    currentBlockIndexEl.innerText = this.getTotalTrials() + "";
  }

  handleFinish() {
    this.cleanUpSounds();
    showFinishWindow();
  }

  displayBreakWindow() {
    const breakWindow = document.getElementById("breakWindow");

    breakWindow.style.display = "block";

    // Disable the rest of the page interaction while the break window is visible
    document.body.style.pointerEvents = "none";

    const continueButton = document.getElementById("continueButton");

    continueButton.addEventListener("click", () => {
      breakWindow.style.display = "none";
      document.body.style.pointerEvents = "auto";
    });
  }

  getTotalTrials() {
    console.log(" TOTAL TRIALS");
    console.log(this.getReciprocalTotalTrials());
    console.log(" SKIPPED TRIALS");
    console.log(this.skippedTrials);
    return this.getReciprocalTotalTrials() - this.skippedTrials;
  }

  getReciprocalTotalTrials() {
    let totalTrials = 0;
    for (let i = 1; i <= this.experiment.numBlocks; i++) {
      const block = this.experiment.getBlock(i);
      let list = block.getReciprocalList();
      for (const element of list) {
        totalTrials += element.getTrialsGroupSize();
      }
    }
    return totalTrials;
  }

  getReciprocalRemainingTrials() {
    let index = this.trialIndexInExperiment;
    return TRIALS_PER_BREAK - (index % TRIALS_PER_BREAK);
  }

  getFirstReciprocalTrial() {
    if (this.trialNumber === -1) {
      let block = this.experiment.getBlock(this.blockNumber);

      this.reciprocalGroupIndex = 0;
      if (block && block.getReciprocalList().length > 0) {
        const firstTrialGroup = block.getReciprocalList()[0];

        const firstTrial = firstTrialGroup.getTrialsGroup()[0];

        this.trialNumber = firstTrial.getTrialID();

        this.trial = firstTrial;
      } else {
        throw Error(ERROR_EMPTY_BLOCK);
      }
    }
  }

  cleanUpSounds() {
    errorSound.srcObject = null;
    successSound.srcObject = null;
    errorSound.src = "";
    successSound.src = "";
    errorSound.remove();
    successSound.remove();
  }

  setupContinueButton() {
    this.continueButton.addEventListener("click", () => {
      this.breakWindow.style.display = "none";
      document.body.style.pointerEvents = "auto";
    });
  }

  markFailedGroup(trialData) {
    console.log(trialData);
    const copyOfTrial = trialData.copyOfTrial;
    const trialRep = trialData.trialRep;
    const currentTravel = trialData.currTravel;

    for (const row of this.trialsData) {
      if (
        row.trialRep == trialRep &&
        row.copyOfTrial == copyOfTrial &&
        row.currTravel >= 0 &&
        row.currTravel <= currentTravel
      ) {
        if (!row.toBeRepeatedTrial) {
          console.log(
            `Travel ${currentTravel} was a mistake. Set RETRO travel ${row.currTravel} to be repeated.`,
          );
          row.toBeRepeatedTrial = true;
        } else {
          console.log(
            `Travel ${currentTravel} was a mistake. RETRO travel ${row.currTravel} is already set.`,
          );
        }
      }
    }
  }
}
