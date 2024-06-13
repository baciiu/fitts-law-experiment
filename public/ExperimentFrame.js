"use strict";

class ExperimentFrame {
  constructor(userNumber) {
    this.blockNumber = 1;
    this.trialNumber = -1;
    this.experiment = new Experiment(BLOCKS_NUMBER, REPETITION_PER_TRIAL);
    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.endTrialPos = null;
    this.trial = null;
    this.trialsData = [];
    this.userNumber = userNumber;
    this.trialIndex = 0;
    this.trialIndexInExperiment = -1;

    this.prevTrial = {
      trialId: null,
      trialRep: null,
      startX: null,
      startY: null,
      targetX: null,
      targetY: null,
    };
    this.setupContinueButton();

    document.addEventListener(
      "trialCompleted",
      this.handleTrialCompleted.bind(this),
    );
  }

  init() {
    this.showTrial();
  }

  setupContinueButton() {
    this.continueButton.addEventListener("click", () => {
      this.breakWindow.style.display = "none";
      document.body.style.pointerEvents = "auto";
    });
  }

  handleTrialCompleted(event) {
    const detail = event.detail;
    this.trialCompleted(detail);
  }

  trialCompleted(trialEmitted) {
    let trialData = trialEmitted.trialData;
    let trialCopy = trialEmitted.trialCopy;
    const currentBlock = this.experiment.getBlock(this.blockNumber);

    checkForNullOrUndefined(trialData);

    trialData.blockNumber = this.blockNumber;
    trialData.userNumber = this.userNumber;

    this.endTrialPos = trialData.endTrialPos;
    this.trialsData.push(trialData);

    if (trialData.toBeRepeatedTrial) {
      const failedTrial = new Trial(
        currentBlock.getTrialsNumber() + 1,
        trialCopy.trialRep,
        trialCopy.trialDirection,
        trialCopy.startWidth,
        trialCopy.startHeight,
        trialCopy.targetWidth,
        trialCopy.targetHeight,
        trialCopy.amplitude,
      );

      insertTrialInArray(
        currentBlock.getTrials(),
        failedTrial,
        this.trialIndex,
      );
    }
    this.prepareForNextTrialOrFinish(currentBlock);
  }

  prepareForNextTrialOrFinish(currentBlock) {
    this.trialIndex++;
    if (currentBlock.getTrials()[this.trialIndex]) {
      this.showTrial();
    } else if (++this.blockNumber <= BLOCKS_NUMBER) {
      this.trialIndex = 0;
      this.showTrial();
    } else {
      this.experimentFinished();
    }
  }

  showTrial() {
    if (!this.printedFirstBlock) {
      this.printedFirstBlock = true;
      this.getFirstTrial();
    }

    let block = this.experiment.getBlock(this.blockNumber);
    let trial = block.getTrials()[this.trialIndex];

    if (checkIfInstanceOfTrial(trial)) {
      this.trial = trial;
    } else {
      console.log("EXIT");
      return;
    }

    this.increaseTrialIndexInExperiment();

    const prev = deepCopy(this.prevTrial);

    this.trial.setPreviousTrial(prev);

    this.trial.drawShapes();

    this.showIndexes();

    this.setThisPrevTrial();

    if (this.getTrialIndexInExperiment() % TRIALS_PER_BREAK === 0) {
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

  showIndexes() {
    let index = this.trialIndex;
    index++;
    const currentTrialIndexEl = document.getElementById("trialNumber");
    currentTrialIndexEl.innerText = index;

    const currentBlockIndexEl = document.getElementById("totalTrials");
    currentBlockIndexEl.innerText = this.getTotalTrials() + "";

    const trialsToBlockIndexEI = document.getElementById("trialsToBreak");
    trialsToBlockIndexEI.innerText = this.getRemainingTrials() + "";
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

  getTotalTrials() {
    let totalTrials = 0;
    for (let i = 1; i <= this.experiment.numBlocks; i++) {
      const block = this.experiment.getBlock(i);
      totalTrials += block.getTrialsNumber();
    }
    return totalTrials;
  }

  getRemainingTrials() {
    let index = this.trialIndexInExperiment;
    const a = index % TRIALS_PER_BREAK;
    const b = TRIALS_PER_BREAK;
    return b - a;
  }

  getFirstTrial() {
    if (this.trialNumber === -1) {
      let block = this.experiment.getBlock(this.blockNumber);

      if (block && block.getTrials().length > 0) {
        let firstTrial = block.getTrials()[0];

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
}
