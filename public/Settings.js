"use strict";

const EXPERIMENT_TYPE = EX_TYPE.DISCRETE;

const INPUT = input.INPUT_4_PARAMS;

const AMPLITUDE_LIST = input.AMPL;

const DIRECTION_LIST = input.ANGLES;

const TRIALS_PER_BREAK = input.TRIALS_PER_BREAK;

/** SETTINGS FOR RECIPROCAL EXPERIMENT ONLY START */

const START_HIT_MANDATORY = true;

const INTERRUPT_RECIPROCAL_GROUP = true;

const TRAVELS_NUMBER = input.TRAVELS;

/** SETTINGS FOR RECIPROCAL EXPERIMENT ONLY END */

const SCRAMBLE_BLOCKS = true;

const BLOCKS_NUMBER = input.BLOCKS;

const REPETITION_PER_TRIAL = input.REP;

const FAILED_TRIAL_THRESHOLD = 2; // amplitude/2

const HIT_ON_PRESS_AND_RELEASE = true;

const REP_PRESS_OUT_REL_OUT = false;
const REP_PRESS_OUT_REL_IN = false;
const REP_PRESS_IN_REL_OUT = false;
const REP_PRESS_IN_REL_IN = false;

const USE_CENTER_OF_SCREEN = false;

const DEVICE_TYPE = DEV_TYPE.MOUSE;

const USER = 8;

const MAX_SCREEN_DISTANCE = 60; // max percentage of screen distance

const ENABLE_FULL_SCREEN = false;
const START_SIZE = 10;

const SCREEN_WIDTH_PX = 1920; // 1512; // 1920
const SCREEN_HEIGHT_PX = 1080; // 982; // 1080

const DIAGONAL_INCH = 27; //14; // 27
const PRECISION_OFFSET = -1.2;

const TOP_MARGIN_PX = mmToPixels(10);
const OTHER_MARGINS_PX = mmToPixels(5);
