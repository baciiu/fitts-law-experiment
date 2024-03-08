class ExperimentFrame {
  constructor(userNumber, experimentType) {
    this.blockNumber = 1;
    this.trialNumber = -1;
    this.totalBlocks = 1;
    this.trialsPerBreak = 100;
    this.experimentType = experimentType;
    this.intDevice = this.setDevice();
    this.repetitionPerTrial = 2;
    this.scrambleBlocks = false;
    this.experiment = new Experiment(
      this.experimentType,
      this.intDevice,
      this.totalBlocks,
      this.repetitionPerTrial,
      this.scrambleBlocks,
    );
    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.setupContinueButton();
    this.allClicks = [];
    this.endTrialPos = null;
    this.trial = null;
    this.trialsData = [];
    this.userNumber = userNumber;
    this.trialIndex = 0;

    document.addEventListener(
      "trialCompleted",
      this.handleTrialCompleted.bind(this),
    );
  }

  init() {
    this.showTrial();
  }

  setDevice() {
    /*if (isMobile()) {
                  // does not work; set manually
                  return "Touch";
                } else {
                  return "Mouse";
                }*/
    return "Mouse"; // "Touch";
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

    if (trialData.isFailedTrial) {
      const failedTrial = new Trial(
        currentBlock.getTrialsNumber() + 1,
        trialCopy.trialRep,
        trialCopy.trialDirection,
        trialCopy.experimentType,
        trialCopy.intDevice,
        trialCopy.startWidth,
        trialCopy.startHeight,
        trialCopy.targetWidth,
        trialCopy.targetHeight,
        trialCopy.amplitude,
        trialCopy.maxScreenPercentage,
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

    if (typeof this.trial.drawShapes === "function") {
      this.trial.drawShapes();
    } else {
      throw Error(
        "[MY ERROR]: drawShapes method not found on the current trial object.",
      );
    }

    this.showIndexes();

    if (this.trialNumber % this.trialsPerBreak === 0) {
      this.displayBreakWindow();
    }
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
    index++;
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
}
