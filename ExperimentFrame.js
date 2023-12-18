class ExperimentFrame {
  constructor() {
    this.blockNumber = 1;
    this.trialNumber = 1;
    this.totalBlocks = 2;
    this.trialsPerBreak = 7;
    this.experimentType = "STS"; //
    this.shape = "rectangle"; // rectangle or circle
    this.intDevice = "Mouse"; //"Mouse" , "Touch"  , "Laser Pointer"
    this.experiment = new Experiment(
      this.experimentType,
      this.shape,
      this.intDevice,
      this.totalBlocks,
    );
    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.setupContinueButton();
    this.allClicks = [];
    this.endTrialPos = null;
  }

  setupContinueButton() {
    this.continueButton.addEventListener("click", () => {
      this.breakWindow.style.display = "none";
      document.body.style.pointerEvents = "auto";
    });
  }

  showTrial() {
    this.experiment
      .getBlock(this.blockNumber)
      .getTrial(this.trialNumber)
      .setPreviousTrialPosition(this.endTrialPos);

    const trial = this.experiment
      .getBlock(this.blockNumber)
      .getTrial(this.trialNumber);

    if (!this.printedFirstBlock) {
      this.printedFirstBlock = true;
      //this.printAllTrials();
    }
    this.showIndexes();
    trial.drawShapes();
    this.endTrialPos = trial.getEndTrialPosition();

    // Time for a break
    if (this.trialNumber % this.trialsPerBreak === 0) {
      this.displayBreakWindow();
    }
  }

  trialCompleted() {
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
    console.log("finished! :) ");
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
    let totalTrials = 0;
    for (let i = 1; i <= this.experiment.numBlocks; i++) {
      const block = this.experiment.getBlock(i);
      totalTrials += block.trialsNum;
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

      for (let j = 0; j < block.trialsNum; j++) {
        const trial = block.getTrial(j + 1);
        console.log(trial);
      }
    }
  }

  collectAllTrials() {
    let allTrials = [];

    // Loop through each block and collect all trial data
    Array.from({ length: this.experiment.getNumBlocks() }, (_, i) => {
      const block = this.experiment.getBlock(i + 1);
      Array.from({ length: block.trialsNum }, (_, j) => {
        // Add each trial to the allTrials array
        allTrials.push(block.getTrial(j + 1));
      });
    });

    return allTrials;
  }

  exportAllTrialsToCSV() {
    // This array will hold all trial data.
    let allTrials = [];

    // Assuming 'experiment' is accessible in this scope,
    // or you might need to pass it as a function parameter.
    const numBlocks = this.experiment.getNumBlocks();

    // Iterate over all blocks.
    for (let i = 0; i < numBlocks; i++) {
      const block = this.experiment.getBlock(i + 1); // assuming blocks are 1-indexed
      if (block && block.trialsNum) {
        // Iterate over all trials in the block.
        for (let j = 0; j < block.trialsNum; j++) {
          const trial = block.getTrial(j + 1); // assuming trials are 1-indexed
          if (trial) {
            // Collect the necessary data from each trial.
            allTrials.push(trial); // ensure this object structure matches what exportTrialToCSV expects
          }
        }
      }
    }

    // Check if trials were collected successfully.
    if (allTrials.length === 0) {
      console.error(
        "No trials were collected. Please check the methods for retrieving blocks and trials.",
      );
      return; // Exit if no trial data
    }

    // Here, we directly use the logic for exporting to CSV within the same function.
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      "Trial ID,Shape,Direction,Interaction Device,Start Index,Target Index,Start Size,Target Width,Target Height,Amplitude\n";

    allTrials.forEach((trial) => {
      const row = `${trial.trialId},${trial.shape},${trial.trialDirection},${trial.intDevice},${trial.startIndex},${trial.targetIndex},${trial.startSize},${trial.targetWidth},${trial.targetHeight},${trial.amplitude}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "all_trials_export.csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "all_trials_export.csv".
  }

  exportClicksToCSV() {
    const header = [
      "Counter",
      "BlockNumber",
      "TrialNumber",
      "X",
      "Y",
      "DistanceToStart",
      "DistanceToTarget",
      "StartX",
      "StartY",
      "StartClicked",
      "IsTargetClicked",
      "TargetX",
      "TargetY",
      "TargetHeightPx",
      "TargetWidthPx",
      "TrialDirection",
      "TrialId",
      "TimeIntervalMilliseconds",
      "TimeIntervalSeconds",
      "ClickDuration",
      "Timestamp",
    ];

    // Map through all clicks, but also use the index for the counter.
    const rows = this.allClicks.map((click, index) => {
      return [
        index + 1,
        click.blockNumber,
        click.trialNumber,
        click.x,
        click.y,
        click.distanceToStart,
        click.distanceToTarget,
        click.startX,
        click.startY,
        click.startClicked,
        click.isTargetClicked,
        click.targetX,
        click.targetY,
        click.targetHeightPx,
        click.targetWidthPx,
        click.trialDirection,
        click.trialId,
        click.timeIntervalMilisecond,
        click.timeIntervalSeconds,
        click.clickDuration,
        click.timeStamp,
      ].join(",");
    });

    const csvContent = [header.join(","), ...rows].join("\n");
  }
}
