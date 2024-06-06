"use strict";

class Experiment {
  constructor(numBlocks, repPerTrial) {
    this.numBlocks = numBlocks;
    this.blocks = [];
    this.repPerTrial = repPerTrial;

    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");

    this.init();
  }

  init() {
    this.setupContinueButton();

    this.generateBlocks();
    if (SCRAMBLE_BLOCKS && isDiscrete()) {
      this.shuffleBlocks();
    } else if (SCRAMBLE_BLOCKS && isReciprocal()) {
      this.shuffleReciprocalBlocks();
    }
    console.log(this.blocks);
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

  shuffleReciprocalBlocks() {
    const firstList = this.shuffleArraySmall(
      this.getBlock(1).getReciprocalTrials(),
    );

    if (this.numBlocks > 1) {
      for (let i = 2; i <= this.numBlocks; i++) {
        let currentList = this.getBlock(i).getReciprocalTrials();

        if (firstList.length !== currentList.length) {
          throw new Error(
            `Block ${i} does not have the same length as the first block.`,
          );
        }
        this.getBlock(i).setReciprocalTrials(firstList);
      }
    }
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
