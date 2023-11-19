function showStartWindow() {
	const startWindow = document.getElementById("startWindow");

	startWindow.style.display = "block";

	document.body.style.pointerEvents = "none";
}

function startExperiment() {
	const startWindow = document.getElementById("startWindow");
	startWindow.style.display = "none";

	document.body.style.pointerEvents = "auto";

	/*
	// Request full-screen mode for the document body
	const docBody = document.documentElement;
	if (docBody.requestFullscreen) {
		docBody.requestFullscreen();
	} else if (docBody.mozRequestFullScreen) {
		docBody.mozRequestFullScreen();
	} else if (docBody.webkitRequestFullscreen) {
		docBody.webkitRequestFullscreen();
	} else if (docBody.msRequestFullscreen) {
		docBody.msRequestFullscreen();
	}*/

	/** START */
	experimentFrame = new ExperimentFrame();
	experimentFrame.showTrial();

	/*
	var experiment = new Experiment();
	let delay = 0;
	const delayIncrement = 1000; // 1 second

	experiment.blocks.forEach((block) => {
		block.trials.forEach((trial) => {
			setTimeout(function () {
				block.drawShapes(trial);
				console.log(trial);

				// Additional timeout to wait after block.drawShapes() completes
				setTimeout(function () {
					console.log("Finished trial:", trial.trialId);
				}, delayIncrement);
			}, delay);

			delay += delayIncrement * 2; // Increase delay for the next iteration
		});
	});*/
}

// Event listener for the start button
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", startExperiment);

showStartWindow();
startExperiment();
