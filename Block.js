class Block {
  constructor(blockNumber, experimentType, shape, intDevice) {
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;
    this.startSize = 10;
    this.shape = shape;
    this.targetDimens = [
      //{ width: 4, height: 4 },
      { width: 8, height: 8 },
      { width: 10, height: 15 },
      { width: 20, height: 10 },
      { width: 25, height: 10 },
      { width: 40, height: 20 },
    ];

    this.amplitude = [54, 110];
    //this.trialDirection = ["Right", "Left", "Up", "Down"];
    this.trialDirection = [0, 1, 2, 3];
    this.intDevice = intDevice;
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;

    this.trialId = 1;

    this.trialsNum =
      this.targetDimens.length *
      this.trialDirection.length *
      this.amplitude.length;

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
        // loop to go through interaction direction

        // Check and assign startIndex, and targetIndex for each direction

        if (this.trialDirection[directionIdx] == 0) {
          this.startIndex = 0;
          this.targetIndex = 4;
        }
        if (this.trialDirection[directionIdx] == 1) {
          this.startIndex = 4;
          this.targetIndex = 0;
        }
        if (this.trialDirection[directionIdx] == 2) {
          this.startIndex = 2;
          this.targetIndex = 6;
        }
        if (this.trialDirection[directionIdx] == 3) {
          this.startIndex = 6;
          this.targetIndex = 2;
        }

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
              this.startIndex,
              this.targetIndex,
              this.startSize,
              this.targetDimens[dimenIdx].width,
              this.targetDimens[dimenIdx].height,
              this.amplitude[amplIndex],
            ),
          );
        }
      }
    }
    // Shuffle the trials array randomly
    this.shuffleArray(this.trials);
  }

  // return trial
  getTrial(trialNumber) {
    return this.trials[trialNumber - 1];
  }

  hasNext(trialNumber) {
    return this.trialsNum - trialNumber > 0;
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
