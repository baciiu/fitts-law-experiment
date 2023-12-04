class Trial {
  constructor(
    trialId,
    trialDirection,
    intDevice,
    startSize,
    targetWidth,
    targetHeight,
    amplitude,
    isDone,
  ) {
    this.trialId = trialId;
    this.trialDirection = trialDirection;
    this.intDevice = intDevice;
    this.startSize = startSize;
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.amplitude = amplitude;
    this.isDone = isDone;

    this.successSound = new Audio("./sounds/success.wav");
    this.errorSound = new Audio("./sounds/err1.wav");

    this.start = document.getElementById("start");
    this.target = document.getElementById("target");
    this.body = document.getElementById("body");

    this.firstClickDone = false;
    this.firstClickData = false;
    this.targetClickData = null;
    this.bodyClickData = null;
    this.trialCompleted = false;
  }

  drawShapes() {
    this.trialCompleted = false;
    this.start.style.display = "block";
    this.start.style.width = mmToPixels(this.startSize) + "px";
    this.start.style.height = mmToPixels(this.startSize) + "px";
    this.start.style.position = "absolute";
    this.start.style.backgroundColor = "gray";

    this.target.style.display = "block";
    this.target.style.width = mmToPixels(this.targetWidth) + "px";
    this.target.style.height = mmToPixels(this.targetHeight) + "px";
    this.target.style.position = "absolute";
    this.target.style.backgroundColor = "yellow";

    //this.getPositionOnScreen();
    //const pos = this.getPositionShapes();
    const pos = this.generateSquarePositions();

    this.start.style.left = pos.start.x + "px";
    this.start.style.top = pos.start.y + "px";
    this.target.style.left = pos.target.x + "px";
    this.target.style.top = pos.target.y + "px";
    console.log(pos.direction);

    this.body.style.display = "block";
    this.body.style.width = window.innerWidth + "px";
    this.body.style.height = window.innerHeight + "px";

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.boundHandleStartPress = this.handleStartPress.bind(this);
    this.boundHandleStartRelease = this.handleStartRelease.bind(this);
    this.boundHandleTargetPress = this.handleTargetPress.bind(this);
    this.boundHandleTargetRelease = this.handleTargetRelease.bind(this);
    this.boundHandleBodyPress = this.handleBodyPress.bind(this);
    // Use bind to ensure 'this' inside the handlers refers to the Block instance
    this.start.addEventListener("mousedown", this.boundHandleStartPress);
    this.start.addEventListener("mouseup", this.boundHandleStartRelease);
  }

  handleStartPress(event) {
    if (event.button === 0 && !this.firstClickDone) {
      this.trialStartTime = Date.now();
      this.trialStarted = true;
      this.target.style.backgroundColor = "green";
      this.firstClickData = {
        name: "start",
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
        startHit: this.isCursorInsideShape(event, this.start),
      };
      console.log(this.firstClickData);
      this.firstClickDone = true;

      if (this.firstClickData.startHit) {
        this.successSound.play();
      }
    }
  }

  handleStartRelease(event) {
    if (!this.trialStarted) {
      this.errorSound.play();
    }
    this.start.style.display = "none";
    this.target.addEventListener("mousedown", this.boundHandleTargetPress);
    this.target.addEventListener("mouseup", this.boundHandleTargetRelease);
    this.body.addEventListener("mousedown", this.boundHandleBodyPress);
  }

  handleTargetRelease(event) {
    if (!this.trialStarted) {
      this.errorSound.play();
    }
    this.start.style.display = "none";
  }

  handleTargetPress(event) {
    if (
      event.button === 0 &&
      this.firstClickDone &&
      this.bodyClickData == null
    ) {
      this.targetClickData = {
        name: "target",
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
        targetHit: this.isCursorInsideShape(event, this.target),
      };

      console.log(this.targetClickData);

      if (this.targetClickData.targetHit) {
        this.successSound.play();
      } else {
        this.errorSound.play();
      }

      this.target.style.display = "none";
    }
    this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
    this.endTrial();
  }

  handleBodyPress(event) {
    if (
      event.button === 0 &&
      this.firstClickDone &&
      this.firstClickData != null &&
      this.targetClickData == null
    ) {
      this.bodyClickData = {
        name: "body",
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
        bodyHit: this.isCursorInsideShape(event, this.body),
      };
      console.log(this.bodyClickData);

      if (this.bodyClickData.bodyHit) {
        this.errorSound.play();
      }
      this.target.style.display = "none";
    }

    this.target.removeEventListener("mousedown", this.boundHandleTargetPress);
    this.target.removeEventListener("mousedown", this.boundHandleTargetRelease);
    this.endTrial();
  }

  isCursorInsideShape(event, shape) {
    const rect = shape.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  endTrial() {
    this.firstClickDone = false;
    this.targetClickData = null;
    this.firstClickData = null;
    this.bodyClickData = null;
    this.trialStarted = false;

    this.target.removeEventListener("mousedown", this.boundHandleTargetPress);
    this.target.removeEventListener("mouseup", this.boundHandleTargetRelease);
    this.start.removeEventListener("mousedown", this.boundHandleStartPress);
    this.start.removeEventListener("mouseup", this.boundHandleStartRelease);
    this.body.removeEventListener("mousedown", this.boundHandleBodyPress);
    this.trialCompleted = true;
    this.isDone = experimentFrame.trialCompleted();
  }

  getTimeFormat(date) {
    // Get the individual components of the date.
    const now = new Date(date);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // January is 0 in JavaScript
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    // Construct the formatted timestamp string.
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}.${milliseconds}`;
  }

  formatDuration = (ms) => {
    if (ms < 0) ms = -ms;
    const time = {
      day: Math.floor(ms / 86400000),
      hour: Math.floor(ms / 3600000) % 24,
      minute: Math.floor(ms / 60000) % 60,
      second: Math.floor(ms / 1000) % 60,
      millisecond: Math.floor(ms) % 1000,
    };
    return Object.entries(time)
      .filter((val) => val[1] !== 0)
      .map(([key, val]) => `${val} ${key}${val !== 1 ? "s" : ""}`)
      .join(", ");
  };

  generateSquarePositions() {
    const startSize = mmToPixels(this.startSize);
    const targetWidth = mmToPixels(this.targetWidth);
    const targetHeight = mmToPixels(this.targetHeight);
    const amplitude = mmToPixels(this.amplitude);
    const angle = this.trialDirection;

    // Calculate distances
    const distanceX = amplitude + startSize - startSize / 2 - targetWidth / 2;
    const distanceY = amplitude + startSize - startSize / 2 - targetHeight / 2;

    const topMargin = mmToPixels(7);
    const sideMargin = mmToPixels(2);

    for (let i = 0; i < 20; i++) {
      let startX =
        sideMargin +
        Math.random() * (window.innerWidth - startSize - 2 * sideMargin);
      let startY =
        topMargin +
        Math.random() *
          (window.innerHeight - startSize - topMargin - sideMargin);
      let direction = "";

      const getTargetPosition = () => {
        const angleRadians = (angle * Math.PI) / 180; // Convert angle to radians
        let diagonalX, diagonalY;

        if (angle === 0) {
          diagonalX = startX + distanceX * Math.cos(angleRadians);
          diagonalY = startY + (startSize - targetHeight) / 2; // Center on the same Y axis
          direction = "right";
        } else if (angle === 90) {
          diagonalX = startX + (startSize - targetWidth) / 2; // Center on the same X axis
          diagonalY = startY + distanceY * Math.sin(angleRadians);
          direction = "down";
        } else if (angle === 180) {
          diagonalX = startX + distanceX * Math.cos(angleRadians);
          diagonalY = startY + (startSize - targetHeight) / 2; // Center on the same Y axis
          direction = "left";
        } else if (angle === 270) {
          diagonalX = startX + (startSize - targetWidth) / 2; // Center on the same X axis
          diagonalY = startY + distanceY * Math.sin(angleRadians);
          direction = "up";
        } else {
          diagonalX = startX + distanceX * Math.cos(angleRadians);
          diagonalY = startY + distanceY * Math.sin(angleRadians);
          direction = "diagonal";
        }
        return { x: diagonalX, y: diagonalY, z: direction };
      };

      // Iterate over angleSet if it's an array, or just use it directly if it's a single value
      let possiblePositions = [getTargetPosition()];

      // Filtering logic
      let validPositions = possiblePositions.filter((pos) => {
        return (
          pos.x >= sideMargin &&
          pos.x <= window.innerWidth - targetWidth - sideMargin &&
          pos.y >= topMargin &&
          pos.y <= window.innerHeight - targetHeight - sideMargin &&
          pos.z != ""
        );
      });

      if (validPositions.length > 0) {
        let targetPos =
          validPositions[Math.floor(Math.random() * validPositions.length)];
        return {
          start: { x: startX, y: startY },
          target: { x: targetPos.x, y: targetPos.y },
          direction: targetPos.z,
        };
      }
    }
  }
}

function mmToPixels(mm) {
  // https://www.calculatorsoup.com/calculators/technology/ppi-calculator.php
  const screenWidth = 1512; // Screen width in pixels
  const screenHeight = 982; // Screen height in pixels
  const screenDiagonal = 14.42; // Screen diagonal in pixel

  const inches = mm / 25.4;
  return inches * 125;

  // resolution 1800px x 1169 px  diag inch 14.4 => ppi 149.1
  // resolution 1512 px x 982 px diag inch 14.4 => ppi 125.20
}
