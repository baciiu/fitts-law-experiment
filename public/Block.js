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
    this.initializeTrials();
  }

  initializeTrials() {
    if (isDiscrete()) {
      this.generateDiscreteTrials();
    } else if (isReciprocal()) {
      this.generateReciprocalTrials();
    } else {
      console.error("[MY ERROR] Experiment undefined");
    }
    //console.log(this.trials);
    //console.log(this.reciprocalTrialsList);
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
  }

  addNewTrialReciprocal(id, trialRep, trialAngle, target, amplitude) {
    let startWidth;
    let startHeight;

    startWidth = target.width;
    startHeight = target.height;

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

  init2InputParametersReciprocal() {
    this.reciprocalTrialsList = [];
    for (let target of this.targetDimens) {
      for (let angle of this.trialDirection) {
        for (let amplitude of this.amplitude) {
          let temp_id = this.trialId;
          let reciprocalGroup = new ReciprocalGroup(temp_id);
          const t = this.addNewTrialReciprocal(
            this.trialId++,
            temp_id + "",
            angle,
            target,
            amplitude,
          );
          reciprocalGroup.addTrial(t);

          for (let i = 1; i < this.repetitionTrial; i++) {
            const t = this.addNewTrialReciprocal(
              this.trialId++,
              temp_id + "." + i,
              angle,
              target,
              amplitude,
            );
            reciprocalGroup.addTrial(t);
          }
          this.reciprocalTrialsList.push(reciprocalGroup);
        }
      }
    }
  }

  init4InputTrialsReciprocal() {
    this.reciprocalTrialsList = [];
    for (const element of this.targetDimens) {
      let temp_id = this.trialId;
      let reciprocalGroup = new ReciprocalGroup(temp_id);
      const t = this.addNewTrialReciprocal(
        this.trialId++,
        temp_id + "",
        element.angle,
        element,
        element.amplitude,
      );
      reciprocalGroup.addTrial(t);
      for (let i = 1; i < this.repetitionTrial; i++) {
        const t = this.addNewTrialReciprocal(
          this.trialId++,
          temp_id + "." + i,
          element.angle,
          element,
          element.amplitude,
        );
        reciprocalGroup.addTrial(t);
      }
      this.reciprocalTrialsList.push(reciprocalGroup);
    }
  }

  generateDiscreteTrials() {
    if (this.has2InputParams()) {
      this.init2InputParametersDiscrete();
    } else {
      this.init4InputTrialsDiscrete();
    }
  }

  generateReciprocalTrials() {
    if (this.has2InputParams()) {
      this.init2InputParametersReciprocal();
    } else {
      this.init4InputTrialsReciprocal();
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

  setReciprocalList(trials) {
    this.reciprocalTrialsList = trials;
  }

  getReciprocalList() {
    if (this.reciprocalTrialsList) return this.reciprocalTrialsList;
    return null;
  }

  getReciprocalTotalTrialsNumber() {
    let totalTrials = 0;
    for (let i = 0; i < this.reciprocalTrialsList.length; i++) {
      totalTrials += this.reciprocalTrialsList[i].getTrialsGroup().length;
    }
    return totalTrials;
  }
}
