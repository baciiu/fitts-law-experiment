class ReciprocalGroup {
  trialGroup = [];
  trialRep = "";

  constructor(trialRep) {
    this.trialGroup = [];
    this.trialRep = trialRep;
  }

  getTrialsGroup() {
    return this.trialGroup;
  }

  getTrialsGroupSize() {
    return this.trialGroup.length;
  }

  setReciprocalTrial(trialsGroup) {
    this.trialGroup = trialsGroup;
  }

  addTrial(trial) {
    this.trialGroup.push(trial);
  }

  getTrialRep() {
    return this.trialRep;
  }
}
