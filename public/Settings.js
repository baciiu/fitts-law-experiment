const INPUT = [{ width: 10, height: 10 }];
const AMPLITUDE_LIST = [36, 20];

const START_SIZE = 10; // if input has 2 parameters and discrete exp
const RADIAN_START = 0;
const RADIAN_STEP = 180;
const DIRECTION_LIST = [0, 22.5];
// 90 => [0,90,180,270] // 4 directions

const EXPERIMENT_TYPE = EX_TYPE.RECIPROCAL;

const TRIALS_PER_BREAK = 20;

/** SETTINGS FOR RECIPROCAL EXPERIMENT ONLY START */
const START_HIT_NOT_MANDATORY = true;

const INTERRUPT_RECIPROCAL_GROUP = true;

const TRAVELS_NUMBER = 2;

/** SETTINGS FOR RECIPROCAL EXPERIMENT ONLY END */

const SCRAMBLE_BLOCKS = false;

const BLOCKS_NUMBER = 1;

const REPETITION_PER_TRIAL = 2; // starting from 1
const FAILED_TRIAL_THRESHOLD = 4; // divide amplitude by threshold

const HIT_ON_PRESS_AND_RELEASE = true;

const REP_PRESS_OUT_REL_OUT = true;
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
const AMBIGUITY_MARGIN_PX = mmToPixels(20);
