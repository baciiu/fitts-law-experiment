const INPUT = test.INPUT_2;
const AMPLITUDE_LIST = test.AMPL;

const START_SIZE = 10;
const RADIAN_START = 0;
const RADIAN_STEP = 180;
const DIRECTION_LIST = test.ANGLES;
// 90 => [0,90,180,270] // 4 directions

const EXPERIMENT_TYPE = EX_TYPE.RECIPROCAL;

const TRIALS_PER_BREAK = 100;

/** SETTINGS FOR RECIPROCAL EXPERIMENT ONLY START */
const START_HIT_MANDATORY = true;

const INTERRUPT_RECIPROCAL_GROUP = true;

const TRAVELS_NUMBER = test.TRAVELS; // first one is the 0 travel

/** SETTINGS FOR RECIPROCAL EXPERIMENT ONLY END */

const SCRAMBLE_BLOCKS = false;

const BLOCKS_NUMBER = test.BLOCKS;

const REPETITION_PER_TRIAL = test.REP;

const FAILED_TRIAL_THRESHOLD = 4;

const HIT_ON_PRESS_AND_RELEASE = true;

const REP_PRESS_OUT_REL_OUT = false;
const REP_PRESS_OUT_REL_IN = false;
const REP_PRESS_IN_REL_OUT = false;
const REP_PRESS_IN_REL_IN = false;

const USE_CENTER_OF_SCREEN = true;

const DEVICE_TYPE = DEV_TYPE.MOUSE;

const USER = 8;

const MAX_SCREEN_DISTANCE = 60; // max percentage of screen distance

const ENABLE_FULL_SCREEN = false;

const TOP_MARGIN_PX = mmToPixels(10);
const OTHER_MARGINS_PX = mmToPixels(5);
