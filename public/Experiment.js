"use strict";

class Experiment {
  constructor(numBlocks, repPerTrial, scramble) {
    this.numBlocks = numBlocks;
    this.blocks = [];
    this.repPerTrial = repPerTrial;
    this.scrambleBlocks = scramble;

    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");

    this.init();
  }

  init() {
    this.setupContinueButton();
    this.generateBlocks();
    if (this.scrambleBlocks && EXPERIMENT_TYPE === "discrete") {
      this.shuffleBlocks();
    } else if (this.scrambleBlocks && EXPERIMENT_TYPE === "reciprocal") {
      this.shuffleBlocksReciprocal();
    }
    //console.log(this.blocks);
  }

  generateBlocks() {
    for (let i = 1; i <= this.numBlocks; i++) {
      this.blocks.push(new Block(i, this.repPerTrial));
    }
  }

  shuffleBlocks() {
    let trial_pattern = this.getBlock(1).getTrials();
    trial_pattern = this.shuffleArraySmall(trial_pattern);

    if (this.numBlocks > 1) {
      const orderMap = new Map(
        trial_pattern.map((item, index) => [item.trialId, index]),
      );

      for (let i = 2; i <= this.numBlocks; i++) {
        let trials = this.getBlock(i).getTrials();
        let shuffled_trial = this.getOrderDiscrete(trials, orderMap);
        this.getBlock(i).setTrials(shuffled_trial);
      }
    }
  }

  getOrderDiscrete(arr, orderMap) {
    return arr
      .slice()
      .sort((a, b) => orderMap.get(a.trialId) - orderMap.get(b.trialId));
  }

  shuffleBlocksReciprocal() {
    let orderMap = this.getRepArray();

    orderMap = this.shuffleArraySmall([...orderMap]);

    for (let i = 2; i <= this.numBlocks; i++) {
      let trials = this.getBlock(i).getTrials();
      let shuffled_trial = this.rearrangeTrials(trials, orderMap);
      this.getBlock(i).setTrials(shuffled_trial);
    }
  }

  getRepArray() {
    let arr = [];

    if (REPETITION_PER_TRIAL === 0) {
      console.error("[MY ERROR] Division by zero");
    }
    const numberOfTrials = Math.floor(
      this.getBlock(1).getTrials().length / REPETITION_PER_TRIAL,
    );

    for (let i = 0; i < numberOfTrials; i++) {
      if (i === 0) {
        arr[0] = 1;
      } else {
        arr[i] = arr[i - 1] + REPETITION_PER_TRIAL;
      }
    }
    //console.log(arr);
    return arr;
  }

  rearrangeTrials(trials, pattern) {
    // Create a map to group trials by their main trialRep number
    let trialMap = new Map();

    trials.forEach((trial) => {
      let mainRep = trial.trialRep.split(".")[0];
      if (!trialMap.has(mainRep)) {
        trialMap.set(mainRep, []);
      }
      trialMap.get(mainRep).push(trial);
    });

    // Sort each group of trials with the same main trialRep number
    trialMap.forEach((value, key) => {
      value.sort((a, b) => {
        let aSubRep = a.trialRep.split(".")[1] || 0;
        let bSubRep = b.trialRep.split(".")[1] || 0;
        return aSubRep - bSubRep;
      });
    });

    let rearrangedTrials = [];
    pattern.forEach((rep) => {
      if (trialMap.has(rep.toString())) {
        rearrangedTrials.push(...trialMap.get(rep.toString()));
      }
    });
    // console.log(rearrangedTrials);

    return rearrangedTrials;
  }

  setupContinueButton() {
    this.continueButton.addEventListener("click", () => {
      this.breakWindow.style.display = "none";
      document.body.style.pointerEvents = "auto";
    });
  }

  getNumBlocks() {
    return this.blocks.length;
  }

  getBlock(blockNumber) {
    if (blockNumber >= 1 && blockNumber <= this.numBlocks) {
      return this.blocks[blockNumber - 1];
    }
  }

  hasNextBlock(blockNumber) {
    return this.numBlocks > blockNumber;
  }

  getRandomNonRepeat() {
    this.rectIndices = [];
    this.usedIndices = [];

    for (let i = 0; i < this.numBlocks; i++) {
      this.rectIndices.push(i);
    }
    const availableIndices = this.rectIndices.filter(
      (index) => !this.usedIndices.includes(index),
    );
    const rand = Math.random();
    const randomIndex =
      availableIndices[Math.floor(rand * availableIndices.length)];
    this.usedIndices.push(randomIndex);
    return randomIndex;
  }

  shuffleArraySmall(array) {
    // Fisher-Yates algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
