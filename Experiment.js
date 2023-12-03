class Experiment {
  constructor(experimentType, shape, intDevice, numBlocks) {
    this.experimentType = experimentType;
    this.shape = shape;
    this.intDevice = intDevice;
    this.numBlocks = numBlocks;
    this.blocks = [];

    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.setupContinueButton();

    for (let i = 1; i < this.numBlocks; i++) {
      this.blocks.push(
        new Block(i, this.experimentType, this.shape, this.intDevice),
      );
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

  hasNext(blockNumber) {
    return this.numBlocks - blockNumber > 0;
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
}
