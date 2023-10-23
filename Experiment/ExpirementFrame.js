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
		this.allClicks = [];
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
			const clicks = STRectDrawing.getClicks();
			this.allClicks.push(...clicks);
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

			if (this.trialNumber == this.trialsPerBreak) {
				this.exportClicksToCSV();
			}
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
			this.exportClicksToCSV();
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

	exportClicksToCSV() {
		const header = [
			"Counter",
			"BlockNumber",
			"TrialNumber",
			"X",
			"Y",
			"DistanceToStart",
			"DistanceToTarget",
			"StartX",
			"StartY",
			"StartClicked",
			"IsTargetClicked",
			"TargetX",
			"TargetY",
			"TargetHeightPx",
			"TargetWidthPx",
			"TrialDirection",
			"TrialId",
			"TimeIntervalMilliseconds",
			"TimeIntervalSeconds",
			"ClickDuration",
			"Timestamp",
		];

		// Map through all clicks, but also use the index for the counter.
		const rows = this.allClicks.map((click, index) => {
			return [
				index + 1,
				click.blockNumber,
				click.trialNumber,
				click.x,
				click.y,
				click.distanceToStart,
				click.distanceToTarget,
				click.startX,
				click.startY,
				click.startClicked,
				click.isTargetClicked,
				click.targetX,
				click.targetY,
				click.targetHeightPx,
				click.targetWidthPx,
				click.trialDirection,
				click.trialId,
				click.timeIntervalMilisecond,
				click.timeIntervalSeconds,
				click.clickDuration,
				click.timeStamp,
			].join(",");
		});

		const csvContent = [header.join(","), ...rows].join("\n");

		// Trigger the download of the CSV file.
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", "experiment_clicks_data.csv"); // You might want to name the file relevant to its content.
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}
