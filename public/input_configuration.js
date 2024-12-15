const input = Object.freeze({
  TRIALS_PER_BREAK: 100,

  BLOCKS: 2,

  REP: 3,

  TRAVELS: 2,

  AMPL: [36],

  ANGLES: [0, 12],

  INPUT_2_PARAMS: [
    { width: 10, height: 8 },
    { width: 10, height: 20 },
  ],

  INPUT_4_PARAMS: [
    { width: 10, height: 10, angle: 90, amplitude: 36 },
    { width: 20, height: 20, angle: 180, amplitude: 54 },
  ],
});

const test = Object.freeze({
  TRIALS_PER_BREAK: 100,

  BLOCKS: 2,

  REP: 3, // +1 when counting

  TRAVELS: 2, // +1 when counting

  AMPL: [36],

  ANGLES: [0, 12],

  INPUT_2_PARAMS: [
    { width: 10, height: 4 },
    { width: 10, height: 4 },
    // { width: 10, height: 4 },
  ],

  INPUT_4_PARAMS: [
    { width: 10, height: 10, angle: 90, amplitude: 36 },
    { width: 20, height: 20, angle: 180, amplitude: 54 },
    //{ width: 12, height: 8, angle: 270, amplitude: 80 },
  ],
});

const UIST20 = Object.freeze({
  // page 862 from " Modeling 2 Dimensional Touch Pointing "

  TRIALS_PER_BREAK: 100,

  BLOCKS: 1,

  REP: 6,

  TRAVELS: 5,

  AMPL: [36, 54, 80],

  //   0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5,
  //   180, 202.5, 225, 27.5, 270, 292.5, 315, 337.5,
  ANGLES: [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5],

  INPUT_2_PARAMS: [
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
  INPUT_4_PARAMS: [],
});
