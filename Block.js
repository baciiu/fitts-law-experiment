class Block {
  constructor(blockNumber, experimentType, shape, intDevice, repTrial) {
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;
    this.startSize = 10;
    this.shape = shape;
    this.repetitionTrial = repTrial;
    this.targetDimens = [
      //{ width: 4, height: 4 },
      //{ width: 8, height: 8 },
      //{ width: 10, height: 15 },
      { width: 20, height: 10 },
      { width: 25, height: 10 },
      { width: 40, height: 20 },
    ];

    this.amplitude = [100];
    this.trialDirection = this.getAngles(180);
    this.intDevice = intDevice;
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;

    this.trialId = 1;
    this.trials = [];

    this.generateTrials();
    this.trialsNum = this.trials.length;

    this.maxScreenPercentage = 30;
  }

  generateTrials() {
    for (let dimenIdx = 0; dimenIdx < this.targetDimens.length; dimenIdx++) {
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
          for (let i = 0; i < this.repetitionTrial; i++) {
            this.trials.push(
              new Trial(
                this.trialId++,
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
    }
    // Shuffle the trials array randomly
    //this.shuffleArray(this.trials);
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

  getTrial(trialNumber) {
    return this.trials[trialNumber - 1];
  }

  hasNextTrial(trialNumber) {
    return this.trialsNum > trialNumber;
  }

  getTrialsNumber() {
    return this.trials.length;
  }

  getTrials() {
    return this.trials;
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
