"use strict";

class BlockReciprocal {
  constructor(blockNumber, repTrial) {
    this.blockNumber = blockNumber;
    this.experimentType = EXPERIMENT_TYPE;
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
    this.generateReciprocalTrials();
  }

  has2InputParams() {
    return (
      this.targetDimens[0].amplitude === undefined &&
      this.targetDimens[0].angle === undefined
    );
  }

  addNewTrialReciprocal(
    id,
    trialRep,
    currentTravel,
    trialAngle,
    target,
    amplitude,
  ) {
    const trial = new TrialReciprocal(
      id,
      trialRep,
      currentTravel,
      trialAngle,
      new Rectangle(target.width, target.height),
      new Rectangle(target.width, target.height),
      amplitude,
    );

    this.trials.push(trial);
    return trial;
  }

  init2InputParametersReciprocal() {
    this.reciprocalTrialsList = [];
    for (let target of this.targetDimens) {
      for (let angle of this.trialDirection) {
        for (let amplitude of this.amplitude) {
          let temp_id = this.trialId;
          for (let repIndex = 0; repIndex <= this.repetitionTrial; repIndex++) {
            let reciprocalGroup = new ReciprocalGroup(temp_id);
            for (
              let travelIndex = 0;
              travelIndex <= TRAVELS_NUMBER;
              travelIndex++
            ) {
              let trialRep = temp_id + "." + repIndex + "." + travelIndex;

              const t = this.addNewTrialReciprocal(
                this.trialId++,
                trialRep,
                travelIndex,
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
  }

  init4InputTrialsReciprocal() {
    this.reciprocalTrialsList = [];
    for (const element of this.targetDimens) {
      let temp_id = this.trialId;
      for (let repIndex = 0; repIndex <= this.repetitionTrial; repIndex++) {
        let reciprocalGroup = new ReciprocalGroup(temp_id);
        for (
          let travelIndex = 0;
          travelIndex <= TRAVELS_NUMBER;
          travelIndex++
        ) {
          let trialRep = temp_id + "." + repIndex + "." + travelIndex;
          const t = this.addNewTrialReciprocal(
            this.trialId++,
            trialRep,
            travelIndex,
            element.angle,
            element,
            element.amplitude,
          );
          reciprocalGroup.addTrial(t);
        }
        this.reciprocalTrialsList.push(reciprocalGroup);
      }
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
