class Block {
	constructor(blockNumber, experimentType, shape, intDevice, rectsize, startSize, directionCount) {
		this.shape = shape;
		this.targetDimens = [
			{width: 4, height: 4},
			{width: 8, height: 8},
			{width: 10, height: 15},
			{width: 20, height: 10},
			{width: 25, height: 10},
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
		this.isDone = false;

		// Initialize an empty array to store the trials
		this.trials = [];
		let trialId = 1; // Increment the trial number

		// Nested loops to generate the trials
		for (let dimenIdx = 0; dimenIdx < this.targetDimens.length; dimenIdx++) {
			// loop to go through Amplitude
			for (let directionIdx = 0; directionIdx < this.trialDirection.length; directionIdx++) {
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
				const trial = new Trial(
					trialId++,
					this.shape,
					this.trialDirection[directionIdx],
					this.intDevice,
					this.startIndex,
					this.targetIndex,
					this.startSize,
					this.targetDimens[dimenIdx].width,
					this.targetDimens[dimenIdx].height,
					this.amplitude[0]);

				// Add the trial object to the trials array
				this.trials.push(trial);

				const trial2 = new Trial(
					trialId++,
					this.shape,
					this.trialDirection[directionIdx],
					this.intDevice,
					this.startIndex,
					this.targetIndex,
					this.startSize,
					this.targetDimens[dimenIdx].width,
					this.targetDimens[dimenIdx].height,
					this.amplitude[1]);

				this.trials.push(trial2)
			}
		}
		// Shuffle the trials array randomly
		this.shuffleArray(this.trials);
	}



		// return trial
		getTrial(trialNumber)
		{
			return this.trials[trialNumber - 1];
		}

		//check if the block has another trial
		hasNext(trialNumber)
		{
			return this.trialsNum - trialNumber > 0;
		}

		// Shuffling function using Fisher-Yates algorithm
		shuffleArray(array)
		{
			let currentIndex = array.length;
			let temporaryValue, randomIndex;

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



}
	/*
	drawShapes(trial) {
		this.trialCompleted = false;
		console.log("drawShapes");

		this.start.style.display = "block";
		this.start.style.width = mmToPixels(trial.startSize) + "px";
		this.start.style.height = mmToPixels(trial.startSize) + "px";
		this.start.style.left = window.innerWidth / 2 + "px"; // X coordinate
		this.start.style.top = window.innerHeight / 2 - 100 + "px"; // Y coordinate
		this.start.style.position = "absolute";

		this.target.style.display = "block";
		this.target.style.width = mmToPixels(trial.targetWidth) + "px";
		this.target.style.height = mmToPixels(trial.targetHeight) + "px";
		this.target.style.left = window.innerWidth / 2 + "px"; // X coordinate
		this.target.style.top = window.innerHeight / 2 + "px"; // Y coordinate
		this.target.style.position = "absolute";


		this.body.style.display = "block";
		this.body.style.width = window.innerWidth + "px";
		this.body.style.height = window.innerHeight + "px";

		this.setupEventHandlers();
	}

	setupEventHandlers() {
		console.log("setupEventHandlers()");
		this.boundHandleStartPress = this.handleStartPress.bind(this);
		this.boundHandleStartRelease = this.handleStartRelease.bind(this);
		this.boundHandleTargetPress = this.handleTargetPress.bind(this);
		this.boundHandleTargetRelease = this.handleTargetRelease.bind(this);
		this.boundHandleBodyPress = this.handleBodyPress.bind(this);
		// Use bind to ensure 'this' inside the handlers refers to the Block instance
		this.start.addEventListener("mousedown", this.boundHandleStartPress);
		this.start.addEventListener("mouseup", this.boundHandleStartRelease);
	}

	handleStartPress(event) {
		console.log("handleStartPress");
		if (event.button === 0 && !this.firstClickDone) {
			// Left mouse button
			this.trialStartTime = Date.now();
			this.trialStarted = true;
			this.target.style.backgroundColor = "green";
			this.firstClickData =  {name:'start', x: event.clientX, y: event.clientY, time: Date.now(), startHit:this.isCursorInsideShape(event,this.start)};
			console.log(this.firstClickData);
			this.firstClickDone = true;

			if (this.firstClickData.startHit) {
				this.successSound = new Audio("./sounds/success.wav");
				this.successSound.play();
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
		this.start.style.display = "none";
		this.target.addEventListener("mousedown", this.boundHandleTargetPress);
		this.target.addEventListener("mouseup", this.boundHandleTargetRelease);
		this.body.addEventListener("mousedown", this.boundHandleBodyPress);
	}
	handleTargetRelease(event) {
		console.log("handleTargetRelease");
		console.log("trial Started: " + this.trialStarted);

		if (!this.trialStarted) {
			this.errorSound = new Audio("./sounds/err1.wav");
			this.errorSound.play();
		}
		this.start.style.display = "none";
	}

	handleTargetPress(event) {
		console.log("handleTargetPress");
		console.log("trial Started: " + this.trialStarted);

		if (event.button === 0 && this.firstClickDone && this.bodyClickData == null) {


			this.targetClickData ={name:'target', x: event.clientX, y: event.clientY, time: Date.now(), targetHit:this.isCursorInsideShape(event,this.target)};

			console.log(this.targetClickData);

			if (this.targetClickData.targetHit) {
				this.successSound = new Audio("./sounds/success.wav");
				this.successSound.play();
			} else {
				this.errorSound = new Audio("./sounds/err1.wav");
				this.errorSound.play();
			}

			this.target.style.display = "none";
		}

		this.body.removeEventListener("mousedown",this.boundHandleBodyPress);
		this.endTrial();
	}

	handleBodyPress(event) {
		console.log("handleBodyPress");

		if (event.button === 0 && this.firstClickDone && this.firstClickData != null && this.targetClickData == null ) {

			this.bodyClickData = {name:'body', x: event.clientX, y: event.clientY, time: Date.now(), bodyHit:this.isCursorInsideShape(event,this.body)};
			console.log(this.bodyClickData);

			if (this.bodyClickData.bodyHit ) {
				this.errorSound = new Audio("./sounds/err1.wav");
				this.errorSound.play();
			}
			this.target.style.display = "none";
		}

		this.target.removeEventListener("mousedown", this.boundHandleTargetPress);
		this.target.removeEventListener("mousedown", this.boundHandleTargetRelease);

		this.endTrial();
	}

	isCursorInsideShape(event,shape){
		console.log("isCursorInside" + shape);
		const rect = shape.getBoundingClientRect();
		return (
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom
		);
	}

	endTrial() {
		console.log("EndTrial");

		// Resetting the variables
		this.firstClickDone = false;
		this.targetClickData = null;
		this.firstClickData = null;
		this.bodyClickData = null;
		this.trialStarted = false;
		this.trialsNum = 0 ;

		this.target.removeEventListener("mousedown", this.boundHandleTargetPress);
		this.target.removeEventListener("mouseup", this.boundHandleTargetRelease);
		this.start.removeEventListener("mousedown", this.boundHandleStartPress);
		this.start.removeEventListener("mouseup", this.boundHandleStartRelease);
		this.body.removeEventListener("mousedown",this.boundHandleBodyPress)
		this.trialCompleted = true;
	}
	isTrialCompleted(){
		return this.trialCompleted;
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
*/