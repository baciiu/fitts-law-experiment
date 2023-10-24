class Block {
	constructor(blockNumber, experimentType, shape, intDevice, rectsize, startSize, directionCount) {
		this.shape = shape;
		this.targetDimens = [
            {width: 4, height: 4},
            {width: 8, height: 8},
            {width: 10, height: 10},
            {width: 15, height: 15},
            {width: 4, height: 6},
            {width: 4, height: 8},
            {width: 4, height: 10},
            {width: 8, height: 12},
            {width: 8, height: 16},
            {width: 8, height: 20},
            {width: 10, height: 15},
            {width: 10, height: 20},
            {width: 10, height: 25},
            {width: 6, height: 4},
            {width: 8, height: 4},
            {width: 10, height: 4},
            {width: 12, height: 8},
            {width: 16, height: 8},
            {width: 20, height: 8},
            {width: 15, height: 10},
            {width: 20, height: 10},
            {width: 25, height: 10}
        ];
		//this.targetWidth = [4, 6, 8, 10, 15, 12, 16, 20, 25];
		this.amplitude = [54, 110];
		this.trialDirection = ["Left", "Up", "Right", "Down"];
		//  ["Left", "Up", "Right", "Down", "Up-Right", "Up-Left", "Down-Left", "Down-Right"];
		this.intDevice = intDevice;
		this.blockNumber = blockNumber;
		this.experimentType = experimentType;
		this.startSize = startSize;
		this.directionCount = directionCount;
		this.rectsize = rectsize;
		this.trialId = 1; // Initialize the trial ID

		this.currentstartIndex = null;
		this.currentTargetIndex = null;
		this.trialsNum = this.targetDimens.length * this.trialDirection.length * this.amplitude.length;
		this.usedIndices = [];
		this.rectIndices = [];
		for (let i = 0; i < this.numRects; i++) {
			this.rectIndices.push(i);
		}

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
                /*
                if (this.trialDirection[j] == "Up-Right") {
                    this.startIndex = 1;
                    this.targetIndex = 5; // adjusted assuming 5 is Down-Left, which is 180 degrees from Up-Right
                }
                if (this.trialDirection[j] == "Up-Left") {
                    this.startIndex = 7;
                    this.targetIndex = 3; // adjusted assuming 3 is Down-Right, which is 180 degrees from Up-Left
                }
                if (this.trialDirection[j] == "Down-Right") {
                    this.startIndex = 3;
                    this.targetIndex = 7; // adjusted assuming 7 is Up-Left, which is 180 degrees from Down-Right
                }
                if (this.trialDirection[j] == "Down-Left") {
                    this.startIndex = 5;
                    this.targetIndex = 1;
                }*/

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
                    amplitude: this.amplitude[0]
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
                    amplitude: this.amplitude[1]
                };
                this.trials.push(trial2);
            }
		}
		// Shuffle the trials array randomly
		this.shuffleArray(this.trials);
        console.log(this.trials);

		//exportTrialToCSV(this.trials);
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
}
