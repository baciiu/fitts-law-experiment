"use strict";

class Experiment {
  constructor() {
    this.numBlocks = BLOCKS_NUMBER;
    this.blocks = [];
    this.repPerTrial = REPETITION_PER_TRIAL;

    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");

    this.init();
  }

  init() {
    this.setupContinueButton();
    if (isDiscrete()) {
      this.initDiscreteBlocks();
    } else {
      this.initReciprocalBlocks();
    }
  }

  initDiscreteBlocks() {
    this.generateBlocks();
    if (SCRAMBLE_BLOCKS) {
      this.shuffleBlocks();
    }
  }

  initReciprocalBlocks() {
    this.generateBlocksReciprocal();
    if (SCRAMBLE_BLOCKS) {
      this.shuffleBlocksReciprocal();
    }
  }

  generateBlocks() {
    for (let i = 1; i <= this.numBlocks; i++) {
      this.blocks.push(new BlockDiscrete(i, this.repPerTrial));
    }
  }

  generateBlocksReciprocal() {
    for (let i = 1; i <= this.numBlocks; i++) {
      this.blocks.push(new BlockReciprocal(i, this.repPerTrial));
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

  shuffleBlocksReciprocal() {
    const firstList = this.shuffleArraySmall(
      this.getBlock(1).getReciprocalList(),
    );

    if (this.numBlocks > 1) {
      for (let i = 2; i <= this.numBlocks; i++) {
        const currentList = this.getBlock(i).getReciprocalList();

        if (firstList.length !== currentList.length) {
          throw new Error(
            `[MY ERROR] Block ${i} does not have the same length as the first block.`,
          );
        }
        const copyOfFirstList = this.getCopyOfReciprocalList(firstList);
        this.getBlock(i).setReciprocalList(copyOfFirstList);
      }
    }
  }

  getCopyOfReciprocalList(list) {
    const newList = [];

    for (const element of list) {
      const reciprocalTrial = new ReciprocalGroup(element.getTrialRep());
      const trials = element.getTrialsGroup();
      const trialCopies = [];

      for (const trial of trials) {
        const newTrial = new TrialReciprocal(
          trial.trialId,
          trial.trialRep,
          trial.currentTravel,
          trial.trialDirection,
          new Rectangle(trial.startWidth, trial.startHeight),
          new Rectangle(trial.targetWidth, trial.startHeight),
          trial.amplitude,
        );
        trialCopies.push(newTrial);
      }
      reciprocalTrial.setReciprocalTrial(trialCopies);
      newList.push(reciprocalTrial);
    }
    return newList;
  }

  getOrderDiscrete(arr, orderMap) {
    return arr
      .slice()
      .sort((a, b) => orderMap.get(a.trialId) - orderMap.get(b.trialId));
  }

  setupContinueButton() {
    this.continueButton.addEventListener("click", () => {
      this.breakWindow.style.display = "none";
      document.body.style.pointerEvents = "auto";
    });
  }

  getBlock(blockNumber) {
    if (blockNumber >= 1 && blockNumber <= this.numBlocks) {
      return this.blocks[blockNumber - 1];
    }
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
