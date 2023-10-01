const maxDistanceRatio = 0.2; // Maximum distance between squares

const maxPairs = 5; // Change this to the desired number of repetitions (n)
let startSquare = null;
let targetSquare = null;
let isTargetClicked = false;
let timeElapsed = 0;
let distance = 0;
let logData = []; // Array to store the logging information
let clickCoordinates = [];
let squares = [];
let startTime = 0; // Initialize startTime
let squareIdCounter = 1; // Initialize a counter for square IDs
let lastTargetPosition = { x: 0, y: 0 }; // Initialize with an arbitrary position
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let clickList = [];

function generateSquareId() {
	return squareIdCounter++;
}
// Function to resize canvas to fit the screen
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	draw();
}

// Function to draw squares
function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid(10); // Draw the grid with lines every 5 pixels

	// Draw existing squares that are not hidden
	squares.forEach((square) => {
		if (!square.hidden) {
			context.fillStyle = square.color;
			context.fillRect(square.x, square.y, square.size, square.size);
		}
	});
}

// Function to generate random position for squares without overlapping and within 30% of the screen width apart
function getRandomPosition() {
	let isOverlap = false;
	let x, y;
	const maxDistance = canvas.width * 0.3; // Maximum dfistance between squares

	do {
		isOverlap = false;

		// Calculate the position based on the direction vector
		x = Math.random() * (canvas.width - 50); // Adjust 50 for square size
		y = Math.random() * (canvas.height - 50); // Adjust 50 for square size

		// Calculate the distance from the last target square's position
		const distanceToLastTarget = Math.sqrt(Math.pow(x - lastTargetPosition.x, 2) + Math.pow(y - lastTargetPosition.y, 2));

		// Check for overlap with existing squares
		for (const square of squares) {
			if (!square.hidden && isOverlapCheck(x, y, square)) {
				isOverlap = true;
				break;
			}
		}

		// Check the distance from existing squares and the last target square
		if (!isOverlap) {
			for (const square of squares) {
				if (!square.hidden) {
					const distance = Math.sqrt(Math.pow(x - square.x, 2) + Math.pow(y - square.y, 2));
					if (distance > maxDistance || distanceToLastTarget < maxDistance) {
						isOverlap = true;
						break;
					}
				}
			}
		}
	} while (isOverlap);

	// Update the last target square's position
	lastTargetPosition.x = x;
	lastTargetPosition.y = y;

	return { x, y };
}

// Function to check for overlap between a new square and an existing square
function isOverlapCheck(newX, newY, existingSquare) {
	return newX < existingSquare.x + existingSquare.size && newX + 50 > existingSquare.x && newY < existingSquare.y + existingSquare.size && newY + 50 > existingSquare.y;
}

// Function to handle click events
function handleCanvasClick(event) {
	const rect = canvas.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	let click = new Click();
	click.id = generateSquareId();

	const clickTime = performance.now();
	click.clickTime = clickTime;

	timeElapsed = clickTime - startTime; // Calculate timeElapsed from startTime

	click.elapsedTime = timeElapsed;

	distance = Math.sqrt(Math.pow(mouseX - startSquare.x, 2) + Math.pow(mouseY - startSquare.y, 2));

	// Push the click coordinates into the clickCoordinates array
	clickCoordinates.push({ x: mouseX, y: mouseY });

	click.pressCoordinateX = mouseX;
	click.pressCoordinateY = mouseY;

	// Check if the click is inside the target square
	if (targetSquare && mouseX >= targetSquare.x && mouseX <= targetSquare.x + targetSquare.size && mouseY >= targetSquare.y && mouseY <= targetSquare.y + targetSquare.size) {
		// User clicked on the target square
		startSquare.hidden = true;
		targetSquare.hidden = true;
		isTargetClicked = true;
		click.isTargetClicked = isTargetClicked;

		// Check if we need to repeat the process
		if (squares.length < maxPairs * 2) {
			generateNewPair();
		} else {
			finishGame();
		}
	} else {
		click.isTargetClicked = false;
	}

	clickList.push(click);

	draw();

	// When the user clicks on the target square
	if (isTargetClicked) {
		// Calculate and format the data
		const rowData = [startSquare.x, startSquare.y, targetSquare.x, targetSquare.y, mouseX, mouseY, mouseX - startSquare.x, mouseY - startSquare.y, timeElapsed, distance, click];

		// Push the formatted data to the logData array
		logData.push(rowData);

		// Hide both squares
		startSquare.hidden = true;
		targetSquare.hidden = true;

		// Check if we need to repeat the process
		if (squares.length < maxPairs * 2) {
			generateNewPair();
		} else {
			finishGame();
		}
		draw();

		// Export the logData array as a CSV file
		//exportToCSV();
	}
}

// Function to generate a new pair of squares
function generateNewPair() {
	startTime = performance.now(); // Update startTime
	isTargetClicked = false;

	// Add a new start square at a random position
	// Inside generateNewPair function, assign IDs to squares
	const randomPositionStart = getRandomPosition();
	startSquare = {
		id: generateSquareId(),
		x: randomPositionStart.x,
		y: randomPositionStart.y,
		size: 50,
		color: "green",
		hidden: false,
	};
	startSquare = { x: randomPositionStart.x, y: randomPositionStart.y, size: 50, color: "green", hidden: false };

	const randomPositionTarget = getRandomPosition();
	targetSquare = {
		id: generateSquareId(),
		x: randomPositionTarget.x,
		y: randomPositionTarget.y,
		size: 50,
		color: "blue",
		hidden: false,
	};
	targetSquare = { x: randomPositionTarget.x, y: randomPositionTarget.y, size: 50, color: "blue", hidden: false };

	squares.push(startSquare, targetSquare);
}

// Function to draw a grid on the canvas
function drawGrid(step) {
	context.strokeStyle = "#ddd"; // Grid line color
	context.lineWidth = 1;

	// Vertical lines
	for (let x = step; x < canvas.width; x += step) {
		context.beginPath();
		context.moveTo(x, 0);
		context.lineTo(x, canvas.height);
		context.stroke();
	}

	// Horizontal lines
	for (let y = step; y < canvas.height; y += step) {
		context.beginPath();
		context.moveTo(0, y);
		context.lineTo(canvas.width, y);
		context.stroke();
	}
}

// Function to display a "Start" message
function showStartMessage() {
	alert("Start");
}

// Function to display a "Finish" message
function showFinishMessage() {
	alert("Finish");
}

// Function to finish the game
function finishGame() {
	showFinishMessage();

	// Check if the game is finished (maxPairs reached)
	if (squares.length >= maxPairs * 2) {
		// Export the logData array as a CSV file
		exportToCSV();
	}

	canvas.removeEventListener("click", handleCanvasClick);
}

function exportToCSV() {
	// Create a CSV string with a header row
	let csv = "Click ID, Press CoordinateX, Press Coordinate Y, elapsedTime, Click Time, isTargetClicked\n";

	// Append each click coordinate
	//clickCoordinates.forEach((coordinate) => {
	//	csv += `${coordinate.id},${coordinate.x},${coordinate.y},${coordinate.directionX},${coordinate.directionY},${coordinate.clickTime}\n`;
	//});

	clickList.forEach((click) => {
		csv += `${click.id},${click.pressCoordinateX},${click.pressCoordinateY},${click.elapsedTime},${click.clickTime},${click.isTargetClicked}\n`;
	});

	// Create a Blob containing the CSV data
	const blob = new Blob([csv], { type: "text/csv" });

	// Create a URL for the Blob
	const url = URL.createObjectURL(blob);

	// Create a temporary anchor element to trigger the download
	const a = document.createElement("a");
	a.href = url;
	a.download = "clickCoordinates.csv";

	// Trigger a click event on the anchor element to download the CSV file
	a.click();

	// Revoke the URL to release resources
	URL.revokeObjectURL(url);
}

/**
 *
 * CALLS
 *
 */

// Initial canvas setup
resizeCanvas();

// Display the "Start" message
showStartMessage();

// Generate the first pair of squares
generateNewPair();

// Add an event listener to resize the canvas when the window size changes
window.addEventListener("resize", resizeCanvas);

// Add an event listener for click events on the canvas
canvas.addEventListener("click", handleCanvasClick);

/**
 * 
 * 

LOGIC for calculating the hold time 

double startTime, endTime, holdTime;
boolean flag = false;

@Override
public final void mousePressed(final MouseEvent e) {
    startTime = System.nanoTime();
    flag = true;
}

@Override
public final void mouseReleased(final MouseEvent e) {
    if(flag) {
        endTime = System.nanoTime();
        flag = false;
    }
    holdTime = (endTime - startTime) / Math.pow(10,9);
}
 */
