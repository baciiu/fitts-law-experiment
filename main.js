function showStartWindow() {
  const startWindow = document.getElementById("startWindow");
  startWindow.style.display = "block";
  document.body.style.pointerEvents = "none";
}

function showFinishWindow() {
  const finishWindow = document.getElementById("finishWindow");
  finishWindow.style.display = "block";
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
  experimentFrame = new ExperimentFrame(3);
  experimentFrame.showTrial();
}

// Event listener for the start button
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", startExperiment);

showStartWindow();
startExperiment();
