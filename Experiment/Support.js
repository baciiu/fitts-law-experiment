// Calculate the radius in pixels
function mm2px(mm) {
	const dpi = window.devicePixelRatio * 50; // 96
	const mmPerInch = 25.4;
	const px = (mm * dpi) / mmPerInch;
	return px;
}

function exportTrialToCSV(trialData) {
	let trial_data = trialData.slice(); // returns a shallow copy of a portion. The original array will not be modified.
	let csvContent = "Trial ID,Shape,Direction,Interaction Device,Start Index,Target Index,Start Size,Target Width,Target Height,Amplitude\n";

	trial_data.sort((a, b) => a.trialId - b.trialId);
	//or ascending sort of the trials based on id

	for (const trial of trial_data) {
		csvContent += `${trial.trialId},${trial.shape},${trial.trialDirection},${trial.intDevice},${trial.startIndex},${trial.targetIndex},${trial.startSize},${trial.targetWidth},${trial.targetHeight},${trial.amplitude}\n`;
	}

	const csvBlob = new Blob([csvContent], { type: "text/csv" });
	const csvURL = window.URL.createObjectURL(csvBlob);
	const a = document.createElement("a");
	a.style.display = "none";
	a.href = csvURL;
	a.download = "trial_data.csv";
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(csvURL);
}

/*

width of the shape 
height of the shape
s
startY 


*/
