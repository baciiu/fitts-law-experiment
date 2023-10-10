const experimentFrame = new ExperimentFrame();

// Function to show the start window
function showStartWindow() {
	// Get the break window modal
	const startWindow = document.getElementById("startWindow");
	// Show the modal
	startWindow.style.display = "block";
	// Disable the rest of the page interaction while the start window is visible
	document.body.style.pointerEvents = "none";
}

// Function to start the experiment in full-screen mode
function startExperiment() {
	// Hide the start window
	const startWindow = document.getElementById("startWindow");
	startWindow.style.display = "none";

	// Enable the page interaction again
	document.body.style.pointerEvents = "auto";

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
	}

	// Start the experiment
	experimentFrame.showTrial();
}

// Event listener for the start button
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", startExperiment);

// Show the start window
showStartWindow();
