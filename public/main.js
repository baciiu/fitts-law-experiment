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

function click() {
  if (enableFullScreen) {
    openFullScreen();
  } else {
    startExperiment();
  }
}

function openFullScreen() {
  document
    .getElementById("root")
    .requestFullscreen()
    .then(
      () => {
        startExperiment();
      },
      () => {
        startExperiment();
      },
    );
}

function startExperiment() {
  const startWindow = document.getElementById("startWindow");
  startWindow.style.display = "none";
  document.body.style.pointerEvents = "auto";

  /** START */
  //const experimentType = "discrete";
  const experimentType = "reciprocal";
  experimentFrame = new ExperimentFrame(4, experimentType);
  experimentFrame.showTrial();
  /** END */
}

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", click);

const enableFullScreen = false;
showStartWindow();

// https://192.168.0.100:8080/start.html
