const INPUT = [
  { width: 10, height: 10, angle: 0, amplitude: 100 },
  { width: 15, height: 15, angle: 180, amplitude: 100 },
  { width: 20, height: 20, angle: 0, amplitude: 100 },
  { width: 8, height: 8, angle: 180, amplitude: 100 },
  { width: 20, height: 20, angle: 0, amplitude: 100 },
  { width: 20, height: 20, angle: 90, amplitude: 100 },
  { width: 10, height: 20, angle: 270, amplitude: 100 },
  { width: 8, height: 8, angle: 180, amplitude: 100 },
  { width: 20, height: 20, angle: 90, amplitude: 100 },
  { width: 15, height: 15, angle: 270, amplitude: 100 },

  /**
     { width: 20, height: 10 },
     { width: 15, height: 15 },
     { width: 10, height: 20 },
     { width: 15, height: 10 },
     **/
];

const ENABLE_FULL_SCREEN = false;
const MAX_DISTANCE_START_TARGET_PERCENTAGE = 30;
const DEVICE_TYPE = DEV_TYPE.MOUSE;
const EXPERIMENT_TYPE = EX_TYPE.DISCRETE;
const USER = 5;
const START_SIZE = 10; // if input has 2 parameters and discrete exp
const REPETITION_PER_TRIAL = 3;
const TRIALS_PER_BREAK = 100;
const BLOCKS_NUMBER = 2;
const RADIAN_START = 0;
const RADIAN_STEP = 180; // => [0,90,180,270]; 180 => [0,180] /  Left and Right
const AMPLITUDE_LIST = [100, 54];
