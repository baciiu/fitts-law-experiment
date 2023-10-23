class ExperimentFrame {
	constructor() {
		this.blockNumber = 1;
		this.trialNumber = 1;
		this.experiment = new Experiment();
		this.totalBlocks = this.experiment.getNumBlocks();
		this.trialsPerBreak = 5;
		this.breakWindow = document.getElementById("breakWindow");
		this.continueButton = document.getElementById("continueButton");
		this.setupContinueButton();
	}

	setupContinueButton() {
		this.continueButton.addEventListener("click", () => {
			this.breakWindow.style.display = "none";
			document.body.style.pointerEvents = "auto";
		});
	}

	showTrial() {
		if (!this.printedFirstBlock) {
			this.printedFirstBlock = true;
			this.printAllTrials(); // Assuming it's necessary to print them once.
		}

		const trial = this.experiment.getBlock(this.blockNumber).getTrial(this.trialNumber);
		const STRectDrawing = new STRectsDrawing(trial, this.trialNumber, this.experiment.rectSize, this.experiment.numRects, () => {
			this.trialCompleted();
		});

		STRectDrawing.showRects();
		this.updateIndexes();

		if (this.trialNumber % this.trialsPerBreak === 0) {
			this.displayBreakWindow();
		}
	}

	displayBreakWindow() {
		this.breakWindow.style.display = "block";
		document.body.style.pointerEvents = "none";
	}

	trialCompleted() {
		const currentBlock = this.experiment.getBlock(this.blockNumber);

		if (!currentBlock) {
			console.error("Invalid block number:", this.blockNumber);
			return;
		}

		if (currentBlock.hasNext(this.trialNumber)) {
			this.trialNumber++;
		} else if (this.experiment.hasNext(this.blockNumber)) {
			this.blockNumber++;
			this.trialNumber = 1;
		} else {
			this.experimentFinished();
			return;
		}

		this.showTrial();
	}

	updateIndexes() {
		document.getElementById("currentTrialIndex").innerText = this.trialNumber;
		document.getElementById("totalTrialsIndex").innerText = this.getTotalTrials();
		document.getElementById("trialsToBreakIndex").innerText = this.getRemainingTrials();
	}

	experimentFinished() {
		if (this.blockNumber === this.totalBlocks) {
			window.close();
		}
	}

	getTotalTrials() {
		return Array.from({ length: this.experiment.getNumBlocks() }, (_, i) => this.experiment.getBlock(i + 1).trialsNum).reduce((acc, num) => acc + num, 0);
	}

	getRemainingTrials() {
		return this.trialsPerBreak - (this.trialNumber % this.trialsPerBreak);
	}

	printAllTrials() {
		// This function could be potentially moved to the Experiment class to maintain the separation of concerns.
		Array.from({ length: this.experiment.getNumBlocks() }, (_, i) => {
			const block = this.experiment.getBlock(i + 1);
			Array.from({ length: block.trialsNum }, (_, j) => console.log(block.getTrial(j + 1)));
		});
	}
}
