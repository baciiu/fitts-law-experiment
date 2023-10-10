// Calculate the radius in pixels
function mm2px(valueMM) {
	// Get the PPI of the screen
	const ppi = window.devicePixelRatio * 96; // assuming a default DPI of 96
	// Convert  mm to pixels
	const valuePx = valueMM * (ppi / 25.4);
	return valuePx;
}

function exportToCSV(trialData) {
	let trial_data = trialData.slice(); // returns a shallow copy of a portion. The original array will not be modified.
	let csvContent = "Trial ID,Shape,Direction,Interaction Device,Start Index,Target Index,Start Size,Target Width,Target Height,Amplitude\n";

	trial_data.sort((a, b) => a.trialId - b.trialId);

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
