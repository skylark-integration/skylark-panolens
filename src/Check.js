define(['./Constants'], function (Constants) {
    'use strict';
    if (THREE.REVISION != Constants.THREE_REVISION) {
        console.warn(`three.js version is not matched. Please consider use the target revision ${ Constants.THREE_REVISION }`);
    }
});