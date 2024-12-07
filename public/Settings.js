"use strict";

const EXPERIMENT_TYPE = EX_TYPE.RECIPROCAL;

const INPUT = test.INPUT_4_PARAMS;

const AMPLITUDE_LIST = test.AMPL;

const DIRECTION_LIST = test.ANGLES;

const TRIALS_PER_BREAK = test.TRIALS_PER_BREAK;

/** SETTINGS FOR RECIPROCAL EXPERIMENT ONLY START */

const START_HIT_MANDATORY = true;

const INTERRUPT_RECIPROCAL_GROUP = true;

const TRAVELS_NUMBER = test.TRAVELS;

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

const USER = 10;

const MAX_SCREEN_DISTANCE = 60; // max percentage of screen distance

const ENABLE_FULL_SCREEN = false;
const START_SIZE = 10;

const TOP_MARGIN_PX = mmToPixels(10);
const OTHER_MARGINS_PX = mmToPixels(5);
