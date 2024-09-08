/** ERROR MESSAGES */
const ERROR_MESSAGE_EXPERIMENT = "[MY ERROR]: Experiment type is undefined.";
const ERROR_GENERATE_POSITION =
  "[MY ERROR]: Could not generate a valid position.";
const ERROR_EMPTY_BLOCK = "[MY ERROR]: No trials found in the Block.";
const ERROR_TRIAL_INSTANCE_DISCRETE =
  "[MY ERROR]: Not an instance of TrialDiscrete.";
const ERROR_TRIAL_INSTANCE_RECIPROCAL =
  "[MY ERROR]: Not an instance of TrialReciprocal.";
const ERROR_GROUP_INSTANCE = "[MY ERROR]: Not an instance of Group.";

/** SOUNDS */
const successSound = new Audio("./sounds/success.wav");
const errorSound = new Audio("./sounds/err1.wav");

/** COLOURS */
const WAIT_COLOR = "yellow";
const CLICK_COLOR = "green";
const START_COLOR = "gray";

const test = Object.freeze({
  BLOCKS: 1,

  REP: 0,

  TRAVELS: 6,

  AMPL: [36, 54, 80],

  ANGLES: [0, 90, 180],

  INPUT_2: [
    { width: 15, height: 10 },
    { width: 20, height: 10 },
  ],

  INPUT_4: [
    { width: 10, height: 10, angle: 90, amplitude: 36 },
    { width: 20, height: 20, angle: 180, amplitude: 54 },
    { width: 12, height: 8, angle: 270, amplitude: 80 },
  ],
});

const UIST20 = Object.freeze({
  // page 862 from " Modeling 2 Dimensional Touch Pointing "

  BLOCKS: 1,

  REP: 0,

  TRAVELS: 6,

  AMPL: [36, 54, 80],

  //   0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5,
  //   180, 202.5, 225, 27.5, 270, 292.5, 315, 337.5,
  ANGLES: [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5],

  INPUT_2: [
    { width: 4, height: 4 },
    { width: 8, height: 8 },
    { width: 10, height: 10 },

    { width: 4, height: 6 },
    { width: 4, height: 8 },
    { width: 4, height: 10 },

    { width: 8, height: 12 },
    { width: 8, height: 16 },
    { width: 8, height: 20 },

    { width: 10, height: 15 },
    { width: 10, height: 20 },
    { width: 10, height: 25 },

    { width: 6, height: 4 },
    { width: 8, height: 4 },
    { width: 10, height: 4 },

    { width: 12, height: 8 },
    { width: 16, height: 8 },
    { width: 20, height: 8 },

    { width: 15, height: 10 },
    { width: 20, height: 10 },
    { width: 25, height: 10 },
  ],
});
