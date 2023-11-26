class Experiment {
  constructor() {
    this.experimentType = "STS"; //
    this.shape = "rectangle"; // rectangle or circle
    this.intDevice = "Mouse"; //"Mouse" , "Touch"  , "Laser Pointer"
    this.startSize = 10;
    this.rectSize = this.startSize; // set the size of the other reectangles
    this.blocks = [];
    this.numBlocks = 2;
    this.directionCount = 8;
    let block = 1;

    this.breakWindow = document.getElementById("breakWindow");
    this.continueButton = document.getElementById("continueButton");
    this.setupContinueButton();

    for (let i = 0; i < this.numBlocks; i++) {
      this.blocks.push(
        new Block(
          i,
          this.experimentType,
          this.shape,
          this.intDevice,
          this.rectSize,
          this.startSize,
          this.directionCount,
        ),
      );
      block++;
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
