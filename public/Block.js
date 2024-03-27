class Block {
  constructor(blockNumber, repTrial) {
    this.blockNumber = blockNumber;
    this.experimentType = EXPERIMENT_TYPE;
    this.startSize = START_SIZE;
    this.repetitionTrial = repTrial;
    this.targetDimens = INPUT;
    this.trialDirection = this.getAngles(RADIAN_START, RADIAN_STEP);
    this.amplitude = AMPLITUDE_LIST;
    this.blockNumber = blockNumber;

    this.trialId = 1;
    this.trials = [];
    this.generateTrials();

    this.maxScreenPercentage = MAX_DISTANCE_START_TARGET_PERCENTAGE;
  }

  has2InputParams() {
    return (
      this.targetDimens[0].amplitude === undefined &&
      this.targetDimens[0].angle === undefined
    );
  }

  addNewTrialForTarget(trialRep, trialAngle, target, amplitude) {
    let startWidth;
    let startHeight;

    if (this.experimentType === "discrete") {
      startWidth = this.startSize;
      startHeight = this.startSize;
    } else if (this.experimentType === "reciprocal") {
      startWidth = target.width;
      startHeight = target.height;
    } else {
      throw Error("[MY ERROR]: Experiment Undefined.");
    }

    const trial = new Trial(
      this.trialId++,
      trialRep,
      trialAngle,
      startWidth,
      startHeight,
      target.width,
      target.height,
      amplitude,
      this.maxScreenPercentage,
    );
    this.trials.push(trial);
  }

  init2InputParameters() {
    console.log(this.targetDimens);
    console.log(this.trialDirection);
    console.log(this.amplitude);

    for (let target of this.targetDimens) {
      for (let angle of this.trialDirection) {
        for (let amplitude of this.amplitude) {
          let temp_id = this.trialId;
          this.addNewTrialForTarget(temp_id + "", angle, target, amplitude);

          for (let i = 1; i < this.repetitionTrial; i++) {
            let temp_id = this.trialId;
            this.addNewTrialForTarget(
              temp_id + "." + i,
              angle,
              target,
              amplitude,
            );
          }
        }
      }
    }
  }

  init4InputTrials() {
    for (const element of this.targetDimens) {
      let temp_id = this.trialId;
      this.addNewTrialForTarget(
        temp_id + "",
        element.angle,
        element,
        element.amplitude,
      );

      for (let i = 1; i < this.repetitionTrial; i++) {
        let temp_id = this.trialId;
        this.addNewTrialForTarget(
          temp_id + "." + i,
          element.angle,
          element,
          element.amplitude,
        );
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

  getAngles(startAngle, stepSize) {
    const endAngle = 360;
    let angles = [];
    for (let angle = startAngle; angle < endAngle; angle += stepSize) {
      angles.push(angle);
    }
    console.log(angles);
    return angles;
  }

  setTrials(trials) {
    this.trials = trials;
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
