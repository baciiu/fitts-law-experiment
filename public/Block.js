class Block {
  constructor(blockNumber, experimentType, intDevice, repTrial) {
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;
    this.startSize = 10;
    this.repetitionTrial = repTrial;
    this.targetDimens = getInput();

    this.radianStep = 90; // => [0,90,180,270]; 180 => [0,180] /  Left and Right
    this.amplitude = [100, 54];
    this.trialDirection = [];
    this.intDevice = intDevice;
    this.blockNumber = blockNumber;
    this.experimentType = experimentType;

    this.startSize = 10;

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
    return Array.from(amp);
  }

  init2InputParameters() {
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
          let startWidth, startHeight;

          if (this.experimentType === "discrete") {
            startWidth = this.startSize;
            startHeight = this.startSize;
          } else if (this.experimentType === "reciprocal") {
            startWidth = this.targetDimens[dimenIdx].width;
            startHeight = this.targetDimens[dimenIdx].height;
          } else {
            throw Error("[MY ERROR]: Experiment Undefined.");
          }

          let temp_id = this.trialId;
          const trial = new Trial(
            this.trialId++,
            temp_id + "",
            this.trialDirection[directionIdx],
            this.experimentType,
            this.intDevice,
            startWidth,
            startHeight,
            this.targetDimens[dimenIdx].width,
            this.targetDimens[dimenIdx].height,
            this.amplitude[amplIndex],
            this.maxScreenPercentage,
          );
          this.trials.push(trial);

          for (let i = 1; i < this.repetitionTrial; i++) {
            const trial = new Trial(
              this.trialId++,
              temp_id + "." + i,
              this.trialDirection[directionIdx],
              this.experimentType,
              this.intDevice,
              startWidth,
              startHeight,
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
  }

  init4InputTrials() {
    this.amplitude = this.getAmplitudes();
    for (let dimenIdx = 0; dimenIdx < this.targetDimens.length; dimenIdx++) {
      for (let amplIdx = 0; amplIdx < this.amplitude.length; amplIdx++) {
        let startWidth, startHeight;
        if (this.experimentType === "discrete") {
          startWidth = this.startSize;
          startHeight = this.startSize;
        } else if (this.experimentType === "reciprocal") {
          startWidth = this.targetDimens[dimenIdx].width;
          startHeight = this.targetDimens[dimenIdx].height;
        } else {
          throw Error("[MY ERROR]: Experiment Undefined.");
        }

        let temp_id = this.trialId;
        const trial = new Trial(
          this.trialId++,
          temp_id + "",
          this.targetDimens[dimenIdx].angle,
          this.experimentType,
          this.intDevice,
          startWidth,
          startHeight,
          this.targetDimens[dimenIdx].width,
          this.targetDimens[dimenIdx].height,
          this.amplitude[amplIdx],
          this.maxScreenPercentage,
        );
        this.trials.push(trial);

        for (let i = 1; i < this.repetitionTrial; i++) {
          const trial = new Trial(
            this.trialId++,
            temp_id + "." + i,
            this.targetDimens[dimenIdx].angle,
            this.experimentType,
            this.intDevice,
            startWidth,
            startHeight,
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

  generateTrials() {
    if (this.has2InputParams()) {
      // Target Dimensions x Angles x Amplitudes x Repetitions ( x Blocks )
      this.init2InputParameters();
    } else {
      // Target Dimensions x Amplitudes x Repetitions ( x Blocks )
      this.init4InputTrials();
    }
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

  getTrial(trialIndex) {
    return this.getTrials()[trialIndex];
  }

  setTrials(trials) {
    this.trials = trials;
  }

  hasNextTrial(trialIndex) {
    if (this.trials.find(() => this.trials[trialIndex])) {
      return true;
    } else {
      return false;
    }
  }

  getTrialsNumber() {
    if (this.getTrials() !== null) {
      return this.trials.length;
    }
    return 0;
  }

  getTrials() {
    if (this.trials) return this.trials;
    return null;
  }
}
