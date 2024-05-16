class ExperimentFrame {
  constructor(userNumber) {
    this.blockNumber = 1;
    this.trialNumber = -1;
    this.totalBlocks = BLOCKS_NUMBER;
    this.trialsPerBreak = TRIALS_PER_BREAK;
    this.experimentType = EXPERIMENT_TYPE;
    this.repetitionPerTrial = REPETITION_PER_TRIAL;
    this.scrambleBlocks = SCRAMBLE_BLOCKS;
    this.experiment = new Experiment(
      this.totalBlocks,
      this.repetitionPerTrial,
      this.scrambleBlocks,
    );
    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.setupContinueButton();
    this.endTrialPos = null;
    this.trial = null;
    this.trialsData = [];
    this.userNumber = userNumber;
    this.trialIndex = 0;

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

  // Other methods remain unchanged

  trialCompleted(detail) {
    let trialData = detail.trialData;
    let trialCopy = detail.trialCopy;
    const currentBlock = this.experiment.getBlock(this.blockNumber);

    if (trialData === undefined || trialData === null) {
      throw Error("[MY ERROR]: Could not parse trial data");
    }
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

      if (!(failedTrial instanceof Trial)) {
        throw Error("[MY ERROR]: newItem must be an instance of Trial.");
      }
      this.insertItemAfterGivenIndex(
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
    } else if (++this.blockNumber <= this.totalBlocks) {
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
    this.trial = block.getTrials()[this.trialIndex];

    this.trial.setPreviousTrial(this.prevTrial);

    if (typeof this.trial.drawShapes === "function") {
      this.trial.drawShapes();
    } else {
      throw Error(
        "[MY ERROR]: drawShapes method not found on the current trial object.",
      );
    }

    this.showIndexes();
    this.setThisPrevTrial();

    if (this.trialIndex % this.trialsPerBreak === 0) {
      this.displayBreakWindow();
    }
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

  // Fisher-Yates Algorithm
  insertItemAfterGivenIndex(array, newItem, startIndex) {
    if (!(newItem instanceof Trial)) {
      throw Error("[MY ERROR]: newItem must be an instance of Trial.");
    }
    // Ensure the startIndex is within the array bounds and not the last element
    if (startIndex < 0 || startIndex >= array.length - 1) {
      throw Error("[MY ERROR]: Invalid startIndex. Item not inserted.");
    }

    // Generate a random index in the range from startIndex + 1 to the array length inclusive
    const rand = Math.random();
    const randomIndex =
      Math.floor(rand * (array.length - startIndex)) + startIndex + 1;

    // Insert the new item at the random index
    array.splice(randomIndex, 0, newItem);
  }

  showIndexes() {
    let index = this.trialIndex;
    index++;
    const currentTrialIndexEl = document.getElementById("currentTrialIndex");
    currentTrialIndexEl.innerText = index;

    const currentBlockIndexEl = document.getElementById("totalTrialsIndex");
    currentBlockIndexEl.innerText = this.getTotalTrials() + "";

    const trialsToBlockIndexEI = document.getElementById("trialsToBreakIndex");
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
    let index = this.trialIndex;
    const a = index % this.trialsPerBreak;
    const b = this.trialsPerBreak;
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
    errorSound.remove();
    successSound.remove();
    errorSound.srcObject = null;
    successSound.srcObject = null;
    errorSound.src = "";
    successSound.src = "";
  }
}