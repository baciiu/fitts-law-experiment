class Click {
	id = -1;
	pressCoordinateX = 0.0;
	pressCoordinateY = 0.0;
	clickTime = 0.0;
	releaseTime = 0.0;
	releaseCoordinateX = 0.0;
	releaseCoordinateY = 0.0;
	isTargetClicked = false;
	constructor(id, pressCoordinateX, pressCoordinateY, clickTime, releaseTime, releaseCoordinateX, releaseCoordinateY, elapsedTime, isTargetClicked) {
		this.id = id;
		this.pressCoordinateX = pressCoordinateX;
		this.pressCoordinateY = pressCoordinateY;
		this.clickTime = clickTime;
		this.releaseTime = releaseTime;
		this.releaseCoordinateX = releaseCoordinateX;
		this.releaseCoordinateY = releaseCoordinateY;
		this.elapsedTime = elapsedTime;
		this.isTargetClicked = isTargetClicked;
	}
}
