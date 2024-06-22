const INPUT = [
  { width: 4, height: 4 },
  /*{ width: 8, height: 8 },
                  { width: 10, height: 10 },
                
                  { width: 4, height: 6 },*/
  /* { width: 4, height: 8 },
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
                         { width: 25, height: 10 },*/
  /*{ width: 6, height: 6 },
                                                                                                              { width: 6, height: 10 },
                                                                                                              { width: 6, height: 12 },
                                                                                                              { width: 8, height: 8 },
                                                                                                              { width: 8, height: 12 },
                                                                  { width: 4, height: 4 },
                                                                  { width: 8, height: 8 },
                                                                  { width: 10, height: 10 },
                                                                  // { width: 10, height: 12 },
                                                                  //  { width: 12, height: 12 },*/

  /*{ width: 10, height: 10, angle: 0, amplitude: 100 },
                                                                                                                                  { width: 15, height: 15, angle: 180, amplitude: 100 },
                                                                                                                                  { width: 20, height: 20, angle: 0, amplitude: 100 },
                                                                                                                                  { width: 8, height: 8, angle: 180, amplitude: 100 },
                                                                                                                                  { width: 20, height: 20, angle: 0, amplitude: 100 },
                                                                                                                                  { width: 20, height: 20, angle: 90, amplitude: 100 },
                                                                                                                                  { width: 10, height: 20, angle: 270, amplitude: 100 },
                                                                                                                                  { width: 8, height: 8, angle: 180, amplitude: 100 },
                                                                                                                                  { width: 20, height: 20, angle: 90, amplitude: 100 },
                                                                                                                                  { width: 15, height: 15, angle: 270, amplitude: 100 },
                                                                                                                                  { width: 20, height: 10 },
                                                                                                                                  { width: 15, height: 15 },
                                                                                                                                  { width: 10, height: 20 },
                                                                                                                                  { width: 15, height: 10 },*/
];
const AMPLITUDE_LIST = [36];

const START_SIZE = 10; // if input has 2 parameters and discrete exp
const RADIAN_START = 0;
const RADIAN_STEP = 180;
const DIRECTION_LIST = [
  0, 22.5,

  /*
                        0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5,
                        315, 337.5,*/
];
// 90 => [0,90,180,270] // 4 directions
// 180 => [0,180]  // 2 directions

const DEVICE_TYPE = DEV_TYPE.MOUSE;
const EXPERIMENT_TYPE = EX_TYPE.DISCRETE;

const TRIALS_PER_BREAK = 20;

const START_HIT_NOT_MANDATORY = true; // works only with reciprocal exp

const INTERRUPT_RECIPROCAL_GROUP = true;

const SCRAMBLE_BLOCKS = false;

const BLOCKS_NUMBER = 1;

const REPETITION_PER_TRIAL = 2; // starting from 1

const TRAVELS_NUMBER = 6;

const HIT_ON_PRESS_AND_RELEASE = true;

const REP_PRESS_OUT_REL_OUT = true;
const REP_PRESS_OUT_REL_IN = false;
const REP_PRESS_IN_REL_OUT = false;
const REP_PRESS_IN_REL_IN = false;

const FAILED_TRIAL_THRESHOLD = 4; // divide amplitude by threshold

const USER = 8;

const USE_CENTER_OF_SCREEN = true;

const MAX_SCREEN_DISTANCE = 60; // max percentage of screen distance

const ENABLE_FULL_SCREEN = false;

const TOP_MARGIN_PX = mmToPixels(10);
const OTHER_MARGINS_PX = mmToPixels(5);
const AMBIGUITY_MARGIN_PX = mmToPixels(20);
