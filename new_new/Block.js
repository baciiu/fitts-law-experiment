class Block {
	constructor(blockNumber, experimentType, shape, intDevice, rectsize, startSize, directionCount) {
		this.shape = shape;
		this.targetDimens = [
			{ width: 4, height: 4 },
			{ width: 8, height: 8 },
			{ width: 10, height: 15 },
			{ width: 20, height: 10 },
			{ width: 25, height: 10 },
		];

		this.amplitude = [54, 110];
		this.trialDirection = ["Left", "Up", "Right", "Down"];
		this.intDevice = intDevice;
		this.blockNumber = blockNumber;
		this.experimentType = experimentType;
		this.startSize = startSize;
		this.directionCount = directionCount;
		this.rectsize = rectsize;
		this.trialId = 1;

		this.currentstartIndex = null;
		this.currentTargetIndex = null;
		this.trialsNum = this.targetDimens.length * this.trialDirection.length * this.amplitude.length;
		this.usedIndices = [];
		this.rectIndices = [];
		for (let i = 0; i < this.numRects; i++) {
			this.rectIndices.push(i);
		}

		this.trialStarted = false;
		this.trialStartTime;

		// Initialize an empty array to store the trials
		this.trials = [];
		let trialId = 1; // Increment the trial number

		// Nested loops to generate the trials
		for (var dimenIdx = 0; dimenIdx < this.targetDimens.length; dimenIdx++) {
			// loop to go through Amplitude
			for (var directionIdx = 0; directionIdx < this.trialDirection.length; directionIdx++) {
				// loop to go through interaction direction

				// Check and assign startIndex, and targetIndex for each direction

				if (this.trialDirection[directionIdx] == "Left") {
					this.startIndex = 0;
					this.targetIndex = 4;
				}
				if (this.trialDirection[directionIdx] == "Right") {
					this.startIndex = 4;
					this.targetIndex = 0;
				}
				if (this.trialDirection[directionIdx] == "Up") {
					this.startIndex = 2;
					this.targetIndex = 6;
				}
				if (this.trialDirection[directionIdx] == "Down") {
					this.startIndex = 6;
					this.targetIndex = 2;
				}

				// Create a trial object with the current combination of values
				const trial = {
					trialId: trialId++,
					shape: this.shape,
					trialDirection: this.trialDirection[directionIdx],
					intDevice: this.intDevice,
					startIndex: this.startIndex,
					targetIndex: this.targetIndex,
					startSize: this.startSize,
					targetWidth: this.targetDimens[dimenIdx].width,
					targetHeight: this.targetDimens[dimenIdx].height,
					amplitude: this.amplitude[0],
				};

				// Add the trial object to the trials array
				this.trials.push(trial);

				const trial2 = {
					trialId: trialId++,
					shape: this.shape,
					trialDirection: this.trialDirection[directionIdx],
					intDevice: this.intDevice,
					startIndex: this.startIndex,
					targetIndex: this.targetIndex,
					startSize: this.startSize,
					targetWidth: this.targetDimens[dimenIdx].width,
					targetHeight: this.targetDimens[dimenIdx].height,
					amplitude: this.amplitude[1],
				};
				this.trials.push(trial2);
			}
		}
		// Shuffle the trials array randomly
		this.shuffleArray(this.trials);
	}

	// return trial
	getTrial(trialNumber) {
		return this.trials[trialNumber - 1];
	}

	//check if the block has another trial
	hasNext(trialNumber) {
		return this.trialsNum - trialNumber > 0;
	}

	// Shuffling function using Fisher-Yates algorithm
	shuffleArray(array) {
		var currentIndex = array.length;
		var temporaryValue, randomIndex;

		// While there remain elements to shuffle
		while (currentIndex !== 0) {
			// Pick a remaining element
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// Swap it with the current element
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	drawShapes(trial) {
		console.log("drawShapes");
		var start = document.getElementById("start");
		var target = document.getElementById("target");

		start.style.width = mmToPixels(trial.startSize) + "px";
		start.style.height = mmToPixels(trial.startSize) + "px";
		start.style.left = window.innerWidth / 2 + "px"; // X coordinate
		start.style.top = window.innerHeight / 2 - 100 + "px"; // Y coordinate
		start.style.position = "absolute";

		target.style.width = mmToPixels(trial.targetWidth) + "px";
		target.style.height = mmToPixels(trial.targetHeight) + "px";
		target.style.left = window.innerWidth / 2 + "px"; // X coordinate
		target.style.top = window.innerHeight / 2 + "px"; // Y coordinate
		target.style.position = "absolute";
		this.setupEventHandlers();
		console.log(start);
		console.log(target);
	}

	setupEventHandlers() {
		console.log("setupEventHandlers()");
		const start = document.getElementById("start");
		const target = document.getElementById("target");

		// Use bind to ensure 'this' inside the handlers refers to the Block instance
		start.addEventListener("mousedown", this.handleStartPress.bind(this));
		start.addEventListener("mouseup", this.handleStartRelease.bind(this));
		target.addEventListener("mousedown", this.handleTargetPress.bind(this));

		target.addEventListener("mouseup", this.handleTargetRelease.bind(this));
	}

	handleStartPress(event) {
		console.log("handleStartPress");
		if (event.button === 0) {
			// Left mouse button
			this.trialStartTime = Date.now();
			this.trialStarted = true;
			target.style.backgroundColor = "green";

			if (this.isCursorInsideStart) {
				this.successSound = new Audio("./sounds/success.wav");
				this.successSound.play();
			} else {
				this.errorSound = new Audio("./sounds/err1.wav");
				this.errorSound.play();
			}
		}
	}

	handleStartRelease(event) {
		console.log("handleStartRelease");
		console.log("trial Started: " + this.trialStarted);

		if (!this.trialStarted) {
			this.errorSound = new Audio("./sounds/err1.wav");
			this.errorSound.play();
		}
	}

	handleTargetPress(event) {
		console.log("handleTargetPress");
		console.log("trial Started: " + this.trialStarted);
	}
	handleTargetRelease(event) {
		console.log("handleTargetRelease");
		console.log("trial Started: " + this.trialStarted);

		if (this.trialStarted && event.button === 0) {
			if (this.isCursorInsideTarget) {
				this.hit = new Audio("./sounds/hit.wav");
				this.hit.play();
			} else {
				this.errorSound = new Audio("./sounds/err1.wav");
				this.errorSound.play();
			}
		}

		this.endTrial();
	}

	endTrial() {
		console.log("EndTrial");
		this.trialStarted = false;
		const trialEndTime = Date.now();
		const trialDuration = trialEndTime - this.trialStartTime;
		console.log(trialDuration);
		console.log(this.formatDuration(trialDuration));
		// Handle trial end logic
		// Move target to a new position
	}

	isCursorInsideStart(event) {
		console.log("isCursorInsideStart");
		// Implement logic to check if the cursor is inside the start element
		return false;
	}

	isCursorInsideTarget(event) {
		console.log("isCursorInsideTarget");
		// Implement logic to check if the cursor is inside the target element
		return false;
	}

	getTimeFormat(date) {
		// Get the individual components of the date.
		const now = new Date(date);
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0"); // January is 0 in JavaScript
		const day = String(now.getDate()).padStart(2, "0");
		const hour = String(now.getHours()).padStart(2, "0");
		const minutes = String(now.getMinutes()).padStart(2, "0");
		const seconds = String(now.getSeconds()).padStart(2, "0");
		const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

		// Construct the formatted timestamp string.
		return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}.${milliseconds}`;
	}

	formatDuration = (ms) => {
		if (ms < 0) ms = -ms;
		const time = {
			day: Math.floor(ms / 86400000),
			hour: Math.floor(ms / 3600000) % 24,
			minute: Math.floor(ms / 60000) % 60,
			second: Math.floor(ms / 1000) % 60,
			millisecond: Math.floor(ms) % 1000,
		};
		return Object.entries(time)
			.filter((val) => val[1] !== 0)
			.map(([key, val]) => `${val} ${key}${val !== 1 ? "s" : ""}`)
			.join(", ");
	};
}

function mmToPixels(mm) {
	// https://www.calculatorsoup.com/calculators/technology/ppi-calculator.php
	const screenWidth = 1512; // Screen width in pixels
	const screenHeight = 982; // Screen height in pixels
	const screenDiagonal = 14.42; // Screen diagonal in pixel

	const inches = mm / 25.4;
	return inches * 125.2;

	// resolution 1800px x 1169 px  diag inch 14.4 => ppi 149.1
	// resolution 1512 px x 982 px diag inch 14.4 => ppi 125.20
}
