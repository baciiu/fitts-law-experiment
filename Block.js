class Block {
  constructor(blockNumber, experimentType, shape, intDevice) {
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;
    this.startSize = 10;
    this.shape = shape;
    this.targetDimens = [
      //{ width: 4, height: 4 },
      //{ width: 8, height: 8 },
      //{ width: 10, height: 15 },
      //{ width: 20, height: 10 },
      //{ width: 25, height: 10 },
      { width: 40, height: 20 },
    ];

    this.amplitude = [54, 100];
    this.trialDirection = this.getAngles(45);
    //
    this.intDevice = intDevice;
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;

    this.trialId = 1;

    this.trialsNum =
      this.targetDimens.length *
      this.trialDirection.length *
      this.amplitude.length;

    this.maxScreenPercentage = 30;
    this.previousTrialEnd = null;

    this.usedIndices = [];
    this.rectIndices = [];

    for (let i = 0; i < this.targetDimens.length; i++) {
      this.rectIndices.push(i);
    }

    this.trials = [];
    let trialId = 1;

    // Nested loops to generate the trials
    for (let dimenIdx = 0; dimenIdx < this.targetDimens.length; dimenIdx++) {
      // loop to go through Amplitude
      for (
        let directionIdx = 0;
        directionIdx < this.trialDirection.length;
        directionIdx++
      ) {
        for (
          let amplIndex = 0;
          amplIndex < this.amplitude.length;
          amplIndex++
        ) {
          this.trials.push(
            new Trial(
              trialId++,
              this.trialDirection[directionIdx],
              this.intDevice,
              this.startSize,
              this.targetDimens[dimenIdx].width,
              this.targetDimens[dimenIdx].height,
              this.amplitude[amplIndex],
              this.maxScreenPercentage,
            ),
          );
        }
      }
    }
    // Shuffle the trials array randomly
    this.shuffleArray(this.trials);
  }

  generateDiagonalPositions(trial) {
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let maxDistanceWidth = (this.maxScreenPercentage * canvasWidth) / 100;
    let maxDistanceHeight = (this.maxScreenPercentage * canvasHeight) / 100;
    let amplitude = mmToPixels(this.amplitude);
    let width1 = mmToPixels(this.startSize);
    let height1 = mmToPixels(this.startSize);
    let width2 = mmToPixels(trial.targetWidth);
    let height2 = mmToPixels(trial.targetHeight);
    console.log("width target" + trial.targetWidth);
    let topMargin = mmToPixels(5);
    let otherMargins = mmToPixels(3);
    let start, target, x1, y1, x2, y2;

    do {
      x1 =
        Math.random() * (canvasWidth - width1 - 2 * otherMargins) +
        width1 / 2 +
        otherMargins;
      y1 =
        Math.random() * (canvasHeight - height1 - topMargin - otherMargins) +
        height1 / 2 +
        topMargin;

      let angle = this.trialDirection;
      // Calculate the center of the second rectangle
      x2 = x1 + amplitude * Math.cos((angle * Math.PI) / 180);
      y2 = y1 + amplitude * Math.sin((angle * Math.PI) / 180);

      // Check if the distance is correct and the second rectangle is within bounds
      if (
        this.getDistance(x1, y1, x2, y2) === amplitude &&
        x2 - width2 / 2 > otherMargins &&
        x2 + width2 / 2 < canvasWidth - otherMargins &&
        y2 - height2 / 2 > topMargin &&
        y2 + height2 / 2 < canvasHeight - otherMargins
      ) {
        start = { x: x1 - width1 / 2, y: y1 - height1 / 2 };
        target = { x: x2 - width2 / 2, y: y2 - height2 / 2 };
        return { start, target };
      }
      // If previousEnd is not null, check the distance constraint
      if (
        this.previousTrialEnd &&
        (Math.abs(this.start.x - this.previousTrialEnd.x) > maxDistanceWidth ||
          Math.abs(this.start.y - this.previousTrialEnd.y) > maxDistanceHeight)
      ) {
        continue; // Skip this iteration and generate new positions
      }
    } while (!start || !target); // Repeat if a valid position was not found

    return { start, target };
  }

  getAngles(stepSize) {
    const startAngle = 0;
    const endAngle = 360;
    let angles = [];
    for (let angle = startAngle; angle < endAngle; angle += stepSize) {
      angles.push(angle);
    }
    return angles;
  }

  // return trial
  getTrial(trialNumber) {
    return this.trials[trialNumber - 1];
  }

  hasNextTrial(trialNumber) {
    return this.trialsNum > trialNumber;
  }

  getTrialsNumber() {
    return this.trials.length;
  }

  // Shuffling function using Fisher-Yates algorithm
  shuffleArray(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle
    while (currentIndex !== 0) {
      // Pick a remaining element
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap it with the current element
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
}
