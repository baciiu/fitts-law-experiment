"use strict";

class ReciprocalExperimentFrame {
  constructor(userNumber) {
    this.blockNumber = 1;
    this.trialNumber = -1;
    this.experiment = new Experiment(BLOCKS_NUMBER, REPETITION_PER_TRIAL);
    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.setupContinueButton();
    this.endTrialPos = null;
    this.trial = null;
    this.trialsData = [];
    this.userNumber = userNumber;
    this.trialIndex = 0;
    this.reciprocalGroupIndex = 0;
    this.trialGroup = [];
    this.trialRep = null;
    this.trialIndexInExperiment = 0;

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

    trialData.blockNumber = this.blockNumber;
    trialData.userNumber = this.userNumber;

    this.endTrialPos = trialData.endTrialPos;
    this.trialsData.push(trialData);

    if (trialData.toBeRepeatedTrial) {
      this.insertReciprocalTrialToBlock(trialCopy);
    }
    this.prepareForNextTrialOrFinishReciprocal();
  }

  insertReciprocalTrialToBlock(failedTrial) {
    const currentBlock = this.experiment.getBlock(this.blockNumber);

    let newReciprocalTrial = new ReciprocalGroup(failedTrial.trialRep);
    let reciprocalGroup = [];

    let failedTrialGroup = currentBlock
      .getReciprocalList()
      [this.reciprocalGroupIndex].getTrialsGroup();

    console.log("FAILED TRIAL AND GROUP");
    console.log(failedTrial);
    console.log(failedTrialGroup);

    for (const trial of failedTrialGroup) {
      const copyTrial = new Trial(
        currentBlock.getReciprocalTotalTrialsNumber() + 1,
        trial.trialRep,
        trial.trialDirection,
        trial.startWidth,
        trial.startHeight,
        trial.targetWidth,
        trial.targetHeight,
        trial.amplitude,
      );
      reciprocalGroup.push(copyTrial);
    }

    newReciprocalTrial.setReciprocalTrial(reciprocalGroup);

    console.log(currentBlock.getReciprocalList());

    insertReciprocalTrialInArray(
      currentBlock.getReciprocalList(),
      newReciprocalTrial,
      this.reciprocalGroupIndex,
    );
  }

  prepareForNextTrialOrFinishReciprocal() {
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

  hasListGroupIndex() {
    return (
      this.getCurrentBlock().getReciprocalList()[this.reciprocalGroupIndex] !=
      null
    );
  }

  hasNextTrialInGroup() {
    return (
      this.trialIndex <
      this.getCurrentBlock()
        .getReciprocalList()
        [this.reciprocalGroupIndex].getTrialsGroup().length -
        1
    );
  }

  hasNextList() {
    return (
      this.reciprocalGroupIndex <
      this.getCurrentBlock().getReciprocalList().length - 1
    );
  }

  isExperimentFinished() {
    return (
      this.reciprocalGroupIndex >=
        this.getCurrentBlock().getReciprocalList().length &&
      this.blockNumber >= BLOCKS_NUMBER
    );
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

    if (trial == null) {
      console.error("Trial is null");
      return;
    }

    if (checkIfInstanceOfTrial(trial)) {
      this.trial = trial;
    } else {
      console.log("EXIT");
      return;
    }

    const prev = deepCopy(this.prevTrial);

    this.trial.setPreviousTrial(prev);

    this.trial.drawShapes();

    this.showReciprocalIndexes();

    this.setThisPrevTrial();

    this.increaseTrialIndexInExperiment();

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
    let index = this.trialIndex;
    index++;
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
    let index = this.trialIndex;
    const a = index % TRIALS_PER_BREAK;
    const b = TRIALS_PER_BREAK;
    return b - a;
  }

  getFirstReciprocalTrial() {
    if (this.trialNumber === -1) {
      let block = this.experiment.getBlock(this.blockNumber);

      this.reciprocalGroupIndex = 0;
      if (block && block.getReciprocalList().length > 0) {
        let firstTrialGroup = block.getReciprocalList()[0];

        let firstTrial = firstTrialGroup.getTrialsGroup()[0];

        this.trialNumber = firstTrial.getTrialID();

        this.trial = firstTrial;
      } else {
        throw Error("[MY ERROR]: No trials found in the first block.");
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
