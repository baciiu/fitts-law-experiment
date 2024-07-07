"use strict";

class BlockDiscrete {
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
    this.initializeTrials();
  }

  initializeTrials() {
    this.generateDiscreteTrials();
  }

  has2InputParams() {
    return (
      this.targetDimens[0].amplitude === undefined &&
      this.targetDimens[0].angle === undefined
    );
  }

  addNewTrialDiscrete(id, trialRep, trialAngle, target, amplitude) {
    let startWidth;
    let startHeight;

    startWidth = this.startSize;
    startHeight = this.startSize;

    const trial = new TrialDiscrete(
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
  }

  init2InputParametersDiscrete() {
    for (let target of this.targetDimens) {
      for (let angle of this.trialDirection) {
        for (let amplitude of this.amplitude) {
          let temp_id = this.trialId;
          this.addNewTrialDiscrete(
            this.trialId++,
            temp_id + "",
            angle,
            target,
            amplitude,
          );
          for (let i = 1; i < this.repetitionTrial; i++) {
            this.addNewTrialDiscrete(
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
  }

  init4InputTrialsDiscrete() {
    for (const element of this.targetDimens) {
      let temp_id = this.trialId;
      this.addNewTrialDiscrete(
        this.trialId++,
        temp_id + "",
        element.angle,
        element,
        element.amplitude,
      );
      for (let i = 1; i < this.repetitionTrial; i++) {
        this.addNewTrialDiscrete(
          this.trialId++,
          temp_id + "." + i,
          element.angle,
          element,
          element.amplitude,
        );
      }
    }
  }

  generateDiscreteTrials() {
    if (this.has2InputParams()) {
      this.init2InputParametersDiscrete();
    } else {
      this.init4InputTrialsDiscrete();
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

  getTrials() {
    if (this.trials) return this.trials;
    return null;
  }
}
