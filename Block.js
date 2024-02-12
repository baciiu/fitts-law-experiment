class Block {
  constructor(blockNumber, experimentType, shape, intDevice, repTrial) {
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;
    this.startSize = 10;
    this.shape = shape;
    this.repetitionTrial = repTrial;
    this.targetDimens = [
      //{ width: 20, height: 10, angle: 0, amplitude: 100 },
      //{ width: 25, height: 10, angle: 100, amplitude: 100 },
      //{ width: 40, height: 20, angle: 10, amplitude: 100 },
      //{ width: 20, height: 30, angle: 100, amplitude: 145 },
      { width: 20, height: 10 },
      { width: 25, height: 10 },
      { width: 40, height: 20 },
    ];

    this.radianStep = 180; // => [0,180] /  Left and Right
    this.amplitude = [100];
    this.trialDirection = [];
    this.intDevice = intDevice;
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;

    this.trialId = 1;
    this.trials = [];
    this.generateTrials();

    this.maxScreenPercentage = 30;
  }

  has2InputParams() {
    return (
      this.targetDimens[0].amplitude === undefined &&
      this.targetDimens[0].angle === undefined
    );
  }

  getAmplitudes() {
    const amp = new Set();

    for (const a of this.targetDimens) {
      amp.add(a.amplitude);
    }
    console.log(amp);
    return Array.from(amp);
  }

  generateTrials() {
    // Target Dimensions x Angles x Amplitudes x Repetitions ( x Blocks )
    if (this.has2InputParams()) {
      this.trialDirection = this.getAngles(this.radianStep);
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
              const trial = new Trial(
                this.trialId++,
                this.trialDirection[directionIdx],
                this.intDevice,
                this.startSize,
                this.targetDimens[dimenIdx].width,
                this.targetDimens[dimenIdx].height,
                this.amplitude[amplIndex],
                this.maxScreenPercentage,
              );
              this.trials.push(trial);
            }
          }
        }
      }
    } else {
      // Target Dimensions x Amplitudes x Repetitions ( x Blocks )
      this.amplitude = this.getAmplitudes();
      for (let dimenIdx = 0; dimenIdx < this.targetDimens.length; dimenIdx++) {
        for (let amplIdx = 0; amplIdx < this.amplitude.length; amplIdx++) {
          for (let i = 0; i < this.repetitionTrial; i++) {
            const trial = new Trial(
              this.trialId++,
              this.targetDimens[dimenIdx].angle,
              this.intDevice,
              this.startSize,
              this.targetDimens[dimenIdx].width,
              this.targetDimens[dimenIdx].height,
              this.amplitude[amplIdx],
              this.maxScreenPercentage,
            );
            this.trials.push(trial);
          }
        }
      }
    }
    console.log(this.trials);
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
    return this.getTrialsNumber() > trialNumber;
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
