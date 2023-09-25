class Trial {
  constructor(trialId, shape, trialDirection, intDevice, startIndex, targetIndex, startSize, targetWidth, targetHeight, amplitude) {
    this.trialId = trialId;                            // give ID for each trial so that it cxan be tracked after shuffle
    this.shape = shape;                               // show which shap will be used in the experiment "Rectangle" , "Circle"
    this.trialDirection = trialDirection;            // show interaction direction "UP", "Down" , "Right" , "Left"
    this.intDevice = intDevice ;                     // show the device used during the experiment "Mouse" , "Touch"  , "Laser Pointer"      
    this.startIndex = startIndex;
    this.targetIndex = targetIndex;
    this.amplitude = amplitude;
    this.targetWidth = targetWidth;
    this.targetHeight = targetHeight;
    this.startSize = startSize;
}

}
