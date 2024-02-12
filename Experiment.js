class Experiment {
  constructor(experimentType, shape, intDevice, numBlocks, repPerTrial) {
    this.experimentType = experimentType;
    this.shape = shape;
    this.intDevice = intDevice;
    this.numBlocks = numBlocks;
    this.blocks = [];
    this.repPerTrial = repPerTrial;

    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.setupContinueButton();

    this.generateBlocks();
    this.shuffleBlocks();
  }

  generateBlocks() {
    for (let i = 1; i <= this.numBlocks; i++) {
      this.blocks.push(
        new Block(
          i,
          this.experimentType,
          this.shape,
          this.intDevice,
          this.repPerTrial,
        ),
      );
    }
  }

  shuffleBlocks() {
    let trial_pattern = this.getBlock(1).getTrials();
    this.shuffleArray(trial_pattern);

    if (this.numBlocks > 1) {
      const orderMap = new Map(
        trial_pattern.map((item, index) => [item.trialId, index]),
      );

      const reorder = (arr, orderMap) => {
        arr
          .slice()
          .sort((a, b) => orderMap.get(a.trialId) - orderMap.get(b.trialId));
        return arr;
      };

      for (let i = 2; i <= this.numBlocks; i++) {
        let trial = this.getBlock(i).getTrials();
        let shuffled_trial = reorder(trial, orderMap);
        this.getBlock(i).setTrials(shuffled_trial);
      }
    }
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
    const randomIndex =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];
    this.usedIndices.push(randomIndex);
    return randomIndex;
  }

  shuffleArray(array) {
    // Fisher-Yates algorithm
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  }
}
