class ExperimentFrame {
  constructor(userNumber, experimentType) {
    this.blockNumber = 1;
    this.trialNumber = -1;
    this.totalBlocks = 2;
    this.trialsPerBreak = 100;
    this.experimentType = experimentType;
    this.shape = "rectangle";
    this.intDevice = "Touch"; //"Mouse" , "Touch"  , "Laser Pointer"
    this.repetitonPerTrial = 2;
    this.scrambleBlocks = false;
    this.experiment = new Experiment(
      this.experimentType,
      this.shape,
      this.intDevice,
      this.totalBlocks,
      this.repetitonPerTrial,
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
    console.log(this.experiment.getBlock(1));
    console.log(this.experiment.getBlock(2));
  }

  setupContinueButton() {
    this.continueButton.addEventListener("click", () => {
      this.breakWindow.style.display = "none";
      document.body.style.pointerEvents = "auto";
    });
  }

  getFirstTrial() {
    if (this.trialNumber === -1) {
      let block = this.experiment.getBlock(this.blockNumber);
      let first_trial = block.getTrials()[0];
      this.trialNumber = first_trial.getTrialID();
    }
  }

  showTrial() {
    if (!this.printedFirstBlock) {
      this.printedFirstBlock = true;
      this.getFirstTrial();
    }
    let block = this.experiment.getBlock(this.blockNumber);

    block
      .getTrials()
      .at(this.trialIndex)
      .setPreviousTrialPosition(this.endTrialPos);

    this.trial = block.getTrials()[this.trialIndex];

    this.showIndexes();
    this.trial.drawShapes();

    // Time for a break
    if (this.trialNumber % this.trialsPerBreak === 0) {
      this.displayBreakWindow();
    }
  }

  trialCompleted() {
    this.endTrialPos = this.trial.getEndTrialPosition();

    let data = this.trial.getExportDataTrial();
    data.userNumber = this.userNumber;
    data.blockNumber = this.blockNumber;
    data.experimentType = this.experimentType;

    this.trialsData.push(data);

    const currentBlock = this.experiment.getBlock(this.blockNumber);

    if (data.isFailed === true) {
      const failedTrial = { ...this.trial }; // create a copy

      failedTrial.trialId = currentBlock.getTrialsNumber() + 1;

      this.insertItemAfterGivenIndex(
        currentBlock.getTrials(),
        failedTrial,
        this.trialIndex + 1,
      );
    }

    if (currentBlock) {
      this.trialIndex++;
      if (currentBlock.hasNextTrial(this.trialIndex)) {
        this.getNextTrial();
      } else if (this.experiment.hasNextBlock(this.blockNumber)) {
        this.getNextBlock();
      } else {
        this.experimentFinished();
      }
    } else {
      console.error("Invalid block number:", this.blockNumber);
    }
  }

  // Fisher-Yates Algorithm
  insertItemAfterGivenIndex(array, newItem, startIndex) {
    // Ensure the startIndex is within the array bounds and not the last element
    if (startIndex < 0 || startIndex >= array.length - 1) {
      console.error("Invalid startIndex. Item not inserted.");
      return;
    }

    // Generate a random index in the range from startIndex + 1 to the array length inclusive
    const rand = Math.random();
    const randomIndex =
      Math.floor(rand * (array.length - startIndex)) + startIndex + 1;

    // Insert the new item at the random index
    array.splice(randomIndex, 0, newItem);
  }

  getNextTrial() {
    const currentBlock = this.experiment.getBlock(this.blockNumber);

    if (currentBlock.getTrials().at(this.trialIndex)) {
      this.trialNumber = currentBlock
        .getTrials()
        .at(this.trialIndex)
        .getTrialID();
      this.showTrial();
    } else {
      this.getNextBlock();
    }
  }

  getNextBlock() {
    this.blockNumber++;
    // get trial number from first position
    const currentBlock = this.experiment.getBlock(this.blockNumber);

    this.trialNumber = currentBlock.getTrials()[0].getTrialID();
    this.trialIndex = 0;
    this.showTrial();
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
    console.log("finished! :) ");
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
}
