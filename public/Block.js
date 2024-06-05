"use strict";

class Block {
  constructor(blockNumber, repTrial) {
    this.blockNumber = blockNumber;
    this.experimentType = EXPERIMENT_TYPE;
    this.startSize = START_SIZE;
    this.repetitionTrial = repTrial;
    this.targetDimens = INPUT;
    this.trialDirection = DIRECTION_LIST;
    this.amplitude = AMPLITUDE_LIST;
    this.blockNumber = blockNumber;

    this.trialId = 1;
    this.trials = [];
    this.reciprocalTrialsList = [];
    this.generateTrials();

    this.maxScreenPercentage = MAX_SCREEN_DISTANCE;
  }

  has2InputParams() {
    return (
      this.targetDimens[0].amplitude === undefined &&
      this.targetDimens[0].angle === undefined
    );
  }

  addNewTrialForTargetAndReturnTrial(
    id,
    trialRep,
    trialAngle,
    target,
    amplitude,
  ) {
    let startWidth;
    let startHeight;

    if (isDiscrete()) {
      startWidth = this.startSize;
      startHeight = this.startSize;
    } else if (isReciprocal()) {
      startWidth = target.width;
      startHeight = target.height;
    } else {
      throw Error("[MY ERROR]: Experiment Undefined.");
    }

    const trial = new Trial(
      id,
      trialRep,
      trialAngle,
      startWidth,
      startHeight,
      target.width,
      target.height,
      amplitude,
    );
    this.trials.push(trial);
    return trial;
  }

  init2InputParameters() {
    console.log(this.targetDimens);
    console.log(this.trialDirection);
    console.log(this.amplitude);

    for (let target of this.targetDimens) {
      for (let angle of this.trialDirection) {
        for (let amplitude of this.amplitude) {
          let temp_id = this.trialId;
          let reciprocalTrial = new ReciprocalTrial(temp_id);
          this.addNewTrialForTargetAndReturnTrial(
            this.trialId++,
            temp_id + "",
            angle,
            target,
            amplitude,
          );

          for (let i = 1; i < this.repetitionTrial; i++) {
            this.addNewTrialForTargetAndReturnTrial(
              this.trialId++,
              temp_id + "." + i,
              angle,
              target,
              amplitude,
            );
          }
        }
      }
    }
    //console.log(this.trials);
  }

  init4InputTrials() {
    for (const element of this.targetDimens) {
      let temp_id = this.trialId;
      let reciprocalTrial = new ReciprocalTrial(temp_id);
      this.addNewTrialForTargetAndReturnTrial(
        this.trialId++,
        temp_id + "",
        element.angle,
        element,
        element.amplitude,
      );
      for (let i = 1; i < this.repetitionTrial; i++) {
        this.addNewTrialForTargetAndReturnTrial(
          this.trialId++,
          temp_id + "." + i,
          element.angle,
          element,
          element.amplitude,
        );
      }
    }
  }

  init2InputParametersReciprocal() {
    console.log(this.targetDimens);
    console.log(this.trialDirection);
    console.log(this.amplitude);

    this.reciprocalTrialsList = [];
    for (let target of this.targetDimens) {
      for (let angle of this.trialDirection) {
        for (let amplitude of this.amplitude) {
          let temp_id = this.trialId;
          let reciprocalTrial = new ReciprocalTrial(temp_id);
          const t = this.addNewTrialForTargetAndReturnTrial(
            this.trialId++,
            temp_id + "",
            angle,
            target,
            amplitude,
          );

          reciprocalTrial.addTrial(t);

          for (let i = 1; i < this.repetitionTrial; i++) {
            const t = this.addNewTrialForTargetAndReturnTrial(
              this.trialId++,
              temp_id + "." + i,
              angle,
              target,
              amplitude,
            );
            reciprocalTrial.addTrial(t);
          }
          this.reciprocalTrialsList.push(reciprocalTrial);
        }
      }
    }
    //console.log(this.trials);
    //console.log(this.reciprocalTrialsList);
  }

  init4InputTrialsReciprocal() {
    this.reciprocalTrialsList = [];
    for (const element of this.targetDimens) {
      let temp_id = this.trialId;
      let reciprocalTrial = new ReciprocalTrial(temp_id);
      const t = this.addNewTrialForTargetAndReturnTrial(
        this.trialId++,
        temp_id + "",
        element.angle,
        element,
        element.amplitude,
      );
      reciprocalTrial.addTrial(t);
      for (let i = 1; i < this.repetitionTrial; i++) {
        const t = this.addNewTrialForTargetAndReturnTrial(
          this.trialId++,
          temp_id + "." + i,
          element.angle,
          element,
          element.amplitude,
        );
        reciprocalTrial.addTrial(t);
      }
      this.reciprocalTrialsList.push(reciprocalTrial);
    }
  }

  generateTrials() {
    if (isDiscrete()) {
      if (this.has2InputParams()) {
        // Target Dimensions x Angles x Amplitudes x Repetitions ( x Blocks )
        this.init2InputParameters();
      } else {
        // Target Dimensions x Amplitudes x Repetitions ( x Blocks )
        this.init4InputTrials();
      }
    } else if (isReciprocal()) {
      if (this.has2InputParams) {
        // Target Dimensions x Angles x Amplitudes x Repetitions ( x Blocks )
        this.init2InputParametersReciprocal();
      } else {
        // Target Dimensions x Amplitudes x Repetitions ( x Blocks )
        this.init4InputTrialsReciprocal();
      }
    } else {
      throw Error("[MY ERROR]: Experiment Undefined.");
    }
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

  getReciprocalTrialsNumber() {
    if (this.getReciprocalTrials() !== null) {
      return this.reciprocalTrialsList.length;
    }
    return 0;
  }

  getTrials() {
    if (this.trials) return this.trials;
    return null;
  }

  setReciprocalTrials(trials) {
    this.reciprocalTrialsList = trials;
  }

  getReciprocalTrials() {
    if (this.reciprocalTrialsList) return this.reciprocalTrialsList;
    return null;
  }
}
