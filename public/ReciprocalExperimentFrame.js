"use strict";

class ReciprocalExperimentFrame {
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

    this.prevTrial = {
      trialId: null,
      trialRep: null,
      startX: null,
      startY: null,
      targetX: null,
      targetY: null,
    };

    document.addEventListener(
      "trialCompleted",
      this.handleTrialCompleted.bind(this),
    );
  }

  init() {
    console.log(this.experiment.getBlock(this.blockNumber));
    this.showTrial();
  }

  handleTrialCompleted(event) {
    const detail = event.detail;
    this.trialCompleted(detail);
  }

  trialCompleted(trialEmitted) {
    let trialData = trialEmitted.trialData;
    let trialCopy = trialEmitted.trialCopy;

    checkForNullOrUndefined(trialData);

    trialData.no = this.getTrialIndexInExperiment();
    trialData.blockNumber = this.blockNumber;
    trialData.userNumber = this.userNumber;

    this.endTrialPos = trialData.endTrialPos;
    this.trialsData.push(trialData);

    if (trialData.toBeRepeatedTrial) {
      this.trialIsFailed = true;
      console.log("REPEAT TRIAL");
      this.insertReciprocalTrialToBlock(trialCopy);
    } else {
      this.trialIsFailed = false;
    }
    this.prepareForNextTrialOrFinishReciprocal();
  }

  insertReciprocalTrialToBlock(failedTrial) {
    const currentBlock = this.experiment.getBlock(this.blockNumber);

    const failedTrialGroupOriginal = currentBlock
      .getReciprocalList()
      [this.reciprocalGroupIndex].getTrialsGroup();

    let newReciprocalTrial = this.getCopyOfGroup(
      failedTrial.trialRep,
      failedTrialGroupOriginal,
    );

    console.log(
      "Trying to insert failed trial to the index: " +
        this.reciprocalGroupIndex,
    );

    if (
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
  }

  getCopyOfGroup(trialRep, group) {
    // TODO: every trial within group gets the same trial ID
    const reciprocalGroup = new ReciprocalGroup(trialRep);
    let trialId = this.getCurrentBlock().getReciprocalTotalTrialsNumber() + 1;
    for (const trial of group) {
      trialId++;
      const copyTrial = new Trial(
        trialId,
        trial.trialRep,
        trial.trialDirection,
        trial.startWidth,
        trial.startHeight,
        trial.targetWidth,
        trial.targetHeight,
        trial.amplitude,
      );
      copyTrial.setCurrentTravel(trial.currentTravel);
      copyTrial.setIsTrialAMistakeRepetition(true);

      reciprocalGroup.addTrial(copyTrial);
    }
    return reciprocalGroup;
  }

  prepareForNextTrialOrFinishReciprocal() {
    if (this.trialIsFailed) {
      if (INTERRUPT_RECIPROCAL_GROUP) {
        this.trialIndex = -1;
        this.reciprocalGroupIndex++;
      }
      this.trialIsFailed = false;
    }
    this.trialIndex++;

    if (this.blockNumber <= BLOCKS_NUMBER) {
      const currentBlock = this.experiment.getBlock(this.blockNumber);
      if (currentBlock.getReciprocalList() != null) {
        let listOfReciprocalGroups = currentBlock.getReciprocalList();
        if (
          listOfReciprocalGroups.length >= 1 &&
          this.reciprocalGroupIndex < listOfReciprocalGroups.length
        ) {
          const reciprocalGroup =
            listOfReciprocalGroups[this.reciprocalGroupIndex];
          console.log("reciprocalGroup: ");
          console.log(reciprocalGroup);

          if (reciprocalGroup != null) {
            const trialList = reciprocalGroup.getTrialsGroup();
            if (trialList.length >= 1 && this.trialIndex < trialList.length) {
              // TODO: show trial
              console.log("trialIndex: " + this.trialIndex);

              console.log(
                "groupIndex: " +
                  this.reciprocalGroupIndex +
                  " / " +
                  this.getCurrentBlock().getReciprocalList().length,
              );
              console.log(
                "blockNumber: " + this.blockNumber + " / " + BLOCKS_NUMBER,
              );
              this.showTrial();
            } else if (
              trialList.length >= 1 &&
              this.trialIndex == trialList.length
            ) {
              // TODO: go to next trialGroup
              this.reciprocalGroupIndex++;
              this.trialIndex = -1;
              this.prepareForNextTrialOrFinishReciprocal();
            } else {
              console.log("trial List is empty");
            }
          } else {
            console.log("reciprocal group is empty.");
          }
        } else if (
          listOfReciprocalGroups.length >= 1 &&
          this.reciprocalGroupIndex == listOfReciprocalGroups.length
        ) {
          // TODO: go to next block
          this.blockNumber++;
          this.trialIndex = -1;
          this.reciprocalGroupIndex = 0;
          this.prepareForNextTrialOrFinishReciprocal();
        } else {
          console.log("list of reciprocal group is empty");
        }
      } else {
        console.log("block has no lists of trials");
      }
    } else {
      this.experimentFinished();
    }
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

    if (checkIfInstanceOfTrial(trial)) {
      this.trial = trial;
    } else {
      console.log("EXIT");
      return;
    }

    this.increaseTrialIndexInExperiment();

    const prev = deepCopy(this.prevTrial);

    this.trial.setPreviousTrial(prev);

    if (this.getTrialIndexInExperiment() == 1) {
      this.trial.setIsFirstTrial(true);
    }

    this.trial.drawShapes();

    this.showReciprocalIndexes();

    this.setThisPrevTrial();

    console.log(
      `Trial Index In Experiment ${this.getTrialIndexInExperiment()} modulo ${TRIALS_PER_BREAK} is ` +
        (this.getTrialIndexInExperiment() % TRIALS_PER_BREAK),
    );

    if (this.getTrialIndexInExperiment() % TRIALS_PER_BREAK == 0) {
      this.displayBreakWindow();
    }
  }

  getTrialIndexInExperiment() {
    return this.trialIndexInExperiment;
  }

  increaseTrialIndexInExperiment() {
    this.trialIndexInExperiment++;
    console.log("Trial Index In Experiment is " + this.trialIndexInExperiment);
  }

  setThisPrevTrial() {
    this.prevTrial = {
      trialId: this.trial.trialId,
      trialRep: this.trial.trialRep,
      startX: this.trial.startCoords.x,
      startY: this.trial.startCoords.y,
      targetX: this.trial.targetCoords.x,
      targetY: this.trial.targetCoords.y,
    };
  }

  showReciprocalIndexes() {
    let index = this.getTrialIndexInExperiment();
    const currentTrialIndexEl = document.getElementById("trialNumber");
    currentTrialIndexEl.innerText = index;

    const currentBlockIndexEl = document.getElementById("totalTrials");
    currentBlockIndexEl.innerText = this.getReciprocalTotalTrials() + "";

    const trialsToBlockIndexEI = document.getElementById("trialsToBreak");
    trialsToBlockIndexEI.innerText = this.getReciprocalRemainingTrials() + "";
  }

  experimentFinished() {
    this.cleanUpSounds();
    this.downloadCSV(this.trialsData);
    showFinishWindow();
  }

  downloadCSV(data) {
    let filename = "trial_" + "USER_" + this.userNumber + ".csv";
    const csvContent = this.convertToCSV(data);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertToCSV(array) {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add header row
    if (array.length > 0) {
      const headers = Object.keys(array[0]).join(",");
      csvContent += headers + "\r\n";
    }

    // Add data rows
    array.forEach((obj) => {
      const row = Object.values(obj).join(",");
      csvContent += row + "\r\n";
    });

    return csvContent;
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

  getReciprocalTotalTrials() {
    let totalTrials = 0;
    for (let i = 1; i <= this.experiment.numBlocks; i++) {
      const block = this.experiment.getBlock(i);
      let list = block.getReciprocalList();
      for (let j = 0; j < list.length; j++) {
        let reciprocalTrial = list[j];
        totalTrials += reciprocalTrial.getTrialsGroupSize();
      }
    }
    return totalTrials;
  }

  getReciprocalRemainingTrials() {
    let index = this.trialIndexInExperiment;
    const a = index % TRIALS_PER_BREAK;
    const b = TRIALS_PER_BREAK;
    return b - a;
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
}
