"use strict";

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
  let experiment;

  if (isDiscrete()) {
    experiment = new ExperimentFrame(USER);
    experiment.init();
  } else if (isReciprocal()) {
    experiment = new ReciprocalExperimentFrame(USER);
    experiment.init();
  }
}

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", click);

const enableFullScreen = ENABLE_FULL_SCREEN;
showStartWindow();
