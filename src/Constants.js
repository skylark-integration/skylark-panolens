define([], function () {
    'use strict';
    const REVISION = "11";
    const VERSION = "0";
    const THREE_REVISION = "105";
    const THREE_VERSION = "0";
    const CONTROLS = {
        ORBIT: 0,
        DEVICEORIENTATION: 1
    };
    const MODES = {
        UNKNOWN: 0,
        NORMAL: 1,
        CARDBOARD: 2,
        STEREO: 3
    };
    return {
        REVISION: REVISION,
        VERSION: VERSION,
        THREE_REVISION: THREE_REVISION,
        THREE_VERSION: THREE_VERSION,
        CONTROLS: CONTROLS,
        MODES: MODES
    };
});