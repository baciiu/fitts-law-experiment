class ExperimentFrame {
  constructor(userNumber) {
    this.blockNumber = 1;
    this.trialNumber = -1;
    this.totalBlocks = 2;
    this.trialsPerBreak = 100;
    this.experimentType = "STS"; //
    this.shape = "rectangle"; // rectangle or circle
    this.intDevice = "Mouse"; //"Mouse" , "Touch"  , "Laser Pointer"
    this.repetitonPerTrial = 1;
    this.scrambleBlocks = true;
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
      console.log(first_trial);
      console.log("first trial at index 0 : " + this.trialNumber);
    }
  }

  showTrial() {
    if (!this.printedFirstBlock) {
      this.printedFirstBlock = true;
      console.log("FIRST BLOCK");
      this.getFirstTrial();
      //this.printAllTrials();
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

    if (data.isFailed === true) {
      // add it to the block
      console.log("add trial in the block");
    }

    const currentBlock = this.experiment.getBlock(this.blockNumber);

    if (currentBlock) {
      if (currentBlock.hasNextTrial(this.trialIndex)) {
        console.log("HAS NEXT TRIAL");
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
    this.trialIndex++;
    const currentBlock = this.experiment.getBlock(this.blockNumber);

    this.trialNumber = currentBlock
      .getTrials()
      .at(this.trialIndex)
      .getTrialID();

    this.showTrial();
  }

  getNextBlock() {
    this.blockNumber++;
    // get trial number from first position
    const currentBlock = this.experiment.getBlock(this.blockNumber);

    this.trialNumber = currentBlock.getTrials()[0].getTrialID();
    this.trialIndex = 0;
    console.log(
      "trial nr:  " + this.trialNumber + " from block: " + this.blockNumber,
    );
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
    let index = this.trialIndex;
    index++;
    const a = index % this.trialsPerBreak;
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
