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
          let temp_id = this.trialId;
          const trial = new Trial(
            this.trialId++,
            temp_id + "",
            this.trialDirection[directionIdx],
            this.intDevice,
            this.startSize,
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
  }

  init4InputTrials() {
    this.amplitude = this.getAmplitudes();
    for (let dimenIdx = 0; dimenIdx < this.targetDimens.length; dimenIdx++) {
      for (let amplIdx = 0; amplIdx < this.amplitude.length; amplIdx++) {
        let temp_id = this.trialId;
        const trial = new Trial(
          this.trialId++,
          temp_id + "",
          this.targetDimens[dimenIdx].angle,
          this.intDevice,
          this.startSize,
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
    let next = trialIndex++;
    return next < this.getTrialsNumber() - 1;
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
