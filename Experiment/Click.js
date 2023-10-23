class Click {
	constructor(
		trialNumber,
		trialId,
		x,
		y,
		distanceToStart,
		distanceTotarget,
		startX,
		startY,
		startClicked,
		isTargetClicked,
		targetX,
		targetY,
		targetHeightPx,
		targetWidthPx,
		trialDirection,
		timeInterval,
		clickDuration,
		timeStamp
	) {
		this.x = x;
		this.y = y;
		this.distanceToStart = distanceToStart;
		this.distanceTotarget = distanceTotarget;
		this.startX = startX;
		this.startY = startY;
		this.startClicked = startClicked;
		this.isTargetClicked = isTargetClicked;
		this.targetX = targetX;
		this.targetY = targetY;
		this.targetHeightPx = targetHeightPx;
		this.targetWidthPx = targetWidthPx;
		this.trialDirection = trialDirection;
		this.trialNumber = trialNumber;
		this.trialId = trialId;
		this.timeIntervalMilisecond = timeInterval;
		this.timeIntervalSeconds = Math.floor((this.timeIntervalMilisecond / 1000) % 60);
		this.clickDuration = clickDuration;
		this.timeStamp = timeStamp;
	}
}
