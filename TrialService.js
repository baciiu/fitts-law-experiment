function mmToPixels(mm) {
  // https://www.calculatorsoup.com/calculators/technology/ppi-calculator.php
  const screenWidth = 1512; // Screen width in pixels
  const screenHeight = 982; // Screen height in pixels
  const screenDiagonal = 14.42; // Screen diagonal in pixel

  const inches = mm / 25.4;
  let result = inches * 151;
  //result = result.toFixed(2);
  //let res = Number(result);
  return result;

  // resolution 1800px x 1169 px  diag inch 14.4 => ppi 149.1 // update 151 is more accurate
  // resolution 1512 px x 982 px diag inch 14.4 => ppi 125.20 // update 127 is more accurate
}

function generateCoordForExperimentType(exp) {
  if (this.experimentType == "discrete") {
  } else if (this.experimentType == "reciprocal") {
  } else {
    console.log("Experiment Undefined");
    return;
  }
}

function generateCenterPointWithAmplitude(prevCenter, amplitude, angle) {
  const angleRadians = angle * (Math.PI / 180);
  return {
    x: prevCenter.x + amplitude * Math.cos(angleRadians),
    y: prevCenter.y + amplitude * Math.sin(angleRadians),
  };
}

function getInput() {
  const input = [
    { width: 10, height: 10, angle: 0, amplitude: 100 },
    { width: 15, height: 10, angle: 180, amplitude: 100 },
    { width: 20, height: 20, angle: 0, amplitude: 100 },
    { width: 10, height: 20, angle: 180, amplitude: 100 },
    //{ width: 20, height: 10 },
    //{ width: 25, height: 10 },
    //{ width: 40, height: 20 },
  ];
  return input;
}
