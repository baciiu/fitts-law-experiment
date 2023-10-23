class STRectsDrawing {
	constructor(trial, trialNumber, Size, nums, onTargetClicked, click) {
		this.shape = trial.shape;
		this.startClicked = false;
		this.isTargetClicked = false;
		this.startIndex = trial.startIndex;
		this.targetIndex = trial.targetIndex;
		this.nums = nums;
		this.amplitude = trial.amplitude;
		this.startSize = trial.startSize;
		this.targetWidth = trial.targetWidth;
		this.targetHeight = trial.targetHeight;
		this.Size = Size;
		this.trialId = trial.trialId;
		this.trialDirection = trial.trialDirection;
		this.onTargetClicked = onTargetClicked;
		this.handleCanvasClick = this.handleCanvasClick.bind(this);
		this.trialNumber = trialNumber;
		this.intDevice = trial.intDevice;

		this.clicks = [];
		this.startTime = null; // Timestamp when the start shape is clicked.
		this.endTime = null; // Timestamp when the target shape is clicked.
		this.timeInterval = null; // Difference between start and end times.

		this.pressDuration = 0;
		this.mouseIsDown = false; // flag indicating whether the mouse button is currently pressed
		this.lastMouseDown = null; // stores the last mousedown event timestamp
	}

	// Modify handleMouseDown not to calculate duration, but to record the state and time.
	handleMouseDown(event) {
		this.mouseIsDown = true;
		this.lastMouseDown = new Date().getTime();
	}

	// Modify handleMouseUp just to update the state.
	handleMouseUp(event) {
		this.mouseIsDown = false;
	}

	showRects() {
		const canvas = document.getElementById("canvas");
		const context = canvas.getContext("2d");
		let startSizePx = 0;

		let startX = 0;
		let startY = 0;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		context.clearRect(0, 0, canvas.width, canvas.height);

		canvas.removeEventListener("click", this.handleCanvasClick);
		canvas.addEventListener("click", this.handleCanvasClick);

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const amplitudePx = mm2px(this.amplitude);
		const angle = (2 * Math.PI) / this.nums;

		context.strokeStyle = "black";

		startSizePx = mm2px(this.startSize);

		const startColor = "rgba(144, 238, 144, 0.8)";
		context.fillStyle = startColor;

		startX = centerX + amplitudePx * Math.cos(this.startIndex * angle);
		startY = centerY + amplitudePx * Math.sin(this.startIndex * angle);

		// draw start shape
		if (this.shape === "rectangle") {
			context.strokeRect(startX - startSizePx / 2, startY - startSizePx / 2, startSizePx, startSizePx);
			context.fillRect(startX - startSizePx / 2, startY - startSizePx / 2, startSizePx, startSizePx);
		} else {
		}

		const targetColor = "rgba(255, 102, 102, 0.8)"; // pink
		context.fillStyle = targetColor;

		const targetX = centerX + amplitudePx * Math.cos(this.targetIndex * angle);
		const targetY = centerY + amplitudePx * Math.sin(this.targetIndex * angle);

		// draw target shape
		if (this.shape === "rectangle") {
			this.targetWidthPx = mm2px(this.targetWidth);
			this.targetHeightPx = mm2px(this.targetHeight);

			context.strokeRect(targetX - this.targetWidthPx / 2, targetY - this.targetHeightPx / 2, this.targetWidthPx, this.targetHeightPx);
			context.fillRect(targetX - this.targetWidthPx / 2, targetY - this.targetHeightPx / 2, this.targetWidthPx, this.targetHeightPx);
		} else {
		}

		// Add event listeners for the mouse down and up events
		canvas.addEventListener("mousedown", this.handleMouseDown);
		canvas.addEventListener("mouseup", this.handleMouseUp);

		this.printToConsole();
	}

	isClickInsideRectangle(clickX, clickY, rectX, rectY, rectWidth, rectHeight) {
		return clickX >= rectX - rectWidth / 2 && clickX <= rectX + rectWidth / 2 && clickY >= rectY - rectHeight / 2 && clickY <= rectY + rectHeight / 2;
	}

	handleCanvasClick(event) {
		const canvas = document.getElementById("canvas");
		const rect = canvas.getBoundingClientRect();

		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		console.log(`Click registered at: (${x}, ${y}), Start clicked: ${this.startClicked}, Target clicked: ${this.isTargetClicked}`);

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const amplitudePx = mm2px(this.amplitude);
		const angle = (2 * Math.PI) / this.nums;

		const startX = centerX + amplitudePx * Math.cos(this.startIndex * angle);
		const startY = centerY + amplitudePx * Math.sin(this.startIndex * angle);
		const targetX = centerX + amplitudePx * Math.cos(this.targetIndex * angle);
		const targetY = centerY + amplitudePx * Math.sin(this.targetIndex * angle);

		const startPx = mm2px(this.startSize);
		const targetWidthPx = mm2px(this.targetWidth); // Width of the target rectangle
		const targetHeightPx = mm2px(this.targetHeight); // Height of the target rectangle

		const distanceTotarget = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);
		const distanceToStart = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);

		const clickedStart = this.isClickInsideRectangle(x, y, startX, startY, startPx, startPx);
		// Assuming start is also a rectangle here.
		const clickedTarget = this.isClickInsideRectangle(x, y, targetX, targetY, targetWidthPx, targetHeightPx);

		if (this.lastMouseDown) {
			const clickTime = new Date().getTime(); // current time
			this.pressDuration = clickTime - this.lastMouseDown; // calculate how long the button was down
			console.log(`Press duration: ${pressDuration} ms`);

			// Reset the lastMouseDown because we've handled this mousedown -> mouseup cycle
			this.lastMouseDown = null;
		}

		if (!this.startClicked && clickedStart) {
			this.startClicked = true;
			this.startTime = new Date(); // Capture the current time when the start shape is clicked.
		} else if (this.startClicked && !this.isTargetClicked && clickedTarget) {
			this.endTime = new Date(); // Capture the time when the target shape is clicked.
			this.timeInterval = this.endTime - this.startTime;
			this.onTargetClicked();
			this.isTargetClicked = true;
		}

		this.clicks.push(
			new Click(
				this.trialNumber,
				this.trialId,
				x,
				y,
				distanceToStart,
				distanceTotarget,
				startX,
				startY,
				this.startClicked,
				this.isTargetClicked,
				targetX,
				targetY,
				this.targetHeightPx,
				this.targetWidthPx,
				this.trialDirection,
				this.timeInterval,
				this.pressDuration,
				this.getTimeFormat(Date.now())
			)
		);
		//console.log(this.click);
	}

	printToConsole() {
		console.log(
			"Information from Drawing: " +
				"Trial Number: " +
				this.trialNumber +
				" | Trial ID: " +
				this.trialId +
				" | Shape: " +
				this.shape +
				" | Interaction Device: " +
				this.intDevice +
				" | Start Size: " +
				this.startSize +
				" | Start Index: " +
				this.startIndex +
				" | Target Index: " +
				this.targetIndex +
				" | Amplitude: " +
				this.amplitude +
				" | Target Width: " +
				this.targetWidth +
				" | Target Height: " +
				this.targetHeight +
				" | Trail Direction: " +
				this.trialDirection
		);
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

	getClicks() {
		return this.clicks;
	}
}
