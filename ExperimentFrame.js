class ExperimentFrame {
  constructor(userNumber) {
    this.blockNumber = 1;
    this.trialNumber = 1;
    this.totalBlocks = 2;
    this.trialsPerBreak = 4;
    this.experimentType = "STS"; //
    this.shape = "rectangle"; // rectangle or circle
    this.intDevice = "Mouse"; //"Mouse" , "Touch"  , "Laser Pointer"
    this.repetitonPerTrial = 1;
    this.experiment = new Experiment(
      this.experimentType,
      this.shape,
      this.intDevice,
      this.totalBlocks,
      this.repetitonPerTrial,
    );
    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.setupContinueButton();
    this.allClicks = [];
    this.endTrialPos = null;
    this.trial = null;
    this.trialsData = [];
    this.userNumber = userNumber;
  }

  setupContinueButton() {
    this.continueButton.addEventListener("click", () => {
      this.breakWindow.style.display = "none";
      document.body.style.pointerEvents = "auto";
    });
  }

  showTrial() {
    if (
      this.experiment.getBlock(this.blockNumber).getTrial(this.trialNumber) ===
      undefined
    ) {
      console.log("TRIAL UNDEFINED");
      return;
    }
    this.experiment
      .getBlock(this.blockNumber)
      .getTrial(this.trialNumber)
      .setPreviousTrialPosition(this.endTrialPos);

    this.trial = this.experiment
      .getBlock(this.blockNumber)
      .getTrial(this.trialNumber);

    if (!this.printedFirstBlock) {
      this.printedFirstBlock = true;
      //this.printAllTrials();
    }
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
    console.log(data);

    if (data.isFailed === true) {
      // add it to the block
    }

    const currentBlock = this.experiment.getBlock(this.blockNumber);

    if (currentBlock) {
      if (currentBlock.hasNextTrial(this.trialNumber)) {
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

  getNextTrial() {
    this.trialNumber++;
    this.showTrial();
  }

  getNextBlock() {
    this.blockNumber++;
    this.trialNumber = 1;
    this.showTrial();
  }

  showIndexes() {
    const currentTrialIndexEl = document.getElementById("currentTrialIndex");
    currentTrialIndexEl.innerText = this.trialNumber;

    const currentBlockIndexEl = document.getElementById("totalTrialsIndex");
    currentBlockIndexEl.innerText = this.getTotalTrials() + "";

    const trialsToBlockIndexEI = document.getElementById("trialsToBreakIndex");
    trialsToBlockIndexEI.innerText = this.getRemainingTrials() + "";
  }

  experimentFinished() {
    //window.close();
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
    const a = this.trialNumber % this.trialsPerBreak;
    const b = this.trialsPerBreak;
    return b - a;
  }

  printAllTrials() {
    for (let i = 0; i < this.experiment.getNumBlocks(); i++) {
      const block = this.experiment.getBlock(i + 1);

      for (let j = 0; j < block.getTrialsNumber(); j++) {
        const trial = block.getTrial(j + 1);
        console.log(trial);
      }
    }
  }
}
