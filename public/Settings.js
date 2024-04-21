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
  /*{ width: 20, height: 10 },
              { width: 15, height: 15 },
              { width: 10, height: 20 },
              { width: 15, height: 10 },*/
];
const AMPLITUDE_LIST = [100, 54];

const ENABLE_FULL_SCREEN = false;

const MAX_SCREEN_DISTANCE = mmToPixels(600);

const START_SIZE = 10; // if input has 2 parameters and discrete exp
const RADIAN_START = 0;
const RADIAN_STEP = 90; // => [0,90,180,270]; 180 => [0,180] /  Left and Right

const DEVICE_TYPE = DEV_TYPE.MOUSE;
const EXPERIMENT_TYPE = EX_TYPE.RECIPROCAL;
const SCRAMBLE_BLOCKS = true;

const TRIALS_PER_BREAK = 4;
const BLOCKS_NUMBER = 1;
const REPETITION_PER_TRIAL = 4;

const HIT_ON_PRESS_AND_RELEASE = false;

const REP_PRESS_OUT_REL_OUT = false;
const REP_PRESS_OUT_REL_IN = true;
const REP_PRESS_IN_REL_OUT = false;
const REP_PRESS_IN_REL_IN = false;

const USER = 5;

const TOP_MARGIN_PX = mmToPixels(5);
const OTHER_MARGINS_PX = mmToPixels(3);
const FAILED_TRIAL_THRESHOLD = 4; // divide amplitude by threshold
const AMBIGUITY_MARGIN_PX = mmToPixels(20);
