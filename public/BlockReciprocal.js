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
    this.constellationMap = new Map();
    this.initializeTrials();
  }

  initializeTrials() {
    this.generateReciprocalTrials();
    console.log("**********    TRIALS  **********");
    console.log(this.trials);
    console.log("******    CONSTELLATIONS  ******");
    console.log(Array.from(this.constellationMap));
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

  getRepetitionsFor2Input(target, angle, amplitude) {
    let temp_id = this.trialId;

    for (let repIndex = 0; repIndex <= this.repetitionTrial; repIndex++) {
      let reciprocalGroup = new ReciprocalGroup(temp_id);
      for (let travelIndex = 0; travelIndex <= TRAVELS_NUMBER; travelIndex++) {
        let trialRep = temp_id + "." + repIndex + "." + travelIndex;

        const trial = this.getInitializedTrial(
          trialRep,
          travelIndex,
          angle,
          target,
          amplitude,
        );

        reciprocalGroup.addTrial(trial);
      }
      this.reciprocalTrialsList.push(reciprocalGroup);
    }
  }

  getInitializedTrial(trialRep, travelIndex, angle, target, amplitude) {
    const t = this.addNewTrialReciprocal(
      this.trialId++,
      trialRep,
      travelIndex,
      angle,
      target,
      amplitude,
    );
    const constellationTemp = getConstellationForReciprocal(
      target,
      angle,
      amplitude,
      travelIndex,
    );
    assignConstellationToTrial(t, this.constellationMap, constellationTemp);
    return t;
  }

  init2InputParametersReciprocal() {
    this.reciprocalTrialsList = [];
    for (let target of this.targetDimens) {
      for (let angle of this.trialDirection) {
        for (let amplitude of this.amplitude) {
          this.getRepetitionsFor2Input(target, angle, amplitude);
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
          const trial = this.addNewTrialReciprocal(
            this.trialId++,
            trialRep,
            travelIndex,
            element.angle,
            element,
            element.amplitude,
          );
          const constellationTemp = getConstellationForReciprocal(
            element,
            element.angle,
            element.amplitude,
            travelIndex,
          );
          assignConstellationToTrial(
            trial,
            this.constellationMap,
            constellationTemp,
          );
          reciprocalGroup.addTrial(trial);
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
