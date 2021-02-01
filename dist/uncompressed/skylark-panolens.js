/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-panolens/panolens',[
	"skylark-langx/skylark"
], function (skylark) {

    return skylark.attach("intg.panolens",{
    });
});
define('skylark-panolens/Constants',[], function () {
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
define('skylark-panolens/DataImage',[],function () {
    'use strict';
    const DataImage = {
        Info: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADBklEQVR42u2bP08UQRiHnzFaSYCI/xoksdBIqGwIiYWRUBISExpCQ0ej38FWOmlIKKhoMPEbaCxsrrHiYrQgOSlQEaICrT+LHSPZzNzt3s3c3Hn7lHvLzvv82L2dm30XKioqKgYY062BJF0HpoA7wARwBbhsPz4DjoEG8AnYNcZ8Sx1Op8IXJM1KWpdUV3nq9m9nJV1I7VNGfEzSM0mNNqR9NOwxx1L7NRMflbQm6SSgeJ4TO8Zoat+8/LKkg4jieQ4kLaf2RtKwpJ0uiufZkTScSn5S0l5C+b/sSZrstvyMpKPU5uc4kjTTjkvpeYCkaeA1/+7hvcIZMGuMqUULQNIU8Aa4ltrWwyHwyBizGzwASSPAe+B2assW7AH3jTE/i+xcZoa12Qfy2Bo3i+5cKABl99zF1GYlWFTBeULLS0DZrOsDcDNggTXgc27bLWA64BhfgHvGmB8dHUXZ1DM0S45xliKMs9bKr+klIOkqsBrwv9JtVq1DewEAT4Ch1BYdMGQdygeg7Df4SmqDAKyoyXpCszPgITCeuvoAjFuX0gE8jljUdv7bCtiOOJ7XpdUZ8L/gdXHOA5QtYH5NXXVgbrgWWn1nwFTqaiPgdPIFcDd1tRFwOl307DwRuZgXwLvctgfA04hjOp18AcReZ6sZY16e3yDpUuQxnU6+S2AkcjEpcDr1zxOXSPgCKLSa0mc4nXwB/EpdbQScTr4AGqmrjYDTyRfAx9TVRsDp5Aug8LJyH+F0cgZg58z11BUHpO5ruGh2G3ybuuqAeF2aBfAqddUB8bq0OgP2U1cegH3aOQOMMb+BrdTVB2DLupQLwLIOnKY26IBT6+ClaQDGmO/ARmqLDtiwDn7HVkcY+EdjNoTlCI+tYhO2iUppm6HKslPUq2qQKHpUe8AFsjaUXuUQWCgqXyoAG8IuME/WkNRrnAHzZfqDSgdgQ6gBc2Td3b3CMTBXtkOsIzTIjZLnQhjcVtlcEIPZLJ0LoVvt8s/Va+3yuSAG84UJRxB98cpM9dJURUVFxSDzBxKde4Lk3/h2AAAAAElFTkSuQmCC',
        Arrow: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADPklEQVR42u2bMUscQRiG30/SRaJEI1ZKUiRErNIELRUbQYSAnX8hpVUgkDYp0wgWVjYW+QcJaQzYpLojJIXhtDDEKBpj65ti58ixmdmb2ZvZ7+T2AUHudmfmeXf2bnb3O6CmpqZmgJGqOiI5AWAWwEMA0wDuArht3r4CcAagBeAbgIaI/NQOp1fhIZKLJN+SbDKcptl3keSQtk+I+BjJVyRbJaRdtEybY9p+ReKjJN+QvIwonufS9DGq7ZuXXyd5nFA8zzHJdW1vkLxDcrdC8Ty7JO9oyc+QPFCUb3NAcqZq+TmSp9rmHZySnCvjErwOIPkUwHv8+w7vF64ALIrIfrIASM4C+ADgnratgxMACyLSiB4AyREAnwE80LbswgGAJyJy4bNxyApr6wbIw4xxy3djrwCYfeeuaZsFsEbPdULXU4DZqusLgMkEA21P05EEbf8A8FhEzos28pkBLxLKL5s/r/M1kEkz9vKQHGeatf05yfmOfubNa7G5JDle5NhtBjwHMBz5yFwAWBaRT+0XzP8pZsKwcQiH2fX8Ycojb+kzxUw4ZJn7CSQXqpRPHMKCq7+iZJ71Mvdy/DftXSQ6HcJdSDaqPPKW/mPOBO+lcbvzCU35RCFM2PpwnQKzZQfdgfe0dxH5dLA6uQJ4pC2fIASrkyuA6X6QjxyC1ckVQNn7bNHlI4ZgdXIFUObiJJl8pBCsTjGfuIwA2Cv4FN7xbYjkjqsRAHuIePXoCiDF1Zk2VidXAL+1R5sAq5MrgJb2aBNgdXIF8FV7tAmwOrkCCFs73wysTtYATHFCU3vEEWm6Ci6KvgY/ao86Ik6XogDeaY86Ik6XbjPgSHvkEThCwQy45XpDRK5JbgN4GWkgUyR9H65MRQxgW0SunZ5FezK7pfwd8e8MV8UfAPdF5Jdrg8JrAbPjprZFD2wWyQP6j8ZSEufRmGlgQ9umBBvd5IOgbjFUKLu+XnWBhG+rpsFVZGUo/coJgFVf+aAATAgNACvICpL6jSsAKyH1QcEBmBD2ASwhq+7uF84ALIVWiPUEB7lQsiOEwS2VzQUxmMXSuRCqKpd/zX4rl88FMZg/mLAEcSN+MlP/aKqmpqZmkPkL0hSjwOpNKxwAAAAASUVORK5CYII=',
        FullscreenEnter: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik03IDE0SDV2NWg1di0ySDd2LTN6bS0yLTRoMlY3aDNWNUg1djV6bTEyIDdoLTN2Mmg1di01aC0ydjN6TTE0IDV2MmgzdjNoMlY1aC01eiIvPgo8L3N2Zz4=',
        FullscreenLeave: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTE0LDE0SDE5VjE2SDE2VjE5SDE0VjE0TTUsMTRIMTBWMTlIOFYxNkg1VjE0TTgsNUgxMFYxMEg1VjhIOFY1TTE5LDhWMTBIMTRWNUgxNlY4SDE5WiIgLz48L3N2Zz4=',
        VideoPlay: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTgsNS4xNFYxOS4xNEwxOSwxMi4xNEw4LDUuMTRaIiAvPjwvc3ZnPg==',
        VideoPause: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTE0LDE5LjE0SDE4VjUuMTRIMTRNNiwxOS4xNEgxMFY1LjE0SDZWMTkuMTRaIiAvPjwvc3ZnPg==',
        WhiteTile: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIABAMAAAAGVsnJAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAACRQTFRFAAAAAAAABgYGBwcHHh4eKysrx8fHy8vLzMzM7OzsAAAABgYG+q7SZgAAAAp0Uk5TAP7+/v7+/v7+/iJx/a8AAAOwSURBVHja7d0hbsNAEAVQo6SFI6XEcALDcgNLvUBvEBQVhpkWVYWlhSsVFS7t5QIshRt695lEASZP+8c7a1kzDL1fz+/zyuvzp6FbvoddrL6uDd1yGZ5eXldeb18N3fIx7A+58prmhm65DfvDcd0952lu6JabFbD/zVprZj1lzcys+fj9z8xTZtbT8rv8yWlu6BYAIgAAAAAAAAAAAABAM6QXEAEAAAAAAAAAgJ2gnaAIiIA3Q2qAGgAAAAAAAAAAAAAAAAAAAAAAAAAAQJsADkVFAAAAAAA8Bj0GRUAEREAEREAEREAEREAEAAAAAAAAAAB2gnaCIiACPplRA9QANUAERAAAAEVQERQBERCBVlfAcZ3aeZobusUKMGBhV6KUElHGKBERJR6/fxExRkQZl9/lT8S1oVsuhqyYMmPKjCkzvfcCpsxohrwY0Q06EAEAAAAAAAAAAACgGdILiAAAAAAAAAAAwE7QTlAERMCbITVADQAAAAAAAAAAAAAAAAAAAAAAAAAAwKmwQ1ERAAAAAACPQY9BERABERABERABERABERABAAAAAAAAAICdoJ2gCIiAT2bUADVADRABEQAAQBFUBEVABERgEyvAlJm+V4ApM6bMmDJjyowpM6bMdN0LmDKjGfJiRDfoQAQAAAAAAAAAAACAZkgvIAIAAAAAAAAAADtBO0EREAFvhtQANQAAAAAAAAAAAAAAAAAAAAAAAAAAAKfCDkVFAAAAAAA8Bj0GRUAEREAEREAEREAEREAEAAAAAAAAAAB2gnaCIiACPplRA9QANUAERAAAAEVQERQBERCBTawAU2b6XgGmzJgyY8qMKTOmzJgy03UvYMqMZsiLEd2gAxEAAAAAAAAAAAAAmiG9gAgAAAAAAAAAAOwE7QRFQAS8GVID1AAAAAAAAAAAAAAAAAAAAAAAAAAAAJwKOxQVAQAAAADwGPQYFAEREAEREAEREAEREAERAAAAAAAAAADYCdoJioAI+GRGDVAD1AAREAEAABRBRVAEREAENrECTJnpewWYMmPKjCkzpsyYMmPKTNe9gCkzmiEvRnSDDkQAAAAAAAAAAAAAaIb0AiIAAAAAAAAAALATtBMUARHwZkgNUAMAAAAAAAAAAAAAAAAAAAAAAAAAAHAq7FBUBAAAAADAY9BjUAREQAREQAREQAREQAREAAAAAAAAAABgJ2gnKAIi4JMZNUANUANEQAQAAFAEFUEREAER2MQKMGWm7xVgyowpM50PWen9ugNGXz1XaocAFgAAAABJRU5ErkJggg==',
        Setting: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADn0lEQVR42u2bzUsVURjGnyO6CPzAMnTjppAo3LTwH1CqTfaxbeOiRS37A0wXtROFVi1aRBs3LWohSIGbQAQXViBGRhG0UIRKUCpK7q/FnOB2uc6cOXNmRnGe3eW+H8/7zLln3vNxpQoVKlQ4wjBFJAFOSRqX1O7osivpvjHmU1nChBZglvSYLYJbS0EanCvIJzWK+gnsyH34/8OuMaYjb265jwCgz6N4SWq3vodbAEmnS/KtBDgoAgyU5BteAOAkMAPcBroc7PskDWfgN+wyDwBdltMMcDI3tYBnde/pHeARMNTErgd4APzweP834oeN1dMkz5DlsFNn/yyv4kdiSK4At4AO4CqwGaDwRmza2B0210qM7YhrXU59ANAq6bWkwQTTn5KO5fIE0uVYlXTeGLOXFMx1DrjlULwKKN41x6DlnIjEEQCckPRe0okCiguJr5LOGGO+xhm5jICJQ1i8LOeJJKPYEQAMKvrtt5ZdjSf2FM0Fq/sZJI2A6UNcvCz36TiDfUcAcE1SPu/U6Mm8k/TFfu6XdFb5iX3dGPM8lQfwNod3+TowBnQ3yddtv1vPIe+b1JIBiwEJ1IAJ208k5W21trWA+V/5CHAcmAtU/A2P/DcCiTAHHE8tgCVhgLvAXgYCk17Jo/yTGfLuWe7Zd72AC8CWB4n3OAz7mLytNkZabAEXMhfeQKYfWEpJZCxA3rGUOZeA/qDF15FpAz47EvlNk9neI2e3jeWCz0BbmvipNkSMMX8kuSZYM8Z8zyqAjbHmaN5mOeYjgIXrU93MWrxHrNQjrqiDkQMLHwG+OdqF3NN3jeXKzU8AoF1SzdH8XKhJUO7HZDXLMbwAwICkJUULFxe0SbqSVQAbw3Xi7Ze0ZLmGAzAKbHs0JGU1QtvAaIjCW4B7ZOvJy2qFa5a730RPtBiaz0CgnkiZi6F5fBZDVMvho7EhcuS3xJJ2hV9IupgTqaLw0hhzab8vq23xOG/r+LDsKjLgYVzxUnU0ltwK2wDezUyJmEwqXgp/PL4rvxthaeCSI+zxuA10J8ZkWdJNSb2SLkvayKHwDRu71+ZajrG941J8agALDQ3GU/a/IvMkYCPzmCbtLNEVmacNtgs5iP9fYVNEV1Q6Hez7yNZSL+J2SarTcpqiyV2iUkG0IvPFvbz5FbEn+KEk3wMjwMeSfCsBXFBdly9CAPk9ydyffpECuB5tZfVJjaKWueOSfinln6YK4lahQoUKRxd/AcRPGTcQCAUQAAAAAElFTkSuQmCC',
        ChevronRight: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTguNTksMTYuNThMMTMuMTcsMTJMOC41OSw3LjQxTDEwLDZMMTYsMTJMMTAsMThMOC41OSwxNi41OFoiIC8+PC9zdmc+',
        Check: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIxLDdMOSwxOUwzLjUsMTMuNUw0LjkxLDEyLjA5TDksMTYuMTdMMTkuNTksNS41OUwyMSw3WiIgLz48L3N2Zz4=',
        ViewIndicator: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBpZD0idmlldy1pbmRpY2F0b3IiIGhlaWdodD0iMzAiIHdpZHRoPSIzMCIgdmlld0JveD0iLTIuNSAtMSAzMCAzMCI+Cgk8c3R5bGUgdHlwZT0idGV4dC9jc3MiPi5zdDB7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlLW1pdGVybGltaXQ6MTA7ZmlsbDpub25lO30uc3Qxe3N0cm9rZS13aWR0aDo2O3N0cm9rZS1taXRlcmxpbWl0OjEwO30KCTwvc3R5bGU+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNIDEyLjUgMCBBIDEyLjUgMTIuNSAwIDAgMCAtMTIuNSAwIEEgMTIuNSAxMi41IDAgMCAwIDEyLjUgMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwxMywxNS41KSI+PC9wYXRoPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0gMTMgMCBMIDEwIDIgTCAxNiAyIFoiPjwvcGF0aD4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNIDIgMCBBIDIgMiAwIDAgMCAtMiAwIEEgMiAyIDAgMCAwIDIgMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwxMywxNS41KSI+PC9wYXRoPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGlkPSJpbmRpY2F0b3IiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMTMsMTUuNSkiPjwvcGF0aD4KCTwvZz4KPC9zdmc+'
    };
    return DataImage;
});
define('skylark-panolens/lib/controls/OrbitControls',['skylark-threejs'], function (THREE) {
    'use strict';
    function OrbitControls(object, domElement) {
        this.object = object;
        this.domElement = domElement !== undefined ? domElement : document;
        this.frameId = null;
        this.enabled = true;
        this.target = new THREE.Vector3();
        this.center = this.target;
        this.noZoom = false;
        this.zoomSpeed = 1;
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.minZoom = 0;
        this.maxZoom = Infinity;
        this.noRotate = false;
        this.rotateSpeed = -0.15;
        this.noPan = true;
        this.keyPanSpeed = 7;
        this.autoRotate = false;
        this.autoRotateSpeed = 2;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.momentumDampingFactor = 0.9;
        this.momentumScalingFactor = -0.005;
        this.momentumKeydownFactor = 20;
        this.minFov = 30;
        this.maxFov = 120;
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;
        this.noKeys = false;
        this.keys = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            BOTTOM: 40
        };
        this.mouseButtons = {
            ORBIT: THREE.MOUSE.LEFT,
            ZOOM: THREE.MOUSE.MIDDLE,
            PAN: THREE.MOUSE.RIGHT
        };
        var scope = this;
        var EPS = 1e-7;
        var MEPS = 0.0001;
        var rotateStart = new THREE.Vector2();
        var rotateEnd = new THREE.Vector2();
        var rotateDelta = new THREE.Vector2();
        var panStart = new THREE.Vector2();
        var panEnd = new THREE.Vector2();
        var panDelta = new THREE.Vector2();
        var panOffset = new THREE.Vector3();
        var offset = new THREE.Vector3();
        var dollyStart = new THREE.Vector2();
        var dollyEnd = new THREE.Vector2();
        var dollyDelta = new THREE.Vector2();
        var theta = 0;
        var phi = 0;
        var phiDelta = 0;
        var thetaDelta = 0;
        var scale = 1;
        var pan = new THREE.Vector3();
        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();
        var momentumLeft = 0, momentumUp = 0;
        var eventPrevious;
        var momentumOn = false;
        var keyUp, keyBottom, keyLeft, keyRight;
        var STATE = {
            NONE: -1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_DOLLY: 4,
            TOUCH_PAN: 5
        };
        var state = STATE.NONE;
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;
        var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();
        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start' };
        var endEvent = { type: 'end' };
        this.setLastQuaternion = function (quaternion) {
            lastQuaternion.copy(quaternion);
            scope.object.quaternion.copy(quaternion);
        };
        this.getLastPosition = function () {
            return lastPosition;
        };
        this.rotateLeft = function (angle) {
            if (angle === undefined) {
                angle = getAutoRotationAngle();
            }
            thetaDelta -= angle;
        };
        this.rotateUp = function (angle) {
            if (angle === undefined) {
                angle = getAutoRotationAngle();
            }
            phiDelta -= angle;
        };
        this.panLeft = function (distance) {
            var te = this.object.matrix.elements;
            panOffset.set(te[0], te[1], te[2]);
            panOffset.multiplyScalar(-distance);
            pan.add(panOffset);
        };
        this.panUp = function (distance) {
            var te = this.object.matrix.elements;
            panOffset.set(te[4], te[5], te[6]);
            panOffset.multiplyScalar(distance);
            pan.add(panOffset);
        };
        this.pan = function (deltaX, deltaY) {
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
            if (scope.object instanceof THREE.PerspectiveCamera) {
                var position = scope.object.position;
                var offset = position.clone().sub(scope.target);
                var targetDistance = offset.length();
                targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180);
                scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
                scope.panUp(2 * deltaY * targetDistance / element.clientHeight);
            } else if (scope.object instanceof THREE.OrthographicCamera) {
                scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
                scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight);
            } else {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
            }
        };
        this.momentum = function () {
            if (!momentumOn)
                return;
            if (Math.abs(momentumLeft) < MEPS && Math.abs(momentumUp) < MEPS) {
                momentumOn = false;
                return;
            }
            momentumUp *= this.momentumDampingFactor;
            momentumLeft *= this.momentumDampingFactor;
            thetaDelta -= this.momentumScalingFactor * momentumLeft;
            phiDelta -= this.momentumScalingFactor * momentumUp;
        };
        this.dollyIn = function (dollyScale) {
            if (dollyScale === undefined) {
                dollyScale = getZoomScale();
            }
            if (scope.object instanceof THREE.PerspectiveCamera) {
                scale /= dollyScale;
            } else if (scope.object instanceof THREE.OrthographicCamera) {
                scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
                scope.object.updateProjectionMatrix();
                scope.dispatchEvent(changeEvent);
            } else {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            }
        };
        this.dollyOut = function (dollyScale) {
            if (dollyScale === undefined) {
                dollyScale = getZoomScale();
            }
            if (scope.object instanceof THREE.PerspectiveCamera) {
                scale *= dollyScale;
            } else if (scope.object instanceof THREE.OrthographicCamera) {
                scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
                scope.object.updateProjectionMatrix();
                scope.dispatchEvent(changeEvent);
            } else {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            }
        };
        this.update = function (ignoreUpdate) {
            var position = this.object.position;
            offset.copy(position).sub(this.target);
            offset.applyQuaternion(quat);
            theta = Math.atan2(offset.x, offset.z);
            phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
            if (this.autoRotate && state === STATE.NONE) {
                this.rotateLeft(getAutoRotationAngle());
            }
            this.momentum();
            theta += thetaDelta;
            phi += phiDelta;
            theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, theta));
            phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
            phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
            var radius = offset.length() * scale;
            radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
            this.target.add(pan);
            offset.x = radius * Math.sin(phi) * Math.sin(theta);
            offset.y = radius * Math.cos(phi);
            offset.z = radius * Math.sin(phi) * Math.cos(theta);
            offset.applyQuaternion(quatInverse);
            position.copy(this.target).add(offset);
            this.object.lookAt(this.target);
            thetaDelta = 0;
            phiDelta = 0;
            scale = 1;
            pan.set(0, 0, 0);
            if (lastPosition.distanceToSquared(this.object.position) > EPS || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {
                if (ignoreUpdate !== true) {
                    this.dispatchEvent(changeEvent);
                }
                lastPosition.copy(this.object.position);
                lastQuaternion.copy(this.object.quaternion);
            }
        };
        this.reset = function () {
            state = STATE.NONE;
            this.target.copy(this.target0);
            this.object.position.copy(this.position0);
            this.object.zoom = this.zoom0;
            this.object.updateProjectionMatrix();
            this.dispatchEvent(changeEvent);
            this.update();
        };
        this.getPolarAngle = function () {
            return phi;
        };
        this.getAzimuthalAngle = function () {
            return theta;
        };
        function getAutoRotationAngle() {
            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
        }
        function getZoomScale() {
            return Math.pow(0.95, scope.zoomSpeed);
        }
        function onMouseDown(event) {
            momentumOn = false;
            momentumLeft = momentumUp = 0;
            if (scope.enabled === false)
                return;
            event.preventDefault();
            if (event.button === scope.mouseButtons.ORBIT) {
                if (scope.noRotate === true)
                    return;
                state = STATE.ROTATE;
                rotateStart.set(event.clientX, event.clientY);
            } else if (event.button === scope.mouseButtons.ZOOM) {
                if (scope.noZoom === true)
                    return;
                state = STATE.DOLLY;
                dollyStart.set(event.clientX, event.clientY);
            } else if (event.button === scope.mouseButtons.PAN) {
                if (scope.noPan === true)
                    return;
                state = STATE.PAN;
                panStart.set(event.clientX, event.clientY);
            }
            if (state !== STATE.NONE) {
                document.addEventListener('mousemove', onMouseMove, false);
                document.addEventListener('mouseup', onMouseUp, false);
                scope.dispatchEvent(startEvent);
            }
            scope.update();
        }
        function onMouseMove(event) {
            if (scope.enabled === false)
                return;
            event.preventDefault();
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
            if (state === STATE.ROTATE) {
                if (scope.noRotate === true)
                    return;
                rotateEnd.set(event.clientX, event.clientY);
                rotateDelta.subVectors(rotateEnd, rotateStart);
                scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
                rotateStart.copy(rotateEnd);
                if (eventPrevious) {
                    momentumLeft = event.clientX - eventPrevious.clientX;
                    momentumUp = event.clientY - eventPrevious.clientY;
                }
                eventPrevious = event;
            } else if (state === STATE.DOLLY) {
                if (scope.noZoom === true)
                    return;
                dollyEnd.set(event.clientX, event.clientY);
                dollyDelta.subVectors(dollyEnd, dollyStart);
                if (dollyDelta.y > 0) {
                    scope.dollyIn();
                } else if (dollyDelta.y < 0) {
                    scope.dollyOut();
                }
                dollyStart.copy(dollyEnd);
            } else if (state === STATE.PAN) {
                if (scope.noPan === true)
                    return;
                panEnd.set(event.clientX, event.clientY);
                panDelta.subVectors(panEnd, panStart);
                scope.pan(panDelta.x, panDelta.y);
                panStart.copy(panEnd);
            }
            if (state !== STATE.NONE)
                scope.update();
        }
        function onMouseUp() {
            momentumOn = true;
            eventPrevious = undefined;
            if (scope.enabled === false)
                return;
            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
            scope.dispatchEvent(endEvent);
            state = STATE.NONE;
        }
        function onMouseWheel(event) {
            if (scope.enabled === false || scope.noZoom === true || state !== STATE.NONE)
                return;
            event.preventDefault();
            event.stopPropagation();
            var delta = 0;
            if (event.wheelDelta !== undefined) {
                delta = event.wheelDelta;
            } else if (event.detail !== undefined) {
                delta = -event.detail;
            }
            if (delta > 0) {
                scope.object.fov = scope.object.fov < scope.maxFov ? scope.object.fov + 1 : scope.maxFov;
                scope.object.updateProjectionMatrix();
            } else if (delta < 0) {
                scope.object.fov = scope.object.fov > scope.minFov ? scope.object.fov - 1 : scope.minFov;
                scope.object.updateProjectionMatrix();
            }
            scope.update();
            scope.dispatchEvent(changeEvent);
            scope.dispatchEvent(startEvent);
            scope.dispatchEvent(endEvent);
        }
        function onKeyUp(event) {
            switch (event.keyCode) {
            case scope.keys.UP:
                keyUp = false;
                break;
            case scope.keys.BOTTOM:
                keyBottom = false;
                break;
            case scope.keys.LEFT:
                keyLeft = false;
                break;
            case scope.keys.RIGHT:
                keyRight = false;
                break;
            }
        }
        function onKeyDown(event) {
            if (scope.enabled === false || scope.noKeys === true || scope.noRotate === true)
                return;
            switch (event.keyCode) {
            case scope.keys.UP:
                keyUp = true;
                break;
            case scope.keys.BOTTOM:
                keyBottom = true;
                break;
            case scope.keys.LEFT:
                keyLeft = true;
                break;
            case scope.keys.RIGHT:
                keyRight = true;
                break;
            }
            if (keyUp || keyBottom || keyLeft || keyRight) {
                momentumOn = true;
                if (keyUp)
                    momentumUp = -scope.rotateSpeed * scope.momentumKeydownFactor;
                if (keyBottom)
                    momentumUp = scope.rotateSpeed * scope.momentumKeydownFactor;
                if (keyLeft)
                    momentumLeft = -scope.rotateSpeed * scope.momentumKeydownFactor;
                if (keyRight)
                    momentumLeft = scope.rotateSpeed * scope.momentumKeydownFactor;
            }
        }
        function touchstart(event) {
            momentumOn = false;
            momentumLeft = momentumUp = 0;
            if (scope.enabled === false)
                return;
            switch (event.touches.length) {
            case 1:
                if (scope.noRotate === true)
                    return;
                state = STATE.TOUCH_ROTATE;
                rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;
            case 2:
                if (scope.noZoom === true)
                    return;
                state = STATE.TOUCH_DOLLY;
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                dollyStart.set(0, distance);
                break;
            case 3:
                if (scope.noPan === true)
                    return;
                state = STATE.TOUCH_PAN;
                panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;
            default:
                state = STATE.NONE;
            }
            if (state !== STATE.NONE)
                scope.dispatchEvent(startEvent);
        }
        function touchmove(event) {
            if (scope.enabled === false)
                return;
            event.preventDefault();
            event.stopPropagation();
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
            switch (event.touches.length) {
            case 1:
                if (scope.noRotate === true)
                    return;
                if (state !== STATE.TOUCH_ROTATE)
                    return;
                rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                rotateDelta.subVectors(rotateEnd, rotateStart);
                scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
                rotateStart.copy(rotateEnd);
                if (eventPrevious) {
                    momentumLeft = event.touches[0].pageX - eventPrevious.pageX;
                    momentumUp = event.touches[0].pageY - eventPrevious.pageY;
                }
                eventPrevious = {
                    pageX: event.touches[0].pageX,
                    pageY: event.touches[0].pageY
                };
                scope.update();
                break;
            case 2:
                if (scope.noZoom === true)
                    return;
                if (state !== STATE.TOUCH_DOLLY)
                    return;
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                dollyEnd.set(0, distance);
                dollyDelta.subVectors(dollyEnd, dollyStart);
                if (dollyDelta.y < 0) {
                    scope.object.fov = scope.object.fov < scope.maxFov ? scope.object.fov + 1 : scope.maxFov;
                    scope.object.updateProjectionMatrix();
                } else if (dollyDelta.y > 0) {
                    scope.object.fov = scope.object.fov > scope.minFov ? scope.object.fov - 1 : scope.minFov;
                    scope.object.updateProjectionMatrix();
                }
                dollyStart.copy(dollyEnd);
                scope.update();
                scope.dispatchEvent(changeEvent);
                break;
            case 3:
                if (scope.noPan === true)
                    return;
                if (state !== STATE.TOUCH_PAN)
                    return;
                panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                panDelta.subVectors(panEnd, panStart);
                scope.pan(panDelta.x, panDelta.y);
                panStart.copy(panEnd);
                scope.update();
                break;
            default:
                state = STATE.NONE;
            }
        }
        function touchend() {
            momentumOn = true;
            eventPrevious = undefined;
            if (scope.enabled === false)
                return;
            scope.dispatchEvent(endEvent);
            state = STATE.NONE;
        }
        this.dispose = function () {
            this.domElement.removeEventListener('mousedown', onMouseDown);
            this.domElement.removeEventListener('mousewheel', onMouseWheel);
            this.domElement.removeEventListener('DOMMouseScroll', onMouseWheel);
            this.domElement.removeEventListener('touchstart', touchstart);
            this.domElement.removeEventListener('touchend', touchend);
            this.domElement.removeEventListener('touchmove', touchmove);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
        };
        this.domElement.addEventListener('mousedown', onMouseDown, { passive: false });
        this.domElement.addEventListener('mousewheel', onMouseWheel, { passive: false });
        this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, { passive: false });
        this.domElement.addEventListener('touchstart', touchstart, { passive: false });
        this.domElement.addEventListener('touchend', touchend, { passive: false });
        this.domElement.addEventListener('touchmove', touchmove, { passive: false });
        window.addEventListener('keyup', onKeyUp, { passive: false });
        window.addEventListener('keydown', onKeyDown, { passive: false });
        this.update();
    }
    ;
    OrbitControls.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), { constructor: OrbitControls });
    return OrbitControls;
});
define('skylark-panolens/lib/controls/DeviceOrientationControls',['skylark-threejs'], function (THREE) {
    'use strict';
    function DeviceOrientationControls(camera, domElement) {
        var scope = this;
        var changeEvent = { type: 'change' };
        var rotY = 0;
        var rotX = 0;
        var tempX = 0;
        var tempY = 0;
        this.camera = camera;
        this.camera.rotation.reorder('YXZ');
        this.domElement = domElement !== undefined ? domElement : document;
        this.enabled = true;
        this.deviceOrientation = {};
        this.screenOrientation = 0;
        this.alpha = 0;
        this.alphaOffsetAngle = 0;
        var onDeviceOrientationChangeEvent = function (event) {
            scope.deviceOrientation = event;
        };
        var onScreenOrientationChangeEvent = function () {
            scope.screenOrientation = window.orientation || 0;
        };
        var onTouchStartEvent = function (event) {
            event.preventDefault();
            event.stopPropagation();
            tempX = event.touches[0].pageX;
            tempY = event.touches[0].pageY;
        };
        var onTouchMoveEvent = function (event) {
            event.preventDefault();
            event.stopPropagation();
            rotY += THREE.Math.degToRad((event.touches[0].pageX - tempX) / 4);
            rotX += THREE.Math.degToRad((tempY - event.touches[0].pageY) / 4);
            scope.updateAlphaOffsetAngle(rotY);
            tempX = event.touches[0].pageX;
            tempY = event.touches[0].pageY;
        };
        var setCameraQuaternion = function (quaternion, alpha, beta, gamma, orient) {
            var zee = new THREE.Vector3(0, 0, 1);
            var euler = new THREE.Euler();
            var q0 = new THREE.Quaternion();
            var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
            var vectorFingerY;
            var fingerQY = new THREE.Quaternion();
            var fingerQX = new THREE.Quaternion();
            if (scope.screenOrientation == 0) {
                vectorFingerY = new THREE.Vector3(1, 0, 0);
                fingerQY.setFromAxisAngle(vectorFingerY, -rotX);
            } else if (scope.screenOrientation == 180) {
                vectorFingerY = new THREE.Vector3(1, 0, 0);
                fingerQY.setFromAxisAngle(vectorFingerY, rotX);
            } else if (scope.screenOrientation == 90) {
                vectorFingerY = new THREE.Vector3(0, 1, 0);
                fingerQY.setFromAxisAngle(vectorFingerY, rotX);
            } else if (scope.screenOrientation == -90) {
                vectorFingerY = new THREE.Vector3(0, 1, 0);
                fingerQY.setFromAxisAngle(vectorFingerY, -rotX);
            }
            q1.multiply(fingerQY);
            q1.multiply(fingerQX);
            euler.set(beta, alpha, -gamma, 'YXZ');
            quaternion.setFromEuler(euler);
            quaternion.multiply(q1);
            quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
        };
        this.connect = function () {
            onScreenOrientationChangeEvent();
            window.addEventListener('orientationchange', onScreenOrientationChangeEvent, { passive: true });
            window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, { passive: true });
            window.addEventListener('deviceorientation', this.update.bind(this), { passive: true });
            scope.domElement.addEventListener('touchstart', onTouchStartEvent, { passive: false });
            scope.domElement.addEventListener('touchmove', onTouchMoveEvent, { passive: false });
            scope.enabled = true;
        };
        this.disconnect = function () {
            window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
            window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
            window.removeEventListener('deviceorientation', this.update.bind(this), false);
            scope.domElement.removeEventListener('touchstart', onTouchStartEvent, false);
            scope.domElement.removeEventListener('touchmove', onTouchMoveEvent, false);
            scope.enabled = false;
        };
        this.update = function (ignoreUpdate) {
            if (scope.enabled === false)
                return;
            var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad(scope.deviceOrientation.alpha) + scope.alphaOffsetAngle : 0;
            var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad(scope.deviceOrientation.beta) : 0;
            var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad(scope.deviceOrientation.gamma) : 0;
            var orient = scope.screenOrientation ? THREE.Math.degToRad(scope.screenOrientation) : 0;
            setCameraQuaternion(scope.camera.quaternion, alpha, beta, gamma, orient);
            scope.alpha = alpha;
            if (ignoreUpdate !== true) {
                scope.dispatchEvent(changeEvent);
            }
        };
        this.updateAlphaOffsetAngle = function (angle) {
            this.alphaOffsetAngle = angle;
            this.update();
        };
        this.dispose = function () {
            this.disconnect();
        };
        this.connect();
    }
    ;
    DeviceOrientationControls.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), { constructor: DeviceOrientationControls });
    return DeviceOrientationControls;
});
define('skylark-panolens/lib/effects/CardboardEffect',['skylark-threejs'], function (THREE) {
    'use strict';
    function CardboardEffect(renderer) {
        var _camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        var _scene = new THREE.Scene();
        var _stereo = new THREE.StereoCamera();
        _stereo.aspect = 0.5;
        var _params = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat
        };
        var _renderTarget = new THREE.WebGLRenderTarget(512, 512, _params);
        _renderTarget.scissorTest = true;
        _renderTarget.texture.generateMipmaps = false;
        var distortion = new THREE.Vector2(0.441, 0.156);
        var geometry = new THREE.PlaneBufferGeometry(1, 1, 10, 20).removeAttribute('normal').toNonIndexed();
        var positions = geometry.attributes.position.array;
        var uvs = geometry.attributes.uv.array;
        geometry.attributes.position.count *= 2;
        geometry.attributes.uv.count *= 2;
        var positions2 = new Float32Array(positions.length * 2);
        positions2.set(positions);
        positions2.set(positions, positions.length);
        var uvs2 = new Float32Array(uvs.length * 2);
        uvs2.set(uvs);
        uvs2.set(uvs, uvs.length);
        var vector = new THREE.Vector2();
        var length = positions.length / 3;
        for (var i = 0, l = positions2.length / 3; i < l; i++) {
            vector.x = positions2[i * 3 + 0];
            vector.y = positions2[i * 3 + 1];
            var dot = vector.dot(vector);
            var scalar = 1.5 + (distortion.x + distortion.y * dot) * dot;
            var offset = i < length ? 0 : 1;
            positions2[i * 3 + 0] = vector.x / scalar * 1.5 - 0.5 + offset;
            positions2[i * 3 + 1] = vector.y / scalar * 3;
            uvs2[i * 2] = (uvs2[i * 2] + offset) * 0.5;
        }
        geometry.attributes.position.array = positions2;
        geometry.attributes.uv.array = uvs2;
        var material = new THREE.MeshBasicMaterial({ map: _renderTarget.texture });
        var mesh = new THREE.Mesh(geometry, material);
        _scene.add(mesh);
        this.setSize = function (width, height) {
            renderer.setSize(width, height);
            var pixelRatio = renderer.getPixelRatio();
            _renderTarget.setSize(width * pixelRatio, height * pixelRatio);
        };
        this.render = function (scene, camera) {
            scene.updateMatrixWorld();
            if (camera.parent === null)
                camera.updateMatrixWorld();
            _stereo.update(camera);
            var width = _renderTarget.width / 2;
            var height = _renderTarget.height;
            if (renderer.autoClear)
                renderer.clear();
            _renderTarget.scissor.set(0, 0, width, height);
            _renderTarget.viewport.set(0, 0, width, height);
            renderer.setRenderTarget(_renderTarget);
            renderer.render(scene, _stereo.cameraL);
            renderer.clearDepth();
            _renderTarget.scissor.set(width, 0, width, height);
            _renderTarget.viewport.set(width, 0, width, height);
            renderer.setRenderTarget(_renderTarget);
            renderer.render(scene, _stereo.cameraR);
            renderer.clearDepth();
            renderer.setRenderTarget(null);
            renderer.render(_scene, _camera);
        };
    }
    ;
    return CardboardEffect;
});
define('skylark-panolens/lib/effects/StereoEffect',['skylark-threejs'], function (THREE) {
    'use strict';
    const StereoEffect = function (renderer) {
        var _stereo = new THREE.StereoCamera();
        _stereo.aspect = 0.5;
        var size = new THREE.Vector2();
        this.setEyeSeparation = function (eyeSep) {
            _stereo.eyeSep = eyeSep;
        };
        this.setSize = function (width, height) {
            renderer.setSize(width, height);
        };
        this.render = function (scene, camera) {
            scene.updateMatrixWorld();
            if (camera.parent === null)
                camera.updateMatrixWorld();
            _stereo.update(camera);
            renderer.getSize(size);
            if (renderer.autoClear)
                renderer.clear();
            renderer.setScissorTest(true);
            renderer.setScissor(0, 0, size.width / 2, size.height);
            renderer.setViewport(0, 0, size.width / 2, size.height);
            renderer.render(scene, _stereo.cameraL);
            renderer.setScissor(size.width / 2, 0, size.width / 2, size.height);
            renderer.setViewport(size.width / 2, 0, size.width / 2, size.height);
            renderer.render(scene, _stereo.cameraR);
            renderer.setScissorTest(false);
        };
    };
    return StereoEffect;
});
define('skylark-panolens/widget/Widget',[
    '../Constants',
    '../DataImage',
    'skylark-threejs'
], function (Constants, DataImage, THREE) {
    'use strict';
    function Widget(container) {
        if (!container) {
            console.warn('PANOLENS.Widget: No container specified');
        }
        THREE.EventDispatcher.call(this);
        this.DEFAULT_TRANSITION = 'all 0.27s ease';
        this.TOUCH_ENABLED = !!('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);
        this.PREVENT_EVENT_HANDLER = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };
        this.container = container;
        this.barElement = null;
        this.fullscreenElement = null;
        this.videoElement = null;
        this.settingElement = null;
        this.mainMenu = null;
        this.activeMainItem = null;
        this.activeSubMenu = null;
        this.mask = null;
    }
    Widget.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), {
        constructor: Widget,
        addControlBar: function () {
            if (!this.container) {
                console.warn('Widget container not set');
                return;
            }
            var scope = this, bar, styleTranslate, styleOpacity, gradientStyle;
            gradientStyle = 'linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))';
            bar = document.createElement('div');
            bar.style.width = '100%';
            bar.style.height = '44px';
            bar.style.float = 'left';
            bar.style.transform = bar.style.webkitTransform = bar.style.msTransform = 'translateY(-100%)';
            bar.style.background = '-webkit-' + gradientStyle;
            bar.style.background = '-moz-' + gradientStyle;
            bar.style.background = '-o-' + gradientStyle;
            bar.style.background = '-ms-' + gradientStyle;
            bar.style.background = gradientStyle;
            bar.style.transition = this.DEFAULT_TRANSITION;
            bar.style.pointerEvents = 'none';
            bar.isHidden = false;
            bar.toggle = function () {
                bar.isHidden = !bar.isHidden;
                styleTranslate = bar.isHidden ? 'translateY(0)' : 'translateY(-100%)';
                styleOpacity = bar.isHidden ? 0 : 1;
                bar.style.transform = bar.style.webkitTransform = bar.style.msTransform = styleTranslate;
                bar.style.opacity = styleOpacity;
            };
            var menu = this.createDefaultMenu();
            this.mainMenu = this.createMainMenu(menu);
            bar.appendChild(this.mainMenu);
            var mask = this.createMask();
            this.mask = mask;
            this.container.appendChild(mask);
            bar.dispose = function () {
                if (scope.fullscreenElement) {
                    bar.removeChild(scope.fullscreenElement);
                    scope.fullscreenElement.dispose();
                    scope.fullscreenElement = null;
                }
                if (scope.settingElement) {
                    bar.removeChild(scope.settingElement);
                    scope.settingElement.dispose();
                    scope.settingElement = null;
                }
                if (scope.videoElement) {
                    bar.removeChild(scope.videoElement);
                    scope.videoElement.dispose();
                    scope.videoElement = null;
                }
            };
            this.container.appendChild(bar);
            this.mask.addEventListener('mousemove', this.PREVENT_EVENT_HANDLER, true);
            this.mask.addEventListener('mouseup', this.PREVENT_EVENT_HANDLER, true);
            this.mask.addEventListener('mousedown', this.PREVENT_EVENT_HANDLER, true);
            this.mask.addEventListener(scope.TOUCH_ENABLED ? 'touchend' : 'click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                scope.mask.hide();
                scope.settingElement.deactivate();
            }, false);
            this.addEventListener('control-bar-toggle', bar.toggle);
            this.barElement = bar;
        },
        createDefaultMenu: function () {
            var scope = this, handler;
            handler = function (method, data) {
                return function () {
                    scope.dispatchEvent({
                        type: 'panolens-viewer-handler',
                        method: method,
                        data: data
                    });
                };
            };
            return [
                {
                    title: 'Control',
                    subMenu: [
                        {
                            title: this.TOUCH_ENABLED ? 'Touch' : 'Mouse',
                            handler: handler('enableControl', Constants.CONTROLS.ORBIT)
                        },
                        {
                            title: 'Sensor',
                            handler: handler('enableControl', Constants.CONTROLS.DEVICEORIENTATION)
                        }
                    ]
                },
                {
                    title: 'Mode',
                    subMenu: [
                        {
                            title: 'Normal',
                            handler: handler('disableEffect')
                        },
                        {
                            title: 'Cardboard',
                            handler: handler('enableEffect', Constants.MODES.CARDBOARD)
                        },
                        {
                            title: 'Stereoscopic',
                            handler: handler('enableEffect', Constants.MODES.STEREO)
                        }
                    ]
                }
            ];
        },
        addControlButton: function (name) {
            let element;
            switch (name) {
            case 'fullscreen':
                element = this.createFullscreenButton();
                this.fullscreenElement = element;
                break;
            case 'setting':
                element = this.createSettingButton();
                this.settingElement = element;
                break;
            case 'video':
                element = this.createVideoControl();
                this.videoElement = element;
                break;
            default:
                return;
            }
            if (!element) {
                return;
            }
            this.barElement.appendChild(element);
        },
        createMask: function () {
            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.top = 0;
            element.style.left = 0;
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.background = 'transparent';
            element.style.display = 'none';
            element.show = function () {
                this.style.display = 'block';
            };
            element.hide = function () {
                this.style.display = 'none';
            };
            return element;
        },
        createSettingButton: function () {
            let scope = this, item;
            function onTap(event) {
                event.preventDefault();
                event.stopPropagation();
                scope.mainMenu.toggle();
                if (this.activated) {
                    this.deactivate();
                } else {
                    this.activate();
                }
            }
            item = this.createCustomItem({
                style: {
                    backgroundImage: 'url("' + DataImage.Setting + '")',
                    webkitTransition: this.DEFAULT_TRANSITION,
                    transition: this.DEFAULT_TRANSITION
                },
                onTap: onTap
            });
            item.activate = function () {
                this.style.transform = 'rotate3d(0,0,1,90deg)';
                this.activated = true;
                scope.mask.show();
            };
            item.deactivate = function () {
                this.style.transform = 'rotate3d(0,0,0,0)';
                this.activated = false;
                scope.mask.hide();
                if (scope.mainMenu && scope.mainMenu.visible) {
                    scope.mainMenu.hide();
                }
                if (scope.activeSubMenu && scope.activeSubMenu.visible) {
                    scope.activeSubMenu.hide();
                }
                if (scope.mainMenu && scope.mainMenu._width) {
                    scope.mainMenu.changeSize(scope.mainMenu._width);
                    scope.mainMenu.unslideAll();
                }
            };
            item.activated = false;
            return item;
        },
        createFullscreenButton: function () {
            let scope = this, item, isFullscreen = false, tapSkipped = true, stylesheetId;
            const {container} = this;
            stylesheetId = 'panolens-style-addon';
            if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled && !document.mozFullScreenEnabled && !document.msFullscreenEnabled) {
                return;
            }
            function onTap(event) {
                event.preventDefault();
                event.stopPropagation();
                tapSkipped = false;
                if (!isFullscreen) {
                    if (container.requestFullscreen) {
                        container.requestFullscreen();
                    }
                    if (container.msRequestFullscreen) {
                        container.msRequestFullscreen();
                    }
                    if (container.mozRequestFullScreen) {
                        container.mozRequestFullScreen();
                    }
                    if (container.webkitRequestFullscreen) {
                        container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    }
                    isFullscreen = true;
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                    if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    }
                    if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                    isFullscreen = false;
                }
                this.style.backgroundImage = isFullscreen ? 'url("' + DataImage.FullscreenLeave + '")' : 'url("' + DataImage.FullscreenEnter + '")';
            }
            function onFullScreenChange() {
                if (tapSkipped) {
                    isFullscreen = !isFullscreen;
                    item.style.backgroundImage = isFullscreen ? 'url("' + DataImage.FullscreenLeave + '")' : 'url("' + DataImage.FullscreenEnter + '")';
                }
                scope.dispatchEvent({
                    type: 'panolens-viewer-handler',
                    method: 'onWindowResize'
                });
                tapSkipped = true;
            }
            document.addEventListener('fullscreenchange', onFullScreenChange, false);
            document.addEventListener('webkitfullscreenchange', onFullScreenChange, false);
            document.addEventListener('mozfullscreenchange', onFullScreenChange, false);
            document.addEventListener('MSFullscreenChange', onFullScreenChange, false);
            item = this.createCustomItem({
                style: { backgroundImage: 'url("' + DataImage.FullscreenEnter + '")' },
                onTap: onTap
            });
            if (!document.querySelector(stylesheetId)) {
                const sheet = document.createElement('style');
                sheet.id = stylesheetId;
                sheet.innerHTML = ':-webkit-full-screen { width: 100% !important; height: 100% !important }';
                document.body.appendChild(sheet);
            }
            return item;
        },
        createVideoControl: function () {
            const item = document.createElement('span');
            item.style.display = 'none';
            item.show = function () {
                item.style.display = '';
            };
            item.hide = function () {
                item.style.display = 'none';
                item.controlButton.paused = true;
                item.controlButton.update();
            };
            item.controlButton = this.createVideoControlButton();
            item.seekBar = this.createVideoControlSeekbar();
            item.appendChild(item.controlButton);
            item.appendChild(item.seekBar);
            item.dispose = function () {
                item.removeChild(item.controlButton);
                item.removeChild(item.seekBar);
                item.controlButton.dispose();
                item.controlButton = null;
                item.seekBar.dispose();
                item.seekBar = null;
            };
            this.addEventListener('video-control-show', item.show);
            this.addEventListener('video-control-hide', item.hide);
            return item;
        },
        createVideoControlButton: function () {
            const scope = this;
            function onTap(event) {
                event.preventDefault();
                event.stopPropagation();
                scope.dispatchEvent({
                    type: 'panolens-viewer-handler',
                    method: 'toggleVideoPlay',
                    data: !this.paused
                });
                this.paused = !this.paused;
                item.update();
            }
            ;
            const item = this.createCustomItem({
                style: {
                    float: 'left',
                    backgroundImage: 'url("' + DataImage.VideoPlay + '")'
                },
                onTap: onTap
            });
            item.paused = true;
            item.update = function (paused) {
                this.paused = paused !== undefined ? paused : this.paused;
                this.style.backgroundImage = 'url("' + (this.paused ? DataImage.VideoPlay : DataImage.VideoPause) + '")';
            };
            return item;
        },
        createVideoControlSeekbar: function () {
            let scope = this, item, progressElement, progressElementControl, isDragging = false, mouseX, percentageNow, percentageNext;
            progressElement = document.createElement('div');
            progressElement.style.width = '0%';
            progressElement.style.height = '100%';
            progressElement.style.backgroundColor = '#fff';
            progressElementControl = document.createElement('div');
            progressElementControl.style.float = 'right';
            progressElementControl.style.width = '14px';
            progressElementControl.style.height = '14px';
            progressElementControl.style.transform = 'translate(7px, -5px)';
            progressElementControl.style.borderRadius = '50%';
            progressElementControl.style.backgroundColor = '#ddd';
            progressElementControl.addEventListener('mousedown', onMouseDown, { passive: true });
            progressElementControl.addEventListener('touchstart', onMouseDown, { passive: true });
            function onMouseDown(event) {
                event.stopPropagation();
                isDragging = true;
                mouseX = event.clientX || event.changedTouches && event.changedTouches[0].clientX;
                percentageNow = parseInt(progressElement.style.width) / 100;
                addControlListeners();
            }
            function onVideoControlDrag(event) {
                if (isDragging) {
                    const clientX = event.clientX || event.changedTouches && event.changedTouches[0].clientX;
                    percentageNext = (clientX - mouseX) / item.clientWidth;
                    percentageNext = percentageNow + percentageNext;
                    percentageNext = percentageNext > 1 ? 1 : percentageNext < 0 ? 0 : percentageNext;
                    item.setProgress(percentageNext);
                    scope.dispatchEvent({
                        type: 'panolens-viewer-handler',
                        method: 'setVideoCurrentTime',
                        data: percentageNext
                    });
                }
            }
            function onVideoControlStop(event) {
                event.stopPropagation();
                isDragging = false;
                removeControlListeners();
            }
            function addControlListeners() {
                scope.container.addEventListener('mousemove', onVideoControlDrag, { passive: true });
                scope.container.addEventListener('mouseup', onVideoControlStop, { passive: true });
                scope.container.addEventListener('touchmove', onVideoControlDrag, { passive: true });
                scope.container.addEventListener('touchend', onVideoControlStop, { passive: true });
            }
            function removeControlListeners() {
                scope.container.removeEventListener('mousemove', onVideoControlDrag, false);
                scope.container.removeEventListener('mouseup', onVideoControlStop, false);
                scope.container.removeEventListener('touchmove', onVideoControlDrag, false);
                scope.container.removeEventListener('touchend', onVideoControlStop, false);
            }
            function onTap(event) {
                event.preventDefault();
                event.stopPropagation();
                if (event.target === progressElementControl) {
                    return;
                }
                const percentage = event.changedTouches && event.changedTouches.length > 0 ? (event.changedTouches[0].pageX - event.target.getBoundingClientRect().left) / this.clientWidth : event.offsetX / this.clientWidth;
                scope.dispatchEvent({
                    type: 'panolens-viewer-handler',
                    method: 'setVideoCurrentTime',
                    data: percentage
                });
                item.setProgress(event.offsetX / this.clientWidth);
            }
            ;
            function onDispose() {
                removeControlListeners();
                progressElement = null;
                progressElementControl = null;
            }
            progressElement.appendChild(progressElementControl);
            item = this.createCustomItem({
                style: {
                    float: 'left',
                    width: '30%',
                    height: '4px',
                    marginTop: '20px',
                    backgroundColor: 'rgba(188,188,188,0.8)'
                },
                onTap: onTap,
                onDispose: onDispose
            });
            item.appendChild(progressElement);
            item.setProgress = function (percentage) {
                progressElement.style.width = percentage * 100 + '%';
            };
            this.addEventListener('video-update', function (event) {
                item.setProgress(event.percentage);
            });
            item.progressElement = progressElement;
            item.progressElementControl = progressElementControl;
            return item;
        },
        createMenuItem: function (title) {
            const scope = this;
            const item = document.createElement('a');
            item.textContent = title;
            item.style.display = 'block';
            item.style.padding = '10px';
            item.style.textDecoration = 'none';
            item.style.cursor = 'pointer';
            item.style.pointerEvents = 'auto';
            item.style.transition = this.DEFAULT_TRANSITION;
            item.slide = function (right) {
                this.style.transform = 'translateX(' + (right ? '' : '-') + '100%)';
            };
            item.unslide = function () {
                this.style.transform = 'translateX(0)';
            };
            item.setIcon = function (url) {
                if (this.icon) {
                    this.icon.style.backgroundImage = 'url(' + url + ')';
                }
            };
            item.setSelectionTitle = function (title) {
                if (this.selection) {
                    this.selection.textContent = title;
                }
            };
            item.addSelection = function (name) {
                const selection = document.createElement('span');
                selection.style.fontSize = '13px';
                selection.style.fontWeight = '300';
                selection.style.float = 'right';
                this.selection = selection;
                this.setSelectionTitle(name);
                this.appendChild(selection);
                return this;
            };
            item.addIcon = function (url = DataImage.ChevronRight, left = false, flip = false) {
                const element = document.createElement('span');
                element.style.float = left ? 'left' : 'right';
                element.style.width = '17px';
                element.style.height = '17px';
                element.style['margin' + (left ? 'Right' : 'Left')] = '12px';
                element.style.backgroundSize = 'cover';
                if (flip) {
                    element.style.transform = 'rotateZ(180deg)';
                }
                this.icon = element;
                this.setIcon(url);
                this.appendChild(element);
                return this;
            };
            item.addSubMenu = function (title, items) {
                this.subMenu = scope.createSubMenu(title, items);
                return this;
            };
            item.addEventListener('mouseenter', function () {
                this.style.backgroundColor = '#e0e0e0';
            }, false);
            item.addEventListener('mouseleave', function () {
                this.style.backgroundColor = '#fafafa';
            }, false);
            return item;
        },
        createMenuItemHeader: function (title) {
            const header = this.createMenuItem(title);
            header.style.borderBottom = '1px solid #333';
            header.style.paddingBottom = '15px';
            return header;
        },
        createMainMenu: function (menus) {
            let scope = this, menu = this.createMenu();
            menu._width = 200;
            menu.changeSize(menu._width);
            function onTap(event) {
                event.preventDefault();
                event.stopPropagation();
                let mainMenu = scope.mainMenu, subMenu = this.subMenu;
                function onNextTick() {
                    mainMenu.changeSize(subMenu.clientWidth);
                    subMenu.show();
                    subMenu.unslideAll();
                }
                mainMenu.hide();
                mainMenu.slideAll();
                mainMenu.parentElement.appendChild(subMenu);
                scope.activeMainItem = this;
                scope.activeSubMenu = subMenu;
                window.requestAnimationFrame(onNextTick);
            }
            ;
            for (var i = 0; i < menus.length; i++) {
                var item = menu.addItem(menus[i].title);
                item.style.paddingLeft = '20px';
                item.addIcon().addEventListener(scope.TOUCH_ENABLED ? 'touchend' : 'click', onTap, false);
                if (menus[i].subMenu && menus[i].subMenu.length > 0) {
                    var title = menus[i].subMenu[0].title;
                    item.addSelection(title).addSubMenu(menus[i].title, menus[i].subMenu);
                }
            }
            return menu;
        },
        createSubMenu: function (title, items) {
            let scope = this, menu, subMenu = this.createMenu();
            subMenu.items = items;
            subMenu.activeItem = null;
            function onTap(event) {
                event.preventDefault();
                event.stopPropagation();
                menu = scope.mainMenu;
                menu.changeSize(menu._width);
                menu.unslideAll();
                menu.show();
                subMenu.slideAll(true);
                subMenu.hide();
                if (this.type !== 'header') {
                    subMenu.setActiveItem(this);
                    scope.activeMainItem.setSelectionTitle(this.textContent);
                    if (this.handler) {
                        this.handler();
                    }
                }
            }
            subMenu.addHeader(title).addIcon(undefined, true, true).addEventListener(scope.TOUCH_ENABLED ? 'touchend' : 'click', onTap, false);
            for (let i = 0; i < items.length; i++) {
                const item = subMenu.addItem(items[i].title);
                item.style.fontWeight = 300;
                item.handler = items[i].handler;
                item.addIcon(' ', true);
                item.addEventListener(scope.TOUCH_ENABLED ? 'touchend' : 'click', onTap, false);
                if (!subMenu.activeItem) {
                    subMenu.setActiveItem(item);
                }
            }
            subMenu.slideAll(true);
            return subMenu;
        },
        createMenu: function () {
            const scope = this;
            const menu = document.createElement('span');
            const style = menu.style;
            style.padding = '5px 0';
            style.position = 'fixed';
            style.bottom = '100%';
            style.right = '14px';
            style.backgroundColor = '#fafafa';
            style.fontFamily = 'Helvetica Neue';
            style.fontSize = '14px';
            style.visibility = 'hidden';
            style.opacity = 0;
            style.boxShadow = '0 0 12pt rgba(0,0,0,0.25)';
            style.borderRadius = '2px';
            style.overflow = 'hidden';
            style.willChange = 'width, height, opacity';
            style.pointerEvents = 'auto';
            style.transition = this.DEFAULT_TRANSITION;
            menu.visible = false;
            menu.changeSize = function (width, height) {
                if (width) {
                    this.style.width = width + 'px';
                }
                if (height) {
                    this.style.height = height + 'px';
                }
            };
            menu.show = function () {
                this.style.opacity = 1;
                this.style.visibility = 'visible';
                this.visible = true;
            };
            menu.hide = function () {
                this.style.opacity = 0;
                this.style.visibility = 'hidden';
                this.visible = false;
            };
            menu.toggle = function () {
                if (this.visible) {
                    this.hide();
                } else {
                    this.show();
                }
            };
            menu.slideAll = function (right) {
                for (let i = 0; i < menu.children.length; i++) {
                    if (menu.children[i].slide) {
                        menu.children[i].slide(right);
                    }
                }
            };
            menu.unslideAll = function () {
                for (let i = 0; i < menu.children.length; i++) {
                    if (menu.children[i].unslide) {
                        menu.children[i].unslide();
                    }
                }
            };
            menu.addHeader = function (title) {
                const header = scope.createMenuItemHeader(title);
                header.type = 'header';
                this.appendChild(header);
                return header;
            };
            menu.addItem = function (title) {
                const item = scope.createMenuItem(title);
                item.type = 'item';
                this.appendChild(item);
                return item;
            };
            menu.setActiveItem = function (item) {
                if (this.activeItem) {
                    this.activeItem.setIcon(' ');
                }
                item.setIcon(DataImage.Check);
                this.activeItem = item;
            };
            menu.addEventListener('mousemove', this.PREVENT_EVENT_HANDLER, true);
            menu.addEventListener('mouseup', this.PREVENT_EVENT_HANDLER, true);
            menu.addEventListener('mousedown', this.PREVENT_EVENT_HANDLER, true);
            return menu;
        },
        createCustomItem: function (options = {}) {
            const scope = this;
            const item = options.element || document.createElement('span');
            const {onDispose} = options;
            item.style.cursor = 'pointer';
            item.style.float = 'right';
            item.style.width = '44px';
            item.style.height = '100%';
            item.style.backgroundSize = '60%';
            item.style.backgroundRepeat = 'no-repeat';
            item.style.backgroundPosition = 'center';
            item.style.webkitUserSelect = item.style.MozUserSelect = item.style.userSelect = 'none';
            item.style.position = 'relative';
            item.style.pointerEvents = 'auto';
            item.addEventListener(scope.TOUCH_ENABLED ? 'touchstart' : 'mouseenter', function () {
                item.style.filter = item.style.webkitFilter = 'drop-shadow(0 0 5px rgba(255,255,255,1))';
            }, { passive: true });
            item.addEventListener(scope.TOUCH_ENABLED ? 'touchend' : 'mouseleave', function () {
                item.style.filter = item.style.webkitFilter = '';
            }, { passive: true });
            this.mergeStyleOptions(item, options.style);
            if (options.onTap) {
                item.addEventListener(scope.TOUCH_ENABLED ? 'touchend' : 'click', options.onTap, false);
            }
            item.dispose = function () {
                item.removeEventListener(scope.TOUCH_ENABLED ? 'touchend' : 'click', options.onTap, false);
                if (onDispose) {
                    options.onDispose();
                }
            };
            return item;
        },
        mergeStyleOptions: function (element, options = {}) {
            for (let property in options) {
                if (options.hasOwnProperty(property)) {
                    element.style[property] = options[property];
                }
            }
            return element;
        },
        dispose: function () {
            if (this.barElement) {
                this.container.removeChild(this.barElement);
                this.barElement.dispose();
                this.barElement = null;
            }
        }
    });
    return Widget;
});
define('skylark-panolens/interface/Reticle',['skylark-threejs'], function (THREE) {
    'use strict';
    function Reticle(color = 16777215, autoSelect = true, dwellTime = 1500) {
        this.dpr = window.devicePixelRatio;
        const {canvas, context} = this.createCanvas();
        const material = new THREE.SpriteMaterial({
            color,
            map: this.createCanvasTexture(canvas)
        });
        THREE.Sprite.call(this, material);
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.context = context;
        this.color = color instanceof THREE.Color ? color : new THREE.Color(color);
        this.autoSelect = autoSelect;
        this.dwellTime = dwellTime;
        this.rippleDuration = 500;
        this.position.z = -10;
        this.center.set(0.5, 0.5);
        this.scale.set(0.5, 0.5, 1);
        this.startTimestamp = null;
        this.timerId = null;
        this.callback = null;
        this.frustumCulled = false;
        this.updateCanvasArcByProgress(0);
    }
    ;
    Reticle.prototype = Object.assign(Object.create(THREE.Sprite.prototype), {
        constructor: Reticle,
        setColor: function (color) {
            this.material.color.copy(color instanceof THREE.Color ? color : new THREE.Color(color));
        },
        createCanvasTexture: function (canvas) {
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            return texture;
        },
        createCanvas: function () {
            const width = 32;
            const height = 32;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const dpr = this.dpr;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            context.scale(dpr, dpr);
            context.shadowBlur = 5;
            context.shadowColor = 'rgba(200,200,200,0.9)';
            return {
                canvas,
                context
            };
        },
        updateCanvasArcByProgress: function (progress) {
            const context = this.context;
            const {canvasWidth, canvasHeight, material} = this;
            const dpr = this.dpr;
            const degree = progress * Math.PI * 2;
            const color = this.color.getStyle();
            const x = canvasWidth * 0.5 / dpr;
            const y = canvasHeight * 0.5 / dpr;
            const lineWidth = 3;
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.beginPath();
            if (progress === 0) {
                context.arc(x, y, canvasWidth / 16, 0, 2 * Math.PI);
                context.fillStyle = color;
                context.fill();
            } else {
                context.arc(x, y, canvasWidth / 4 - lineWidth, -Math.PI / 2, -Math.PI / 2 + degree);
                context.strokeStyle = color;
                context.lineWidth = lineWidth;
                context.stroke();
            }
            context.closePath();
            material.map.needsUpdate = true;
        },
        ripple: function () {
            const context = this.context;
            const {canvasWidth, canvasHeight, material} = this;
            const duration = this.rippleDuration;
            const timestamp = performance.now();
            const color = this.color;
            const dpr = this.dpr;
            const x = canvasWidth * 0.5 / dpr;
            const y = canvasHeight * 0.5 / dpr;
            const update = () => {
                const timerId = window.requestAnimationFrame(update);
                const elapsed = performance.now() - timestamp;
                const progress = elapsed / duration;
                const opacity = 1 - progress > 0 ? 1 - progress : 0;
                const radius = progress * canvasWidth * 0.5 / dpr;
                context.clearRect(0, 0, canvasWidth, canvasHeight);
                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.fillStyle = `rgba(${ color.r * 255 }, ${ color.g * 255 }, ${ color.b * 255 }, ${ opacity })`;
                context.fill();
                context.closePath();
                if (progress >= 1) {
                    window.cancelAnimationFrame(timerId);
                    this.updateCanvasArcByProgress(0);
                    this.dispatchEvent({ type: 'reticle-ripple-end' });
                }
                material.map.needsUpdate = true;
            };
            this.dispatchEvent({ type: 'reticle-ripple-start' });
            update();
        },
        show: function () {
            this.visible = true;
        },
        hide: function () {
            this.visible = false;
        },
        start: function (callback) {
            if (!this.autoSelect) {
                return;
            }
            this.dispatchEvent({ type: 'reticle-start' });
            this.startTimestamp = performance.now();
            this.callback = callback;
            this.update();
        },
        end: function () {
            if (!this.startTimestamp) {
                return;
            }
            window.cancelAnimationFrame(this.timerId);
            this.updateCanvasArcByProgress(0);
            this.callback = null;
            this.timerId = null;
            this.startTimestamp = null;
            this.dispatchEvent({ type: 'reticle-end' });
        },
        update: function () {
            this.timerId = window.requestAnimationFrame(this.update.bind(this));
            const elapsed = performance.now() - this.startTimestamp;
            const progress = elapsed / this.dwellTime;
            this.updateCanvasArcByProgress(progress);
            this.dispatchEvent({
                type: 'reticle-update',
                progress
            });
            if (progress >= 1) {
                window.cancelAnimationFrame(this.timerId);
                if (this.callback) {
                    this.callback();
                }
                this.end();
                this.ripple();
            }
        }
    });
    return Reticle;
});
define('skylark-panolens/loaders/ImageLoader',[
    '../DataImage',
    'skylark-threejs'
], function (DataImage, THREE) {
    'use strict';
    const ImageLoader = {
        load: function (url, onLoad = () => {
        }, onProgress = () => {
        }, onError = () => {
        }) {
            THREE.Cache.enabled = true;
            let cached, request, arrayBufferView, blob, urlCreator, image, reference;
            for (let iconName in DataImage) {
                if (DataImage.hasOwnProperty(iconName) && url === DataImage[iconName]) {
                    reference = iconName;
                }
            }
            cached = THREE.Cache.get(reference ? reference : url);
            if (cached !== undefined) {
                if (onLoad) {
                    setTimeout(function () {
                        onProgress({
                            loaded: 1,
                            total: 1
                        });
                        onLoad(cached);
                    }, 0);
                }
                return cached;
            }
            urlCreator = window.URL || window.webkitURL;
            image = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');
            THREE.Cache.add(reference ? reference : url, image);
            const onImageLoaded = () => {
                urlCreator.revokeObjectURL(image.src);
                onLoad(image);
            };
            if (url.indexOf('data:') === 0) {
                image.addEventListener('load', onImageLoaded, false);
                image.src = url;
                return image;
            }
            image.crossOrigin = this.crossOrigin !== undefined ? this.crossOrigin : '';
            request = new window.XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.addEventListener('error', onError);
            request.addEventListener('progress', event => {
                if (!event)
                    return;
                const {loaded, total, lengthComputable} = event;
                if (lengthComputable) {
                    onProgress({
                        loaded,
                        total
                    });
                }
            });
            request.addEventListener('loadend', event => {
                if (!event)
                    return;
                const {
                    currentTarget: {response}
                } = event;
                arrayBufferView = new Uint8Array(response);
                blob = new window.Blob([arrayBufferView]);
                image.addEventListener('load', onImageLoaded, false);
                image.src = urlCreator.createObjectURL(blob);
            });
            request.send(null);
        }
    };
    return ImageLoader;
});
define('skylark-panolens/loaders/TextureLoader',[
    './ImageLoader',
    'skylark-threejs'
], function (ImageLoader, THREE) {
    'use strict';
    const TextureLoader = {
        load: function (url, onLoad = () => {
        }, onProgress, onError) {
            var texture = new THREE.Texture();
            ImageLoader.load(url, function (image) {
                texture.image = image;
                const isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:image\/jpeg/) === 0;
                texture.format = isJPEG ? THREE.RGBFormat : THREE.RGBAFormat;
                texture.needsUpdate = true;
                onLoad(texture);
            }, onProgress, onError);
            return texture;
        }
    };
    return TextureLoader;
});
define('skylark-panolens/infospot/Infospot',[
    'skylark-threejs',
    '../DataImage',
    '../Constants',
    '../loaders/TextureLoader',
    'skylark-tweenjs'
], function (THREE, DataImage, Constants, TextureLoader, TWEEN) {
    'use strict';
    function Infospot(scale = 300, imageSrc, animated) {
        const duration = 500, scaleFactor = 1.3;
        imageSrc = imageSrc || DataImage.Info;
        THREE.Sprite.call(this);
        this.type = 'infospot';
        this.animated = animated !== undefined ? animated : true;
        this.isHovering = false;
        this.frustumCulled = false;
        this.element = null;
        this.toPanorama = null;
        this.cursorStyle = null;
        this.mode = Constants.MODES.NORMAL;
        this.scale.set(scale, scale, 1);
        this.rotation.y = Math.PI;
        this.container = null;
        this.originalRaycast = this.raycast;
        this.HANDLER_FOCUS = null;
        this.material.side = THREE.DoubleSide;
        this.material.depthTest = false;
        this.material.transparent = true;
        this.material.opacity = 0;
        this.scaleUpAnimation = new TWEEN.Tween();
        this.scaleDownAnimation = new TWEEN.Tween();
        const postLoad = function (texture) {
            if (!this.material) {
                return;
            }
            const ratio = texture.image.width / texture.image.height;
            const textureScale = new THREE.Vector3();
            texture.image.width = texture.image.naturalWidth || 64;
            texture.image.height = texture.image.naturalHeight || 64;
            this.scale.set(ratio * scale, scale, 1);
            textureScale.copy(this.scale);
            this.scaleUpAnimation = new TWEEN.Tween(this.scale).to({
                x: textureScale.x * scaleFactor,
                y: textureScale.y * scaleFactor
            }, duration).easing(TWEEN.Easing.Elastic.Out);
            this.scaleDownAnimation = new TWEEN.Tween(this.scale).to({
                x: textureScale.x,
                y: textureScale.y
            }, duration).easing(TWEEN.Easing.Elastic.Out);
            this.material.map = texture;
            this.material.needsUpdate = true;
        }.bind(this);
        this.showAnimation = new TWEEN.Tween(this.material).to({ opacity: 1 }, duration).onStart(this.enableRaycast.bind(this, true)).easing(TWEEN.Easing.Quartic.Out);
        this.hideAnimation = new TWEEN.Tween(this.material).to({ opacity: 0 }, duration).onStart(this.enableRaycast.bind(this, false)).easing(TWEEN.Easing.Quartic.Out);
        this.addEventListener('click', this.onClick);
        this.addEventListener('hover', this.onHover);
        this.addEventListener('hoverenter', this.onHoverStart);
        this.addEventListener('hoverleave', this.onHoverEnd);
        this.addEventListener('panolens-dual-eye-effect', this.onDualEyeEffect);
        this.addEventListener('panolens-container', this.setContainer.bind(this));
        this.addEventListener('dismiss', this.onDismiss);
        this.addEventListener('panolens-infospot-focus', this.setFocusMethod);
        TextureLoader.load(imageSrc, postLoad);
    }
    ;
    Infospot.prototype = Object.assign(Object.create(THREE.Sprite.prototype), {
        constructor: Infospot,
        setContainer: function (data) {
            let container;
            if (data instanceof HTMLElement) {
                container = data;
            } else if (data && data.container) {
                container = data.container;
            }
            if (container && this.element) {
                container.appendChild(this.element);
            }
            this.container = container;
        },
        getContainer: function () {
            return this.container;
        },
        onClick: function (event) {
            if (this.element && this.getContainer()) {
                this.onHoverStart(event);
                this.lockHoverElement();
            }
        },
        onDismiss: function () {
            if (this.element) {
                this.unlockHoverElement();
                this.onHoverEnd();
            }
        },
        onHover: function () {
        },
        onHoverStart: function (event) {
            if (!this.getContainer()) {
                return;
            }
            const cursorStyle = this.cursorStyle || (this.mode === Constants.MODES.NORMAL ? 'pointer' : 'default');
            const {scaleDownAnimation, scaleUpAnimation, element} = this;
            this.isHovering = true;
            this.container.style.cursor = cursorStyle;
            if (this.animated) {
                scaleDownAnimation.stop();
                scaleUpAnimation.start();
            }
            if (element && event.mouseEvent.clientX >= 0 && event.mouseEvent.clientY >= 0) {
                const {left, right, style} = element;
                if (this.mode === Constants.MODES.CARDBOARD || this.mode === Constants.MODES.STEREO) {
                    style.display = 'none';
                    left.style.display = 'block';
                    right.style.display = 'block';
                    element._width = left.clientWidth;
                    element._height = left.clientHeight;
                } else {
                    style.display = 'block';
                    if (left) {
                        left.style.display = 'none';
                    }
                    if (right) {
                        right.style.display = 'none';
                    }
                    element._width = element.clientWidth;
                    element._height = element.clientHeight;
                }
            }
        },
        onHoverEnd: function () {
            if (!this.getContainer()) {
                return;
            }
            const {scaleDownAnimation, scaleUpAnimation, element} = this;
            this.isHovering = false;
            this.container.style.cursor = 'default';
            if (this.animated) {
                scaleUpAnimation.stop();
                scaleDownAnimation.start();
            }
            if (element && !this.element.locked) {
                const {left, right, style} = element;
                style.display = 'none';
                if (left) {
                    left.style.display = 'none';
                }
                if (right) {
                    right.style.display = 'none';
                }
                this.unlockHoverElement();
            }
        },
        onDualEyeEffect: function (event) {
            if (!this.getContainer()) {
                return;
            }
            let element, halfWidth, halfHeight;
            this.mode = event.mode;
            element = this.element;
            halfWidth = this.container.clientWidth / 2;
            halfHeight = this.container.clientHeight / 2;
            if (!element) {
                return;
            }
            if (!element.left && !element.right) {
                element.left = element.cloneNode(true);
                element.right = element.cloneNode(true);
            }
            if (this.mode === Constants.MODES.CARDBOARD || this.mode === Constants.MODES.STEREO) {
                element.left.style.display = element.style.display;
                element.right.style.display = element.style.display;
                element.style.display = 'none';
            } else {
                element.style.display = element.left.style.display;
                element.left.style.display = 'none';
                element.right.style.display = 'none';
            }
            this.translateElement(halfWidth, halfHeight);
            this.container.appendChild(element.left);
            this.container.appendChild(element.right);
        },
        translateElement: function (x, y) {
            if (!this.element._width || !this.element._height || !this.getContainer()) {
                return;
            }
            let left, top, element, width, height, delta, container;
            container = this.container;
            element = this.element;
            width = element._width / 2;
            height = element._height / 2;
            delta = element.verticalDelta !== undefined ? element.verticalDelta : 40;
            left = x - width;
            top = y - height - delta;
            if ((this.mode === Constants.MODES.CARDBOARD || this.mode === Constants.MODES.STEREO) && element.left && element.right && !(x === container.clientWidth / 2 && y === container.clientHeight / 2)) {
                left = container.clientWidth / 4 - width + (x - container.clientWidth / 2);
                top = container.clientHeight / 2 - height - delta + (y - container.clientHeight / 2);
                this.setElementStyle('transform', element.left, 'translate(' + left + 'px, ' + top + 'px)');
                left += container.clientWidth / 2;
                this.setElementStyle('transform', element.right, 'translate(' + left + 'px, ' + top + 'px)');
            } else {
                this.setElementStyle('transform', element, 'translate(' + left + 'px, ' + top + 'px)');
            }
        },
        setElementStyle: function (type, element, value) {
            const style = element.style;
            if (type === 'transform') {
                style.webkitTransform = style.msTransform = style.transform = value;
            }
        },
        setText: function (text) {
            if (this.element) {
                this.element.textContent = text;
            }
        },
        setCursorHoverStyle: function (style) {
            this.cursorStyle = style;
        },
        addHoverText: function (text, delta = 40) {
            if (!this.element) {
                this.element = document.createElement('div');
                this.element.style.display = 'none';
                this.element.style.color = '#fff';
                this.element.style.top = 0;
                this.element.style.maxWidth = '50%';
                this.element.style.maxHeight = '50%';
                this.element.style.textShadow = '0 0 3px #000000';
                this.element.style.fontFamily = '"Trebuchet MS", Helvetica, sans-serif';
                this.element.style.position = 'absolute';
                this.element.classList.add('panolens-infospot');
                this.element.verticalDelta = delta;
            }
            this.setText(text);
        },
        addHoverElement: function (el, delta = 40) {
            if (!this.element) {
                this.element = el.cloneNode(true);
                this.element.style.display = 'none';
                this.element.style.top = 0;
                this.element.style.position = 'absolute';
                this.element.classList.add('panolens-infospot');
                this.element.verticalDelta = delta;
            }
        },
        removeHoverElement: function () {
            if (this.element) {
                if (this.element.left) {
                    this.container.removeChild(this.element.left);
                    this.element.left = null;
                }
                if (this.element.right) {
                    this.container.removeChild(this.element.right);
                    this.element.right = null;
                }
                this.container.removeChild(this.element);
                this.element = null;
            }
        },
        lockHoverElement: function () {
            if (this.element) {
                this.element.locked = true;
            }
        },
        unlockHoverElement: function () {
            if (this.element) {
                this.element.locked = false;
            }
        },
        enableRaycast: function (enabled = true) {
            if (enabled) {
                this.raycast = this.originalRaycast;
            } else {
                this.raycast = () => {
                };
            }
        },
        show: function (delay = 0) {
            const {animated, hideAnimation, showAnimation, material} = this;
            if (animated) {
                hideAnimation.stop();
                showAnimation.delay(delay).start();
            } else {
                this.enableRaycast(true);
                material.opacity = 1;
            }
        },
        hide: function (delay = 0) {
            const {animated, hideAnimation, showAnimation, material} = this;
            if (animated) {
                showAnimation.stop();
                hideAnimation.delay(delay).start();
            } else {
                this.enableRaycast(false);
                material.opacity = 0;
            }
        },
        setFocusMethod: function (event) {
            if (event) {
                this.HANDLER_FOCUS = event.method;
            }
        },
        focus: function (duration, easing) {
            if (this.HANDLER_FOCUS) {
                this.HANDLER_FOCUS(this.position, duration, easing);
                this.onDismiss();
            }
        },
        dispose: function () {
            const {geometry, material} = this;
            const {map} = material;
            this.removeHoverElement();
            if (this.parent) {
                this.parent.remove(this);
            }
            if (map) {
                map.dispose();
                material.map = null;
            }
            if (geometry) {
                geometry.dispose();
                this.geometry = null;
            }
            if (material) {
                material.dispose();
                this.material = null;
            }
        }
    });
    return Infospot;
});
define('skylark-panolens/panorama/Panorama',[
    '../infospot/Infospot',
    '../DataImage',
    'skylark-threejs',
    'skylark-tweenjs'
], function (Infospot, DataImage, THREE, TWEEN) {
    'use strict';
    function Panorama(geometry, material) {
        THREE.Mesh.call(this, geometry, material);
        this.type = 'panorama';
        this.ImageQualityLow = 1;
        this.ImageQualityFair = 2;
        this.ImageQualityMedium = 3;
        this.ImageQualityHigh = 4;
        this.ImageQualitySuperHigh = 5;
        this.animationDuration = 1000;
        this.defaultInfospotSize = 350;
        this.container = undefined;
        this.loaded = false;
        this.linkedSpots = [];
        this.isInfospotVisible = false;
        this.linkingImageURL = undefined;
        this.linkingImageScale = undefined;
        this.material.side = THREE.BackSide;
        this.material.opacity = 0;
        this.scale.x *= -1;
        this.renderOrder = -1;
        this.active = false;
        this.infospotAnimation = new TWEEN.Tween(this).to({}, this.animationDuration / 2);
        this.addEventListener('load', this.fadeIn.bind(this));
        this.addEventListener('panolens-container', this.setContainer.bind(this));
        this.addEventListener('click', this.onClick.bind(this));
        this.setupTransitions();
    }
    Panorama.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
        constructor: Panorama,
        add: function (object) {
            let invertedObject;
            if (arguments.length > 1) {
                for (var i = 0; i < arguments.length; i++) {
                    this.add(arguments[i]);
                }
                return this;
            }
            if (object instanceof Infospot) {
                invertedObject = object;
                if (object.dispatchEvent) {
                    const {container} = this;
                    if (container) {
                        object.dispatchEvent({
                            type: 'panolens-container',
                            container
                        });
                    }
                    object.dispatchEvent({
                        type: 'panolens-infospot-focus',
                        method: function (vector, duration, easing) {
                            this.dispatchEvent({
                                type: 'panolens-viewer-handler',
                                method: 'tweenControlCenter',
                                data: [
                                    vector,
                                    duration,
                                    easing
                                ]
                            });
                        }.bind(this)
                    });
                }
            } else {
                invertedObject = new THREE.Object3D();
                invertedObject.scale.x = -1;
                invertedObject.scalePlaceHolder = true;
                invertedObject.add(object);
            }
            THREE.Object3D.prototype.add.call(this, invertedObject);
        },
        load: function () {
            this.onLoad();
        },
        onClick: function (event) {
            if (event.intersects && event.intersects.length === 0) {
                this.traverse(function (object) {
                    object.dispatchEvent({ type: 'dismiss' });
                });
            }
        },
        setContainer: function (data) {
            let container;
            if (data instanceof HTMLElement) {
                container = data;
            } else if (data && data.container) {
                container = data.container;
            }
            if (container) {
                this.children.forEach(function (child) {
                    if (child instanceof Infospot && child.dispatchEvent) {
                        child.dispatchEvent({
                            type: 'panolens-container',
                            container: container
                        });
                    }
                });
                this.container = container;
            }
        },
        onLoad: function () {
            this.loaded = true;
            this.dispatchEvent({ type: 'load' });
        },
        onProgress: function (progress) {
            this.dispatchEvent({
                type: 'progress',
                progress: progress
            });
        },
        onError: function () {
            this.dispatchEvent({ type: 'error' });
        },
        getZoomLevel: function () {
            let zoomLevel;
            if (window.innerWidth <= 800) {
                zoomLevel = this.ImageQualityFair;
            } else if (window.innerWidth > 800 && window.innerWidth <= 1280) {
                zoomLevel = this.ImageQualityMedium;
            } else if (window.innerWidth > 1280 && window.innerWidth <= 1920) {
                zoomLevel = this.ImageQualityHigh;
            } else if (window.innerWidth > 1920) {
                zoomLevel = this.ImageQualitySuperHigh;
            } else {
                zoomLevel = this.ImageQualityLow;
            }
            return zoomLevel;
        },
        updateTexture: function (texture) {
            this.material.map = texture;
            this.material.needsUpdate = true;
        },
        toggleInfospotVisibility: function (isVisible, delay) {
            delay = delay !== undefined ? delay : 0;
            const visible = isVisible !== undefined ? isVisible : this.isInfospotVisible ? false : true;
            this.traverse(function (object) {
                if (object instanceof Infospot) {
                    if (visible) {
                        object.show(delay);
                    } else {
                        object.hide(delay);
                    }
                }
            });
            this.isInfospotVisible = visible;
            this.infospotAnimation.onComplete(function () {
                this.dispatchEvent({
                    type: 'infospot-animation-complete',
                    visible: visible
                });
            }.bind(this)).delay(delay).start();
        },
        setLinkingImage: function (url, scale) {
            this.linkingImageURL = url;
            this.linkingImageScale = scale;
        },
        link: function (pano, position, imageScale, imageSrc) {
            let scale, img;
            this.visible = true;
            if (!position) {
                console.warn('Please specify infospot position for linking');
                return;
            }
            if (imageScale !== undefined) {
                scale = imageScale;
            } else if (pano.linkingImageScale !== undefined) {
                scale = pano.linkingImageScale;
            } else {
                scale = 300;
            }
            if (imageSrc) {
                img = imageSrc;
            } else if (pano.linkingImageURL) {
                img = pano.linkingImageURL;
            } else {
                img = DataImage.Arrow;
            }
            const spot = new Infospot(scale, img);
            spot.position.copy(position);
            spot.toPanorama = pano;
            spot.addEventListener('click', function () {
                this.dispatchEvent({
                    type: 'panolens-viewer-handler',
                    method: 'setPanorama',
                    data: pano
                });
            }.bind(this));
            this.linkedSpots.push(spot);
            this.add(spot);
            this.visible = false;
        },
        reset: function () {
            this.children.length = 0;
        },
        setupTransitions: function () {
            this.fadeInAnimation = new TWEEN.Tween(this.material).easing(TWEEN.Easing.Quartic.Out).onStart(function () {
                this.visible = true;
                this.dispatchEvent({ type: 'enter-fade-start' });
            }.bind(this));
            this.fadeOutAnimation = new TWEEN.Tween(this.material).easing(TWEEN.Easing.Quartic.Out).onComplete(function () {
                this.visible = false;
                this.dispatchEvent({ type: 'leave-complete' });
            }.bind(this));
            this.enterTransition = new TWEEN.Tween(this).easing(TWEEN.Easing.Quartic.Out).onComplete(function () {
                this.dispatchEvent({ type: 'enter-complete' });
            }.bind(this)).start();
            this.leaveTransition = new TWEEN.Tween(this).easing(TWEEN.Easing.Quartic.Out);
        },
        onFadeAnimationUpdate: function () {
            const alpha = this.material.opacity;
            const {uniforms} = this.material;
            if (uniforms && uniforms.opacity) {
                uniforms.opacity.value = alpha;
            }
        },
        fadeIn: function (duration) {
            duration = duration >= 0 ? duration : this.animationDuration;
            this.fadeOutAnimation.stop();
            this.fadeInAnimation.to({ opacity: 1 }, duration).onUpdate(this.onFadeAnimationUpdate.bind(this)).onComplete(function () {
                this.toggleInfospotVisibility(true, duration / 2);
                this.dispatchEvent({ type: 'enter-fade-complete' });
            }.bind(this)).start();
        },
        fadeOut: function (duration) {
            duration = duration >= 0 ? duration : this.animationDuration;
            this.fadeInAnimation.stop();
            this.fadeOutAnimation.to({ opacity: 0 }, duration).onUpdate(this.onFadeAnimationUpdate.bind(this)).start();
        },
        onEnter: function () {
            const duration = this.animationDuration;
            this.leaveTransition.stop();
            this.enterTransition.to({}, duration).onStart(function () {
                this.dispatchEvent({ type: 'enter-start' });
                if (this.loaded) {
                    this.fadeIn(duration);
                } else {
                    this.load();
                }
            }.bind(this)).start();
            this.dispatchEvent({ type: 'enter' });
            this.children.forEach(child => {
                child.dispatchEvent({ type: 'panorama-enter' });
            });
            this.active = true;
        },
        onLeave: function () {
            const duration = this.animationDuration;
            this.enterTransition.stop();
            this.leaveTransition.to({}, duration).onStart(function () {
                this.dispatchEvent({ type: 'leave-start' });
                this.fadeOut(duration);
                this.toggleInfospotVisibility(false);
            }.bind(this)).start();
            this.dispatchEvent({ type: 'leave' });
            this.children.forEach(child => {
                child.dispatchEvent({ type: 'panorama-leave' });
            });
            this.active = false;
        },
        dispose: function () {
            this.infospotAnimation.stop();
            this.fadeInAnimation.stop();
            this.fadeOutAnimation.stop();
            this.enterTransition.stop();
            this.leaveTransition.stop();
            this.dispatchEvent({
                type: 'panolens-viewer-handler',
                method: 'onPanoramaDispose',
                data: this
            });
            function recursiveDispose(object) {
                const {geometry, material} = object;
                for (var i = object.children.length - 1; i >= 0; i--) {
                    recursiveDispose(object.children[i]);
                    object.remove(object.children[i]);
                }
                if (object instanceof Infospot) {
                    object.dispose();
                }
                if (geometry) {
                    geometry.dispose();
                    object.geometry = null;
                }
                if (material) {
                    material.dispose();
                    object.material = null;
                }
            }
            recursiveDispose(this);
            if (this.parent) {
                this.parent.remove(this);
            }
        }
    });
    return Panorama;
});
define('skylark-panolens/panorama/VideoPanorama',[
    './Panorama',
    'skylark-threejs'
], function (Panorama, THREE) {
    'use strict';
    function VideoPanorama(src, options = {}) {
        const radius = 5000;
        const geometry = new THREE.SphereBufferGeometry(radius, 60, 40);
        const material = new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true
        });
        Panorama.call(this, geometry, material);
        this.src = src;
        this.options = {
            videoElement: document.createElement('video'),
            loop: true,
            muted: true,
            autoplay: false,
            playsinline: true,
            crossOrigin: 'anonymous'
        };
        Object.assign(this.options, options);
        this.videoElement = this.options.videoElement;
        this.videoProgress = 0;
        this.radius = radius;
        this.addEventListener('leave', this.pauseVideo.bind(this));
        this.addEventListener('enter-fade-start', this.resumeVideoProgress.bind(this));
        this.addEventListener('video-toggle', this.toggleVideo.bind(this));
        this.addEventListener('video-time', this.setVideoCurrentTime.bind(this));
    }
    ;
    VideoPanorama.prototype = Object.assign(Object.create(Panorama.prototype), {
        constructor: VideoPanorama,
        isMobile: function () {
            let check = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
                    check = true;
            }(window.navigator.userAgent || window.navigator.vendor || window.opera));
            return check;
        },
        load: function () {
            const {muted, loop, autoplay, playsinline, crossOrigin} = this.options;
            const video = this.videoElement;
            const material = this.material;
            const onProgress = this.onProgress.bind(this);
            const onLoad = this.onLoad.bind(this);
            video.loop = loop;
            video.autoplay = autoplay;
            video.playsinline = playsinline;
            video.crossOrigin = crossOrigin;
            video.muted = muted;
            if (playsinline) {
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');
            }
            const onloadeddata = function () {
                this.setVideoTexture(video);
                if (autoplay) {
                    this.dispatchEvent({
                        type: 'panolens-viewer-handler',
                        method: 'updateVideoPlayButton',
                        data: false
                    });
                }
                if (this.isMobile()) {
                    video.pause();
                    if (autoplay && muted) {
                        this.dispatchEvent({
                            type: 'panolens-viewer-handler',
                            method: 'updateVideoPlayButton',
                            data: false
                        });
                    } else {
                        this.dispatchEvent({
                            type: 'panolens-viewer-handler',
                            method: 'updateVideoPlayButton',
                            data: true
                        });
                    }
                }
                const loaded = () => {
                    material.map.needsUpdate = true;
                    onProgress({
                        loaded: 1,
                        total: 1
                    });
                    onLoad();
                };
                window.requestAnimationFrame(loaded);
            };
            if (video.readyState > 2) {
                onloadeddata.call(this);
            } else {
                if (video.querySelectorAll('source').length === 0) {
                    const source = document.createElement('source');
                    source.src = this.src;
                    video.appendChild(source);
                }
                video.load();
            }
            video.addEventListener('loadeddata', onloadeddata.bind(this));
            video.addEventListener('timeupdate', function () {
                this.videoProgress = video.duration >= 0 ? video.currentTime / video.duration : 0;
                this.dispatchEvent({
                    type: 'panolens-viewer-handler',
                    method: 'onVideoUpdate',
                    data: this.videoProgress
                });
            }.bind(this));
            video.addEventListener('ended', function () {
                if (!loop) {
                    this.resetVideo();
                    this.dispatchEvent({
                        type: 'panolens-viewer-handler',
                        method: 'updateVideoPlayButton',
                        data: true
                    });
                }
            }.bind(this), false);
        },
        setVideoTexture: function (video) {
            if (!video)
                return;
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.format = THREE.RGBFormat;
            this.updateTexture(videoTexture);
        },
        reset: function () {
            this.videoElement = undefined;
            Panorama.prototype.reset.call(this);
        },
        isVideoPaused: function () {
            return this.videoElement.paused;
        },
        toggleVideo: function () {
            const video = this.videoElement;
            if (!video) {
                return;
            }
            video[video.paused ? 'play' : 'pause']();
        },
        setVideoCurrentTime: function ({percentage}) {
            const video = this.videoElement;
            if (video && !Number.isNaN(percentage) && percentage !== 1) {
                video.currentTime = video.duration * percentage;
                this.dispatchEvent({
                    type: 'panolens-viewer-handler',
                    method: 'onVideoUpdate',
                    data: percentage
                });
            }
        },
        playVideo: function () {
            const video = this.videoElement;
            const playVideo = this.playVideo.bind(this);
            const dispatchEvent = this.dispatchEvent.bind(this);
            const onSuccess = () => {
                dispatchEvent({ type: 'play' });
            };
            const onError = error => {
                window.requestAnimationFrame(playVideo);
                dispatchEvent({
                    type: 'play-error',
                    error
                });
            };
            if (video && video.paused) {
                video.play().then(onSuccess).catch(onError);
            }
        },
        pauseVideo: function () {
            const video = this.videoElement;
            if (video && !video.paused) {
                video.pause();
            }
            this.dispatchEvent({ type: 'pause' });
        },
        resumeVideoProgress: function () {
            const video = this.videoElement;
            if (video.readyState >= 4 && video.autoplay && !this.isMobile()) {
                this.playVideo();
                this.dispatchEvent({
                    type: 'panolens-viewer-handler',
                    method: 'updateVideoPlayButton',
                    data: false
                });
            } else {
                this.pauseVideo();
                this.dispatchEvent({
                    type: 'panolens-viewer-handler',
                    method: 'updateVideoPlayButton',
                    data: true
                });
            }
            this.setVideoCurrentTime({ percentage: this.videoProgress });
        },
        resetVideo: function () {
            const video = this.videoElement;
            if (video) {
                this.setVideoCurrentTime({ percentage: 0 });
            }
        },
        isVideoMuted: function () {
            return this.videoElement.muted;
        },
        muteVideo: function () {
            const video = this.videoElement;
            if (video && !video.muted) {
                video.muted = true;
            }
            this.dispatchEvent({ type: 'volumechange' });
        },
        unmuteVideo: function () {
            const video = this.videoElement;
            if (video && this.isVideoMuted()) {
                video.muted = false;
            }
            this.dispatchEvent({ type: 'volumechange' });
        },
        getVideoElement: function () {
            return this.videoElement;
        },
        dispose: function () {
            const {
                material: {map}
            } = this;
            this.pauseVideo();
            this.removeEventListener('leave', this.pauseVideo.bind(this));
            this.removeEventListener('enter-fade-start', this.resumeVideoProgress.bind(this));
            this.removeEventListener('video-toggle', this.toggleVideo.bind(this));
            this.removeEventListener('video-time', this.setVideoCurrentTime.bind(this));
            if (map) {
                map.dispose();
            }
            Panorama.prototype.dispose.call(this);
        }
    });
    return VideoPanorama;
});
define('skylark-panolens/media/Media',['skylark-threejs'], function (THREE) {
    'use strict';
    function Media(constraints) {
        const defaultConstraints = {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: { exact: 'environment' }
            },
            audio: false
        };
        this.constraints = Object.assign(defaultConstraints, constraints);
        this.container = null;
        this.scene = null;
        this.element = null;
        this.devices = [];
        this.stream = null;
        this.ratioScalar = 1;
        this.videoDeviceIndex = 0;
    }
    ;
    Media.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), {
        setContainer: function (container) {
            this.container = container;
        },
        setScene: function (scene) {
            this.scene = scene;
        },
        enumerateDevices: function () {
            const devices = this.devices;
            const resolvedPromise = new Promise(resolve => {
                resolve(devices);
            });
            return devices.length > 0 ? resolvedPromise : window.navigator.mediaDevices.enumerateDevices();
        },
        switchNextVideoDevice: function () {
            const stop = this.stop.bind(this);
            const start = this.start.bind(this);
            const setVideDeviceIndex = this.setVideDeviceIndex.bind(this);
            let index = this.videoDeviceIndex;
            this.getDevices('video').then(devices => {
                stop();
                index++;
                if (index >= devices.length) {
                    setVideDeviceIndex(0);
                    index--;
                } else {
                    setVideDeviceIndex(index);
                }
                start(devices[index]);
            });
        },
        getDevices: function (type = 'video') {
            const devices = this.devices;
            const validate = _devices => {
                return _devices.map(device => {
                    if (!devices.includes(device)) {
                        devices.push(device);
                    }
                    return device;
                });
            };
            const filter = _devices => {
                const reg = new RegExp(type, 'i');
                return _devices.filter(device => reg.test(device.kind));
            };
            return this.enumerateDevices().then(validate).then(filter);
        },
        getUserMedia: function (constraints) {
            const setMediaStream = this.setMediaStream.bind(this);
            const playVideo = this.playVideo.bind(this);
            const onCatchError = error => {
                console.warn(`PANOLENS.Media: ${ error }`);
            };
            return window.navigator.mediaDevices.getUserMedia(constraints).then(setMediaStream).then(playVideo).catch(onCatchError);
        },
        setVideDeviceIndex: function (index) {
            this.videoDeviceIndex = index;
        },
        start: function (targetDevice) {
            const constraints = this.constraints;
            const getUserMedia = this.getUserMedia.bind(this);
            const onVideoDevices = devices => {
                if (!devices || devices.length === 0) {
                    throw Error('no video device found');
                }
                const device = targetDevice || devices[0];
                constraints.video.deviceId = device.deviceId;
                return getUserMedia(constraints);
            };
            this.element = this.createVideoElement();
            return this.getDevices().then(onVideoDevices);
        },
        stop: function () {
            const stream = this.stream;
            if (stream && stream.active) {
                const track = stream.getTracks()[0];
                track.stop();
                window.removeEventListener('resize', this.onWindowResize.bind(this));
                this.element = null;
                this.stream = null;
            }
        },
        setMediaStream: function (stream) {
            this.stream = stream;
            this.element.srcObject = stream;
            if (this.scene) {
                this.scene.background = this.createVideoTexture();
            }
            window.addEventListener('resize', this.onWindowResize.bind(this));
        },
        playVideo: function () {
            const {element} = this;
            if (element) {
                element.play();
                this.dispatchEvent({ type: 'play' });
            }
        },
        pauseVideo: function () {
            const {element} = this;
            if (element) {
                element.pause();
                this.dispatchEvent({ type: 'pause' });
            }
        },
        createVideoTexture: function () {
            const video = this.element;
            const texture = new THREE.VideoTexture(video);
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;
            texture.center.set(0.5, 0.5);
            video.addEventListener('canplay', this.onWindowResize.bind(this));
            return texture;
        },
        createVideoElement: function () {
            const dispatchEvent = this.dispatchEvent.bind(this);
            const video = document.createElement('video');
            const canPlay = () => dispatchEvent({ type: 'canplay' });
            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectPosition = 'center';
            video.style.objectFit = 'cover';
            video.style.display = this.scene ? 'none' : '';
            video.addEventListener('canplay', canPlay);
            return video;
        },
        onWindowResize: function () {
            if (this.element && this.element.videoWidth && this.element.videoHeight && this.scene) {
                const {
                    clientWidth: width,
                    clientHeight: height
                } = this.container;
                const texture = this.scene.background;
                const {videoWidth, videoHeight} = this.element;
                const cameraRatio = videoHeight / videoWidth;
                const viewportRatio = this.container ? width / height : 1;
                const ratio = cameraRatio * viewportRatio * this.ratioScalar;
                if (width > height) {
                    texture.repeat.set(ratio, 1);
                } else {
                    texture.repeat.set(1, 1 / ratio);
                }
            }
        }
    });
    return Media;
});
define('skylark-panolens/panorama/CameraPanorama',[
    './Panorama',
    '../media/Media',
    'skylark-threejs'
], function (Panorama, Media, THREE) {
    'use strict';
    function CameraPanorama(constraints) {
        const radius = 5000;
        const geometry = new THREE.SphereBufferGeometry(radius, 60, 40);
        const material = new THREE.MeshBasicMaterial({ visible: false });
        Panorama.call(this, geometry, material);
        this.media = new Media(constraints);
        this.radius = radius;
        this.addEventListener('enter', this.start.bind(this));
        this.addEventListener('leave', this.stop.bind(this));
        this.addEventListener('panolens-container', this.onPanolensContainer.bind(this));
        this.addEventListener('panolens-scene', this.onPanolensScene.bind(this));
    }
    CameraPanorama.prototype = Object.assign(Object.create(Panorama.prototype), {
        constructor: CameraPanorama,
        onPanolensContainer: function ({container}) {
            this.media.setContainer(container);
        },
        onPanolensScene: function ({scene}) {
            this.media.setScene(scene);
        },
        start: function () {
            return this.media.start();
        },
        stop: function () {
            this.media.stop();
        }
    });
    return CameraPanorama;
});
define('skylark-panolens/Viewer',[
    './panolens',
    './Constants',
    './lib/controls/OrbitControls',
    './lib/controls/DeviceOrientationControls',
    './lib/effects/CardboardEffect',
    './lib/effects/StereoEffect',
    './widget/Widget',
    './interface/Reticle',
    './infospot/Infospot',
    './DataImage',
    './panorama/Panorama',
    './panorama/VideoPanorama',
    './panorama/CameraPanorama',
    'skylark-threejs',
    'skylark-tweenjs'
], function (panolens,Constants, OrbitControls, DeviceOrientationControls, CardboardEffect, StereoEffect, Widget, Reticle, Infospot, DataImage, Panorama, VideoPanorama, CameraPanorama, THREE, TWEEN) {
    'use strict';
    function Viewer(options) {
        let container;
        options = options || {};
        options.controlBar = options.controlBar !== undefined ? options.controlBar : true;
        options.controlButtons = options.controlButtons || [
            'fullscreen',
            'setting',
            'video'
        ];
        options.autoHideControlBar = options.autoHideControlBar !== undefined ? options.autoHideControlBar : false;
        options.autoHideInfospot = options.autoHideInfospot !== undefined ? options.autoHideInfospot : true;
        options.horizontalView = options.horizontalView !== undefined ? options.horizontalView : false;
        options.clickTolerance = options.clickTolerance || 10;
        options.cameraFov = options.cameraFov || 60;
        options.reverseDragging = options.reverseDragging || false;
        options.enableReticle = options.enableReticle || false;
        options.dwellTime = options.dwellTime || 1500;
        options.autoReticleSelect = options.autoReticleSelect !== undefined ? options.autoReticleSelect : true;
        options.viewIndicator = options.viewIndicator !== undefined ? options.viewIndicator : false;
        options.indicatorSize = options.indicatorSize || 30;
        options.output = options.output ? options.output : 'none';
        options.autoRotate = options.autoRotate || false;
        options.autoRotateSpeed = options.autoRotateSpeed || 2;
        options.autoRotateActivationDuration = options.autoRotateActivationDuration || 5000;
        this.options = options;
        if (options.container) {
            container = options.container;
            container._width = container.clientWidth;
            container._height = container.clientHeight;
        } else {
            container = document.createElement('div');
            container.classList.add('panolens-container');
            container.style.width = '100%';
            container.style.height = '100%';
            container._width = window.innerWidth;
            container._height = window.innerHeight;
            document.body.appendChild(container);
        }
        this.container = container;
        this.camera = options.camera || new THREE.PerspectiveCamera(this.options.cameraFov, this.container.clientWidth / this.container.clientHeight, 1, 10000);
        this.scene = options.scene || new THREE.Scene();
        this.renderer = options.renderer || new THREE.WebGLRenderer({
            alpha: true,
            antialias: false
        });
        this.sceneReticle = new THREE.Scene();
        this.viewIndicatorSize = this.options.indicatorSize;
        this.reticle = {};
        this.tempEnableReticle = this.options.enableReticle;
        this.mode = Constants.MODES.NORMAL;
        this.panorama = null;
        this.widget = null;
        this.hoverObject = null;
        this.infospot = null;
        this.pressEntityObject = null;
        this.pressObject = null;
        this.raycaster = new THREE.Raycaster();
        this.raycasterPoint = new THREE.Vector2();
        this.userMouse = new THREE.Vector2();
        this.updateCallbacks = [];
        this.requestAnimationId = null;
        this.cameraFrustum = new THREE.Frustum();
        this.cameraViewProjectionMatrix = new THREE.Matrix4();
        this.autoRotateRequestId = null;
        this.outputDivElement = null;
        this.touchSupported = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
        this.HANDLER_MOUSE_DOWN = this.onMouseDown.bind(this);
        this.HANDLER_MOUSE_UP = this.onMouseUp.bind(this);
        this.HANDLER_MOUSE_MOVE = this.onMouseMove.bind(this);
        this.HANDLER_WINDOW_RESIZE = this.onWindowResize.bind(this);
        this.HANDLER_KEY_DOWN = this.onKeyDown.bind(this);
        this.HANDLER_KEY_UP = this.onKeyUp.bind(this);
        this.HANDLER_TAP = this.onTap.bind(this, {
            clientX: this.container.clientWidth / 2,
            clientY: this.container.clientHeight / 2
        });
        this.OUTPUT_INFOSPOT = false;
        this.tweenLeftAnimation = new TWEEN.Tween();
        this.tweenUpAnimation = new TWEEN.Tween();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0, 0);
        this.renderer.autoClear = false;
        this.renderer.domElement.classList.add('panolens-canvas');
        this.renderer.domElement.style.display = 'block';
        this.container.style.backgroundColor = '#000';
        this.container.appendChild(this.renderer.domElement);
        this.orbitControls = new OrbitControls(this.camera, this.container);
        this.orbitControls.id = 'orbit';
        this.orbitControls.minDistance = 1;
        this.orbitControls.noPan = true;
        this.orbitControls.autoRotate = this.options.autoRotate;
        this.orbitControls.autoRotateSpeed = this.options.autoRotateSpeed;
        this.deviceOrientationControls = new DeviceOrientationControls(this.camera, this.container);
        this.deviceOrientationControls.id = 'device-orientation';
        this.deviceOrientationControls.enabled = false;
        this.camera.position.z = 1;
        if (this.options.passiveRendering) {
            console.warn('passiveRendering is now deprecated');
        }
        this.controls = [
            this.orbitControls,
            this.deviceOrientationControls
        ];
        this.control = this.orbitControls;
        this.cardboardEffect = new CardboardEffect(this.renderer);
        this.cardboardEffect.setSize(this.container.clientWidth, this.container.clientHeight);
        this.stereoEffect = new StereoEffect(this.renderer);
        this.stereoEffect.setSize(this.container.clientWidth, this.container.clientHeight);
        this.effect = this.cardboardEffect;
        this.addReticle();
        if (this.options.horizontalView) {
            this.orbitControls.minPolarAngle = Math.PI / 2;
            this.orbitControls.maxPolarAngle = Math.PI / 2;
        }
        if (this.options.controlBar !== false) {
            this.addDefaultControlBar(this.options.controlButtons);
        }
        if (this.options.viewIndicator) {
            this.addViewIndicator();
        }
        if (this.options.reverseDragging) {
            this.reverseDraggingDirection();
        }
        if (this.options.enableReticle) {
            this.enableReticleControl();
        } else {
            this.registerMouseAndTouchEvents();
        }
        if (this.options.output === 'overlay') {
            this.addOutputElement();
        }
        this.registerEventListeners();
        this.animate.call(this);
    }
    ;
    Viewer.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), {
        constructor: Viewer,
        add: function (object) {
            if (arguments.length > 1) {
                for (let i = 0; i < arguments.length; i++) {
                    this.add(arguments[i]);
                }
                return this;
            }
            this.scene.add(object);
            if (object.addEventListener) {
                object.addEventListener('panolens-viewer-handler', this.eventHandler.bind(this));
            }
            if (object instanceof Panorama && object.dispatchEvent) {
                object.dispatchEvent({
                    type: 'panolens-container',
                    container: this.container
                });
            }
            if (object instanceof CameraPanorama) {
                object.dispatchEvent({
                    type: 'panolens-scene',
                    scene: this.scene
                });
            }
            if (object.type === 'panorama') {
                this.addPanoramaEventListener(object);
                if (!this.panorama) {
                    this.setPanorama(object);
                }
            }
        },
        remove: function (object) {
            if (object.removeEventListener) {
                object.removeEventListener('panolens-viewer-handler', this.eventHandler.bind(this));
            }
            this.scene.remove(object);
        },
        addDefaultControlBar: function (array) {
            if (this.widget) {
                console.warn('Default control bar exists');
                return;
            }
            const widget = new Widget(this.container);
            widget.addEventListener('panolens-viewer-handler', this.eventHandler.bind(this));
            widget.addControlBar();
            array.forEach(buttonName => {
                widget.addControlButton(buttonName);
            });
            this.widget = widget;
        },
        setPanorama: function (pano) {
            const leavingPanorama = this.panorama;
            if (pano.type === 'panorama' && leavingPanorama !== pano) {
                this.hideInfospot();
                const afterEnterComplete = function () {
                    if (leavingPanorama) {
                        leavingPanorama.onLeave();
                    }
                    pano.removeEventListener('enter-fade-start', afterEnterComplete);
                };
                pano.addEventListener('enter-fade-start', afterEnterComplete);
                (this.panorama = pano).onEnter();
            }
        },
        eventHandler: function (event) {
            if (event.method && this[event.method]) {
                this[event.method](event.data);
            }
        },
        dispatchEventToChildren: function (event) {
            this.scene.traverse(function (object) {
                if (object.dispatchEvent) {
                    object.dispatchEvent(event);
                }
            });
        },
        activateWidgetItem: function (controlIndex, mode) {
            const mainMenu = this.widget.mainMenu;
            const ControlMenuItem = mainMenu.children[0];
            const ModeMenuItem = mainMenu.children[1];
            let item;
            if (controlIndex !== undefined) {
                switch (controlIndex) {
                case 0:
                    item = ControlMenuItem.subMenu.children[1];
                    break;
                case 1:
                    item = ControlMenuItem.subMenu.children[2];
                    break;
                default:
                    item = ControlMenuItem.subMenu.children[1];
                    break;
                }
                ControlMenuItem.subMenu.setActiveItem(item);
                ControlMenuItem.setSelectionTitle(item.textContent);
            }
            if (mode !== undefined) {
                switch (mode) {
                case Constants.MODES.CARDBOARD:
                    item = ModeMenuItem.subMenu.children[2];
                    break;
                case Constants.MODES.STEREO:
                    item = ModeMenuItem.subMenu.children[3];
                    break;
                default:
                    item = ModeMenuItem.subMenu.children[1];
                    break;
                }
                ModeMenuItem.subMenu.setActiveItem(item);
                ModeMenuItem.setSelectionTitle(item.textContent);
            }
        },
        enableEffect: function (mode) {
            if (this.mode === mode) {
                return;
            }
            if (mode === Constants.MODES.NORMAL) {
                this.disableEffect();
                return;
            } else {
                this.mode = mode;
            }
            const fov = this.camera.fov;
            switch (mode) {
            case Constants.MODES.CARDBOARD:
                this.effect = this.undefined;
                this.enableReticleControl();
                break;
            case Constants.MODES.STEREO:
                this.effect = this.undefined;
                this.enableReticleControl();
                break;
            default:
                this.effect = null;
                this.disableReticleControl();
                break;
            }
            this.activateWidgetItem(undefined, this.mode);
            this.dispatchEventToChildren({
                type: 'panolens-dual-eye-effect',
                mode: this.mode
            });
            this.camera.fov = fov + 0.01;
            this.effect.setSize(this.container.clientWidth, this.container.clientHeight);
            this.render();
            this.camera.fov = fov;
            this.dispatchEvent({
                type: 'mode-change',
                mode: this.mode
            });
        },
        disableEffect: function () {
            if (this.mode === Constants.MODES.NORMAL) {
                return;
            }
            this.mode = Constants.MODES.NORMAL;
            this.disableReticleControl();
            this.activateWidgetItem(undefined, this.mode);
            this.dispatchEventToChildren({
                type: 'panolens-dual-eye-effect',
                mode: this.mode
            });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.render();
            this.dispatchEvent({
                type: 'mode-change',
                mode: this.mode
            });
        },
        enableReticleControl: function () {
            if (this.reticle.visible) {
                return;
            }
            this.tempEnableReticle = true;
            this.unregisterMouseAndTouchEvents();
            this.reticle.show();
            this.registerReticleEvent();
            this.updateReticleEvent();
        },
        disableReticleControl: function () {
            this.tempEnableReticle = false;
            if (!this.options.enableReticle) {
                this.reticle.hide();
                this.unregisterReticleEvent();
                this.registerMouseAndTouchEvents();
            } else {
                this.updateReticleEvent();
            }
        },
        enableAutoRate: function () {
            this.options.autoRotate = true;
            this.undefined.autoRotate = true;
        },
        disableAutoRate: function () {
            clearTimeout(this.autoRotateRequestId);
            this.options.autoRotate = false;
            this.undefined.autoRotate = false;
        },
        toggleVideoPlay: function (pause) {
            if (this.panorama instanceof VideoPanorama) {
                this.panorama.dispatchEvent({
                    type: 'video-toggle',
                    pause: pause
                });
            }
        },
        setVideoCurrentTime: function (percentage) {
            if (this.panorama instanceof VideoPanorama) {
                this.panorama.dispatchEvent({
                    type: 'video-time',
                    percentage: percentage
                });
            }
        },
        onVideoUpdate: function (percentage) {
            const {widget} = this;
            if (widget) {
                widget.dispatchEvent({
                    type: 'video-update',
                    percentage: percentage
                });
            }
        },
        addUpdateCallback: function (fn) {
            if (fn) {
                this.updateCallbacks.push(fn);
            }
        },
        removeUpdateCallback: function (fn) {
            const index = this.updateCallbacks.indexOf(fn);
            if (fn && index >= 0) {
                this.updateCallbacks.splice(index, 1);
            }
        },
        showVideoWidget: function () {
            const {widget} = this;
            if (widget) {
                widget.dispatchEvent({ type: 'video-control-show' });
            }
        },
        hideVideoWidget: function () {
            const {widget} = this;
            if (widget) {
                widget.dispatchEvent({ type: 'video-control-hide' });
            }
        },
        updateVideoPlayButton: function (paused) {
            const {widget} = this;
            if (widget && widget.videoElement && widget.videoElement.controlButton) {
                widget.videoElement.controlButton.update(paused);
            }
        },
        addPanoramaEventListener: function (pano) {
            pano.addEventListener('enter-fade-start', this.setCameraControl.bind(this));
            if (pano instanceof VideoPanorama) {
                pano.addEventListener('enter-fade-start', this.showVideoWidget.bind(this));
                pano.addEventListener('leave', function () {
                    if (!(this.panorama instanceof VideoPanorama)) {
                        this.hideVideoWidget.call(this);
                    }
                }.bind(this));
            }
        },
        setCameraControl: function () {
            this.undefined.target.copy(this.panorama.position);
        },
        getControl: function () {
            return this.control;
        },
        getScene: function () {
            return this.scene;
        },
        getCamera: function () {
            return this.camera;
        },
        getRenderer: function () {
            return this.renderer;
        },
        getContainer: function () {
            return this.container;
        },
        getControlId: function () {
            return this.control.id;
        },
        getNextControlId: function () {
            return this.controls[this.getNextControlIndex()].id;
        },
        getNextControlIndex: function () {
            const controls = this.controls;
            const control = this.control;
            const nextIndex = controls.indexOf(control) + 1;
            return nextIndex >= controls.length ? 0 : nextIndex;
        },
        setCameraFov: function (fov) {
            this.camera.fov = fov;
            this.camera.updateProjectionMatrix();
        },
        enableControl: function (index) {
            index = index >= 0 && index < this.controls.length ? index : 0;
            this.control.enabled = false;
            this.control = this.controls[index];
            this.control.enabled = true;
            switch (index) {
            case Constants.CONTROLS.ORBIT:
                this.camera.position.copy(this.panorama.position);
                this.camera.position.z += 1;
                break;
            case Constants.CONTROLS.DEVICEORIENTATION:
                this.camera.position.copy(this.panorama.position);
                break;
            default:
                break;
            }
            this.control.update();
            this.activateWidgetItem(index, undefined);
        },
        disableControl: function () {
            this.control.enabled = false;
        },
        toggleNextControl: function () {
            this.enableControl(this.getNextControlIndex());
        },
        getScreenVector: function (worldVector) {
            const vector = worldVector.clone();
            const widthHalf = this.container.clientWidth / 2;
            const heightHalf = this.container.clientHeight / 2;
            vector.project(this.camera);
            vector.x = vector.x * widthHalf + widthHalf;
            vector.y = -(vector.y * heightHalf) + heightHalf;
            vector.z = 0;
            return vector;
        },
        checkSpriteInViewport: function (sprite) {
            this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
            this.cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
            this.cameraFrustum.setFromMatrix(this.cameraViewProjectionMatrix);
            return sprite.visible && this.cameraFrustum.intersectsSprite(sprite);
        },
        reverseDraggingDirection: function () {
            this.undefined.rotateSpeed *= -1;
            this.undefined.momentumScalingFactor *= -1;
        },
        addReticle: function () {
            this.reticle = new Reticle(16777215, true, this.options.dwellTime);
            this.reticle.hide();
            this.camera.add(this.reticle);
            this.sceneReticle.add(this.camera);
        },
        tweenControlCenter: function (vector, duration, easing) {
            if (this.control !== this.undefined) {
                return;
            }
            if (vector instanceof Array) {
                duration = vector[1];
                easing = vector[2];
                vector = vector[0];
            }
            duration = duration !== undefined ? duration : 1000;
            easing = easing || TWEEN.Easing.Exponential.Out;
            let scope, ha, va, chv, cvv, hv, vv, vptc, ov, nv;
            scope = this;
            chv = this.camera.getWorldDirection(new THREE.Vector3());
            cvv = chv.clone();
            vptc = this.panorama.getWorldPosition(new THREE.Vector3()).sub(this.camera.getWorldPosition(new THREE.Vector3()));
            hv = vector.clone();
            hv.x *= -1;
            hv.add(vptc).normalize();
            vv = hv.clone();
            chv.y = 0;
            hv.y = 0;
            ha = Math.atan2(hv.z, hv.x) - Math.atan2(chv.z, chv.x);
            ha = ha > Math.PI ? ha - 2 * Math.PI : ha;
            ha = ha < -Math.PI ? ha + 2 * Math.PI : ha;
            va = Math.abs(cvv.angleTo(chv) + (cvv.y * vv.y <= 0 ? vv.angleTo(hv) : -vv.angleTo(hv)));
            va *= vv.y < cvv.y ? 1 : -1;
            ov = {
                left: 0,
                up: 0
            };
            nv = {
                left: 0,
                up: 0
            };
            this.tweenLeftAnimation.stop();
            this.tweenUpAnimation.stop();
            this.tweenLeftAnimation = new TWEEN.Tween(ov).to({ left: ha }, duration).easing(easing).onUpdate(function (ov) {
                scope.control.rotateLeft(ov.left - nv.left);
                nv.left = ov.left;
            }).start();
            this.tweenUpAnimation = new TWEEN.Tween(ov).to({ up: va }, duration).easing(easing).onUpdate(function (ov) {
                scope.control.rotateUp(ov.up - nv.up);
                nv.up = ov.up;
            }).start();
        },
        tweenControlCenterByObject: function (object, duration, easing) {
            let isUnderScalePlaceHolder = false;
            object.traverseAncestors(function (ancestor) {
                if (ancestor.scalePlaceHolder) {
                    isUnderScalePlaceHolder = true;
                }
            });
            if (isUnderScalePlaceHolder) {
                const invertXVector = new THREE.Vector3(-1, 1, 1);
                this.tweenControlCenter(object.getWorldPosition(new THREE.Vector3()).multiply(invertXVector), duration, easing);
            } else {
                this.tweenControlCenter(object.getWorldPosition(new THREE.Vector3()), duration, easing);
            }
        },
        onWindowResize: function (windowWidth, windowHeight) {
            let width, height;
            const expand = this.container.classList.contains('panolens-container') || this.container.isFullscreen;
            if (windowWidth !== undefined && windowHeight !== undefined) {
                width = windowWidth;
                height = windowHeight;
                this.container._width = windowWidth;
                this.container._height = windowHeight;
            } else {
                const isAndroid = /(android)/i.test(window.navigator.userAgent);
                const adjustWidth = isAndroid ? Math.min(document.documentElement.clientWidth, window.innerWidth || 0) : Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                const adjustHeight = isAndroid ? Math.min(document.documentElement.clientHeight, window.innerHeight || 0) : Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                width = expand ? adjustWidth : this.container.clientWidth;
                height = expand ? adjustHeight : this.container.clientHeight;
                this.container._width = width;
                this.container._height = height;
            }
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            if (this.options.enableReticle || this.tempEnableReticle) {
                this.updateReticleEvent();
            }
            this.dispatchEvent({
                type: 'window-resize',
                width: width,
                height: height
            });
            this.scene.traverse(function (object) {
                if (object.dispatchEvent) {
                    object.dispatchEvent({
                        type: 'window-resize',
                        width: width,
                        height: height
                    });
                }
            });
        },
        addOutputElement: function () {
            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.right = '10px';
            element.style.top = '10px';
            element.style.color = '#fff';
            this.container.appendChild(element);
            this.outputDivElement = element;
        },
        outputPosition: function () {
            const intersects = this.raycaster.intersectObject(this.panorama, true);
            if (intersects.length > 0) {
                const point = intersects[0].point.clone();
                const converter = new THREE.Vector3(-1, 1, 1);
                const world = this.panorama.getWorldPosition(new THREE.Vector3());
                point.sub(world).multiply(converter);
                const message = `${ point.x.toFixed(2) }, ${ point.y.toFixed(2) }, ${ point.z.toFixed(2) }`;
                if (point.length() === 0) {
                    return;
                }
                switch (this.options.output) {
                case 'console':
                    console.info(message);
                    break;
                case 'overlay':
                    this.outputDivElement.textContent = message;
                    break;
                default:
                    break;
                }
            }
        },
        onMouseDown: function (event) {
            event.preventDefault();
            this.userMouse.x = event.clientX >= 0 ? event.clientX : event.touches[0].clientX;
            this.userMouse.y = event.clientY >= 0 ? event.clientY : event.touches[0].clientY;
            this.userMouse.type = 'mousedown';
            this.onTap(event);
        },
        onMouseMove: function (event) {
            event.preventDefault();
            this.userMouse.type = 'mousemove';
            this.onTap(event);
        },
        onMouseUp: function (event) {
            let onTarget = false;
            this.userMouse.type = 'mouseup';
            const type = this.userMouse.x >= event.clientX - this.options.clickTolerance && this.userMouse.x <= event.clientX + this.options.clickTolerance && this.userMouse.y >= event.clientY - this.options.clickTolerance && this.userMouse.y <= event.clientY + this.options.clickTolerance || event.changedTouches && this.userMouse.x >= event.changedTouches[0].clientX - this.options.clickTolerance && this.userMouse.x <= event.changedTouches[0].clientX + this.options.clickTolerance && this.userMouse.y >= event.changedTouches[0].clientY - this.options.clickTolerance && this.userMouse.y <= event.changedTouches[0].clientY + this.options.clickTolerance ? 'click' : undefined;
            if (event && event.target && !event.target.classList.contains('panolens-canvas')) {
                return;
            }
            event.preventDefault();
            if (event.changedTouches && event.changedTouches.length === 1) {
                onTarget = this.onTap({
                    clientX: event.changedTouches[0].clientX,
                    clientY: event.changedTouches[0].clientY
                }, type);
            } else {
                onTarget = this.onTap(event, type);
            }
            this.userMouse.type = 'none';
            if (onTarget) {
                return;
            }
            if (type === 'click') {
                const {
                    options: {autoHideInfospot, autoHideControlBar},
                    panorama,
                    toggleControlBar
                } = this;
                if (autoHideInfospot && panorama) {
                    panorama.toggleInfospotVisibility();
                }
                if (autoHideControlBar) {
                    toggleControlBar();
                }
            }
        },
        onTap: function (event, type) {
            const {left, top} = this.container.getBoundingClientRect();
            const {clientWidth, clientHeight} = this.container;
            this.raycasterPoint.x = (event.clientX - left) / clientWidth * 2 - 1;
            this.raycasterPoint.y = -((event.clientY - top) / clientHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.raycasterPoint, this.camera);
            if (!this.panorama) {
                return;
            }
            if (event.type !== 'mousedown' && this.touchSupported || this.OUTPUT_INFOSPOT) {
                this.outputPosition();
            }
            const intersects = this.raycaster.intersectObjects(this.panorama.children, true);
            const intersect_entity = this.getConvertedIntersect(intersects);
            const intersect = intersects.length > 0 ? intersects[0].object : undefined;
            if (this.userMouse.type === 'mouseup') {
                if (intersect_entity && this.pressEntityObject === intersect_entity && this.pressEntityObject.dispatchEvent) {
                    this.pressEntityObject.dispatchEvent({
                        type: 'pressstop-entity',
                        mouseEvent: event
                    });
                }
                this.pressEntityObject = undefined;
            }
            if (this.userMouse.type === 'mouseup') {
                if (intersect && this.pressObject === intersect && this.pressObject.dispatchEvent) {
                    this.pressObject.dispatchEvent({
                        type: 'pressstop',
                        mouseEvent: event
                    });
                }
                this.pressObject = undefined;
            }
            if (type === 'click') {
                this.panorama.dispatchEvent({
                    type: 'click',
                    intersects: intersects,
                    mouseEvent: event
                });
                if (intersect_entity && intersect_entity.dispatchEvent) {
                    intersect_entity.dispatchEvent({
                        type: 'click-entity',
                        mouseEvent: event
                    });
                }
                if (intersect && intersect.dispatchEvent) {
                    intersect.dispatchEvent({
                        type: 'click',
                        mouseEvent: event
                    });
                }
            } else {
                this.panorama.dispatchEvent({
                    type: 'hover',
                    intersects: intersects,
                    mouseEvent: event
                });
                if (this.hoverObject && intersects.length > 0 && this.hoverObject !== intersect_entity || this.hoverObject && intersects.length === 0) {
                    if (this.hoverObject.dispatchEvent) {
                        this.hoverObject.dispatchEvent({
                            type: 'hoverleave',
                            mouseEvent: event
                        });
                        this.reticle.end();
                    }
                    this.hoverObject = undefined;
                }
                if (intersect_entity && intersects.length > 0) {
                    if (this.hoverObject !== intersect_entity) {
                        this.hoverObject = intersect_entity;
                        if (this.hoverObject.dispatchEvent) {
                            this.hoverObject.dispatchEvent({
                                type: 'hoverenter',
                                mouseEvent: event
                            });
                            if (this.options.autoReticleSelect && this.options.enableReticle || this.tempEnableReticle) {
                                this.reticle.start(this.onTap.bind(this, event, 'click'));
                            }
                        }
                    }
                    if (this.userMouse.type === 'mousedown' && this.pressEntityObject != intersect_entity) {
                        this.pressEntityObject = intersect_entity;
                        if (this.pressEntityObject.dispatchEvent) {
                            this.pressEntityObject.dispatchEvent({
                                type: 'pressstart-entity',
                                mouseEvent: event
                            });
                        }
                    }
                    if (this.userMouse.type === 'mousedown' && this.pressObject != intersect) {
                        this.pressObject = intersect;
                        if (this.pressObject.dispatchEvent) {
                            this.pressObject.dispatchEvent({
                                type: 'pressstart',
                                mouseEvent: event
                            });
                        }
                    }
                    if (this.userMouse.type === 'mousemove' || this.options.enableReticle) {
                        if (intersect && intersect.dispatchEvent) {
                            intersect.dispatchEvent({
                                type: 'hover',
                                mouseEvent: event
                            });
                        }
                        if (this.pressEntityObject && this.pressEntityObject.dispatchEvent) {
                            this.pressEntityObject.dispatchEvent({
                                type: 'pressmove-entity',
                                mouseEvent: event
                            });
                        }
                        if (this.pressObject && this.pressObject.dispatchEvent) {
                            this.pressObject.dispatchEvent({
                                type: 'pressmove',
                                mouseEvent: event
                            });
                        }
                    }
                }
                if (!intersect_entity && this.pressEntityObject && this.pressEntityObject.dispatchEvent) {
                    this.pressEntityObject.dispatchEvent({
                        type: 'pressstop-entity',
                        mouseEvent: event
                    });
                    this.pressEntityObject = undefined;
                }
                if (!intersect && this.pressObject && this.pressObject.dispatchEvent) {
                    this.pressObject.dispatchEvent({
                        type: 'pressstop',
                        mouseEvent: event
                    });
                    this.pressObject = undefined;
                }
            }
            if (intersect && intersect instanceof Infospot) {
                this.infospot = intersect;
                if (type === 'click') {
                    return true;
                }
            } else if (this.infospot) {
                this.hideInfospot();
            }
            if (this.options.autoRotate && this.userMouse.type !== 'mousemove') {
                clearTimeout(this.autoRotateRequestId);
                if (this.control === this.undefined) {
                    this.undefined.autoRotate = false;
                    this.autoRotateRequestId = window.setTimeout(this.enableAutoRate.bind(this), this.options.autoRotateActivationDuration);
                }
            }
        },
        getConvertedIntersect: function (intersects) {
            let intersect;
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].distance >= 0 && intersects[i].object && !intersects[i].object.passThrough) {
                    if (intersects[i].object.entity && intersects[i].object.entity.passThrough) {
                        continue;
                    } else if (intersects[i].object.entity && !intersects[i].object.entity.passThrough) {
                        intersect = intersects[i].object.entity;
                        break;
                    } else {
                        intersect = intersects[i].object;
                        break;
                    }
                }
            }
            return intersect;
        },
        hideInfospot: function () {
            if (this.infospot) {
                this.infospot.onHoverEnd();
                this.infospot = undefined;
            }
        },
        toggleControlBar: function () {
            const {widget} = this;
            if (widget) {
                widget.dispatchEvent({ type: 'control-bar-toggle' });
            }
        },
        onKeyDown: function (event) {
            if (this.options.output && this.options.output !== 'none' && event.key === 'Control') {
                this.OUTPUT_INFOSPOT = true;
            }
        },
        onKeyUp: function () {
            this.OUTPUT_INFOSPOT = false;
        },
        update: function () {
            TWEEN.update();
            this.updateCallbacks.forEach(function (callback) {
                callback();
            });
            this.control.update();
            this.scene.traverse(function (child) {
                if (child instanceof Infospot && child.element && (this.hoverObject === child || child.element.style.display !== 'none' || child.element.left && child.element.left.style.display !== 'none' || child.element.right && child.element.right.style.display !== 'none')) {
                    if (this.checkSpriteInViewport(child)) {
                        const {x, y} = this.getScreenVector(child.getWorldPosition(new THREE.Vector3()));
                        child.translateElement(x, y);
                    } else {
                        child.onDismiss();
                    }
                }
            }.bind(this));
        },
        render: function () {
            if (this.mode === Constants.MODES.CARDBOARD || this.mode === Constants.MODES.STEREO) {
                this.renderer.clear();
                this.effect.render(this.scene, this.camera);
                this.effect.render(this.sceneReticle, this.camera);
            } else {
                this.renderer.clear();
                this.renderer.render(this.scene, this.camera);
                this.renderer.clearDepth();
                this.renderer.render(this.sceneReticle, this.camera);
            }
        },
        animate: function () {
            this.requestAnimationId = window.requestAnimationFrame(this.animate.bind(this));
            this.onChange();
        },
        onChange: function () {
            this.update();
            this.render();
        },
        registerMouseAndTouchEvents: function () {
            const options = { passive: false };
            this.container.addEventListener('mousedown', this.HANDLER_MOUSE_DOWN, options);
            this.container.addEventListener('mousemove', this.HANDLER_MOUSE_MOVE, options);
            this.container.addEventListener('mouseup', this.HANDLER_MOUSE_UP, options);
            this.container.addEventListener('touchstart', this.HANDLER_MOUSE_DOWN, options);
            this.container.addEventListener('touchend', this.HANDLER_MOUSE_UP, options);
        },
        unregisterMouseAndTouchEvents: function () {
            this.container.removeEventListener('mousedown', this.HANDLER_MOUSE_DOWN, false);
            this.container.removeEventListener('mousemove', this.HANDLER_MOUSE_MOVE, false);
            this.container.removeEventListener('mouseup', this.HANDLER_MOUSE_UP, false);
            this.container.removeEventListener('touchstart', this.HANDLER_MOUSE_DOWN, false);
            this.container.removeEventListener('touchend', this.HANDLER_MOUSE_UP, false);
        },
        registerReticleEvent: function () {
            this.addUpdateCallback(this.HANDLER_TAP);
        },
        unregisterReticleEvent: function () {
            this.removeUpdateCallback(this.HANDLER_TAP);
        },
        updateReticleEvent: function () {
            const clientX = this.container.clientWidth / 2 + this.container.offsetLeft;
            const clientY = this.container.clientHeight / 2;
            this.removeUpdateCallback(this.HANDLER_TAP);
            this.HANDLER_TAP = this.onTap.bind(this, {
                clientX,
                clientY
            });
            this.addUpdateCallback(this.HANDLER_TAP);
        },
        registerEventListeners: function () {
            window.addEventListener('resize', this.HANDLER_WINDOW_RESIZE, true);
            window.addEventListener('keydown', this.HANDLER_KEY_DOWN, true);
            window.addEventListener('keyup', this.HANDLER_KEY_UP, true);
        },
        unregisterEventListeners: function () {
            window.removeEventListener('resize', this.HANDLER_WINDOW_RESIZE, true);
            window.removeEventListener('keydown', this.HANDLER_KEY_DOWN, true);
            window.removeEventListener('keyup', this.HANDLER_KEY_UP, true);
        },
        dispose: function () {
            this.tweenLeftAnimation.stop();
            this.tweenUpAnimation.stop();
            this.unregisterEventListeners();
            function recursiveDispose(object) {
                for (let i = object.children.length - 1; i >= 0; i--) {
                    recursiveDispose(object.children[i]);
                    object.remove(object.children[i]);
                }
                if (object instanceof Panorama || object instanceof Infospot) {
                    object.dispose();
                    object = null;
                } else if (object.dispatchEvent) {
                    object.dispatchEvent('dispose');
                }
            }
            recursiveDispose(this.scene);
            if (this.widget) {
                this.widget.dispose();
                this.widget = null;
            }
            if (THREE.Cache && THREE.Cache.enabled) {
                THREE.Cache.clear();
            }
        },
        destroy: function () {
            this.dispose();
            this.render();
            window.cancelAnimationFrame(this.requestAnimationId);
        },
        onPanoramaDispose: function (panorama) {
            if (panorama instanceof VideoPanorama) {
                this.hideVideoWidget();
            }
            if (panorama === this.panorama) {
                this.panorama = null;
            }
        },
        loadAsyncRequest: function (url, callback = () => {
        }) {
            const request = new window.XMLHttpRequest();
            request.onloadend = function (event) {
                callback(event);
            };
            request.open('GET', url, true);
            request.send(null);
        },
        addViewIndicator: function () {
            const scope = this;
            function loadViewIndicator(asyncEvent) {
                if (asyncEvent.loaded === 0)
                    return;
                const viewIndicatorDiv = asyncEvent.target.responseXML.documentElement;
                viewIndicatorDiv.style.width = scope.viewIndicatorSize + 'px';
                viewIndicatorDiv.style.height = scope.viewIndicatorSize + 'px';
                viewIndicatorDiv.style.position = 'absolute';
                viewIndicatorDiv.style.top = '10px';
                viewIndicatorDiv.style.left = '10px';
                viewIndicatorDiv.style.opacity = '0.5';
                viewIndicatorDiv.style.cursor = 'pointer';
                viewIndicatorDiv.id = 'panolens-view-indicator-container';
                scope.container.appendChild(viewIndicatorDiv);
                const indicator = viewIndicatorDiv.querySelector('#indicator');
                const setIndicatorD = function () {
                    scope.radius = scope.viewIndicatorSize * 0.225;
                    scope.currentPanoAngle = scope.camera.rotation.y - THREE.Math.degToRad(90);
                    scope.fovAngle = THREE.Math.degToRad(scope.camera.fov);
                    scope.leftAngle = -scope.currentPanoAngle - scope.fovAngle / 2;
                    scope.rightAngle = -scope.currentPanoAngle + scope.fovAngle / 2;
                    scope.leftX = scope.radius * Math.cos(scope.leftAngle);
                    scope.leftY = scope.radius * Math.sin(scope.leftAngle);
                    scope.rightX = scope.radius * Math.cos(scope.rightAngle);
                    scope.rightY = scope.radius * Math.sin(scope.rightAngle);
                    scope.indicatorD = 'M ' + scope.leftX + ' ' + scope.leftY + ' A ' + scope.radius + ' ' + scope.radius + ' 0 0 1 ' + scope.rightX + ' ' + scope.rightY;
                    if (scope.leftX && scope.leftY && scope.rightX && scope.rightY && scope.radius) {
                        indicator.setAttribute('d', scope.indicatorD);
                    }
                };
                scope.addUpdateCallback(setIndicatorD);
                const indicatorOnMouseEnter = function () {
                    this.style.opacity = '1';
                };
                const indicatorOnMouseLeave = function () {
                    this.style.opacity = '0.5';
                };
                viewIndicatorDiv.addEventListener('mouseenter', indicatorOnMouseEnter);
                viewIndicatorDiv.addEventListener('mouseleave', indicatorOnMouseLeave);
            }
            this.loadAsyncRequest(DataImage.ViewIndicator, loadViewIndicator);
        },
        appendControlItem: function (option) {
            const item = this.widget.createCustomItem(option);
            if (option.group === 'video') {
                this.widget.videoElement.appendChild(item);
            } else {
                this.widget.barElement.appendChild(item);
            }
            return item;
        },
        clearAllCache: function () {
            THREE.Cache.clear();
        }
    });
    return panolens.Viewer = Viewer;
});
define('skylark-panolens/loaders/CubeTextureLoader',[
    './ImageLoader',
    'skylark-threejs'
], function (ImageLoader, THREE) {
    'use strict';
    const CubeTextureLoader = {
        load: function (urls, onLoad = () => {
        }, onProgress = () => {
        }, onError) {
            var texture, loaded, progress, all, loadings;
            texture = new THREE.CubeTexture([]);
            loaded = 0;
            progress = {};
            all = {};
            urls.map(function (url, index) {
                ImageLoader.load(url, function (image) {
                    texture.images[index] = image;
                    loaded++;
                    if (loaded === 6) {
                        texture.needsUpdate = true;
                        onLoad(texture);
                    }
                }, function (event) {
                    progress[index] = {
                        loaded: event.loaded,
                        total: event.total
                    };
                    all.loaded = 0;
                    all.total = 0;
                    loadings = 0;
                    for (var i in progress) {
                        loadings++;
                        all.loaded += progress[i].loaded;
                        all.total += progress[i].total;
                    }
                    if (loadings < 6) {
                        all.total = all.total / loadings * 6;
                    }
                    onProgress(all);
                }, onError);
            });
            return texture;
        }
    };
    return CubeTextureLoader;
});
define('skylark-panolens/panorama/ImagePanorama',[
    './Panorama',
    '../loaders/TextureLoader',
    'skylark-threejs'
], function (Panorama, TextureLoader, THREE) {
    'use strict';
    function ImagePanorama(image, _geometry, _material) {
        const radius = 5000;
        const geometry = _geometry || new THREE.SphereBufferGeometry(radius, 60, 40);
        const material = _material || new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true
        });
        Panorama.call(this, geometry, material);
        this.src = image;
        this.radius = radius;
    }
    ImagePanorama.prototype = Object.assign(Object.create(Panorama.prototype), {
        constructor: ImagePanorama,
        load: function (src) {
            src = src || this.src;
            if (!src) {
                console.warn('Image source undefined');
                return;
            } else if (typeof src === 'string') {
                TextureLoader.load(src, this.onLoad.bind(this), this.onProgress.bind(this), this.onError.bind(this));
            } else if (src instanceof HTMLImageElement) {
                this.onLoad(new THREE.Texture(src));
            }
        },
        onLoad: function (texture) {
            texture.minFilter = texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
            this.updateTexture(texture);
            window.requestAnimationFrame(Panorama.prototype.onLoad.bind(this));
        },
        reset: function () {
            Panorama.prototype.reset.call(this);
        },
        dispose: function () {
            const {
                material: {map}
            } = this;
            THREE.Cache.remove(this.src);
            if (map) {
                map.dispose();
            }
            Panorama.prototype.dispose.call(this);
        }
    });
    return ImagePanorama;
});
define('skylark-panolens/panorama/EmptyPanorama',[
    './Panorama',
    'skylark-threejs'
], function (Panorama, THREE) {
    'use strict';
    function EmptyPanorama() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshBasicMaterial({
            color: 0,
            opacity: 0,
            transparent: true
        });
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(), 1));
        Panorama.call(this, geometry, material);
    }
    EmptyPanorama.prototype = Object.assign(Object.create(Panorama.prototype), { constructor: EmptyPanorama });
    return EmptyPanorama;
});
define('skylark-panolens/panorama/CubePanorama',[
    './Panorama',
    '../loaders/CubeTextureLoader',
    'skylark-threejs'
], function (Panorama, CubeTextureLoader, THREE) {
    'use strict';
    function CubePanorama(images = []) {
        const edgeLength = 10000;
        const shader = Object.assign({}, THREE.ShaderLib['cube']);
        const geometry = new THREE.BoxBufferGeometry(edgeLength, edgeLength, edgeLength);
        const material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            side: THREE.BackSide,
            transparent: true
        });
        Panorama.call(this, geometry, material);
        this.images = images;
        this.edgeLength = edgeLength;
        this.material.uniforms.opacity.value = 0;
    }
    CubePanorama.prototype = Object.assign(Object.create(Panorama.prototype), {
        constructor: CubePanorama,
        load: function () {
            CubeTextureLoader.load(this.images, this.onLoad.bind(this), this.onProgress.bind(this), this.onError.bind(this));
        },
        onLoad: function (texture) {
            this.material.uniforms['tCube'].value = texture;
            Panorama.prototype.onLoad.call(this);
        },
        dispose: function () {
            const {value} = this.material.uniforms.tCube;
            this.images.forEach(image => {
                THREE.Cache.remove(image);
            });
            if (value instanceof THREE.CubeTexture) {
                value.dispose();
            }
            Panorama.prototype.dispose.call(this);
        }
    });
    return CubePanorama;
});
define('skylark-panolens/panorama/BasicPanorama',[
    './CubePanorama',
    '../DataImage'
], function (CubePanorama, DataImage) {
    'use strict';
    function BasicPanorama() {
        const images = [];
        for (let i = 0; i < 6; i++) {
            images.push(DataImage.WhiteTile);
        }
        CubePanorama.call(this, images);
    }
    BasicPanorama.prototype = Object.assign(Object.create(CubePanorama.prototype), { constructor: BasicPanorama });
    return BasicPanorama;
});
define('skylark-panolens/loaders/GoogleStreetviewLoader',['./TextureLoader'], function (TextureLoader) {
    'use strict';
    function GoogleStreetviewLoader(parameters = {}) {
        this._parameters = parameters;
        this._zoom = null;
        this._panoId = null;
        this._panoClient = new google.maps.StreetViewService();
        this._count = 0;
        this._total = 0;
        this._canvas = [];
        this._ctx = [];
        this._wc = 0;
        this._hc = 0;
        this.result = null;
        this.rotation = 0;
        this.copyright = '';
        this.onSizeChange = null;
        this.onPanoramaLoad = null;
        this.levelsW = [
            1,
            2,
            4,
            7,
            13,
            26
        ];
        this.levelsH = [
            1,
            1,
            2,
            4,
            7,
            13
        ];
        this.widths = [
            416,
            832,
            1664,
            3328,
            6656,
            13312
        ];
        this.heights = [
            416,
            416,
            832,
            1664,
            3328,
            6656
        ];
        this.maxW = 6656;
        this.maxH = 6656;
        let gl;
        try {
            const canvas = document.createElement('canvas');
            gl = canvas.getContext('experimental-webgl');
            if (!gl) {
                gl = canvas.getContext('webgl');
            }
        } catch (error) {
        }
        this.maxW = Math.max(gl.getParameter(gl.MAX_TEXTURE_SIZE), this.maxW);
        this.maxH = Math.max(gl.getParameter(gl.MAX_TEXTURE_SIZE), this.maxH);
    }
    Object.assign(GoogleStreetviewLoader.prototype, {
        constructor: GoogleStreetviewLoader,
        setProgress: function (loaded, total) {
            if (this.onProgress) {
                this.onProgress({
                    loaded: loaded,
                    total: total
                });
            }
        },
        adaptTextureToZoom: function () {
            const w = this.widths[this._zoom];
            const h = this.heights[this._zoom];
            const maxW = this.maxW;
            const maxH = this.maxH;
            this._wc = Math.ceil(w / maxW);
            this._hc = Math.ceil(h / maxH);
            for (let y = 0; y < this._hc; y++) {
                for (let x = 0; x < this._wc; x++) {
                    const c = document.createElement('canvas');
                    if (x < this._wc - 1)
                        c.width = maxW;
                    else
                        c.width = w - maxW * x;
                    if (y < this._hc - 1)
                        c.height = maxH;
                    else
                        c.height = h - maxH * y;
                    this._canvas.push(c);
                    this._ctx.push(c.getContext('2d'));
                }
            }
        },
        composeFromTile: function (x, y, texture) {
            const maxW = this.maxW;
            const maxH = this.maxH;
            x *= 512;
            y *= 512;
            const px = Math.floor(x / maxW);
            const py = Math.floor(y / maxH);
            x -= px * maxW;
            y -= py * maxH;
            this._ctx[py * this._wc + px].drawImage(texture, 0, 0, texture.width, texture.height, x, y, 512, 512);
            this.progress();
        },
        progress: function () {
            this._count++;
            this.setProgress(this._count, this._total);
            if (this._count === this._total) {
                this.canvas = this._canvas;
                this.panoId = this._panoId;
                this.zoom = this._zoom;
                if (this.onPanoramaLoad) {
                    this.onPanoramaLoad(this._canvas[0]);
                }
            }
        },
        composePanorama: function () {
            this.setProgress(0, 1);
            const w = this.levelsW[this._zoom];
            const h = this.levelsH[this._zoom];
            const self = this;
            this._count = 0;
            this._total = w * h;
            const {useWebGL} = this._parameters;
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const url = 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=tile&zoom=' + this._zoom + '&x=' + x + '&y=' + y + '&panoid=' + this._panoId + '&nbt&fover=2';
                    (function (x, y) {
                        if (useWebGL) {
                            const texture = TextureLoader.load(url, null, function () {
                                self.composeFromTile(x, y, texture);
                            });
                        } else {
                            const img = new Image();
                            img.addEventListener('load', function () {
                                self.composeFromTile(x, y, this);
                            });
                            img.crossOrigin = '';
                            img.src = url;
                        }
                    }(x, y));
                }
            }
        },
        load: function (panoid) {
            this.loadPano(panoid);
        },
        loadPano: function (id) {
            const self = this;
            this._panoClient.getPanoramaById(id, function (result, status) {
                if (status === google.maps.StreetViewStatus.OK) {
                    self.result = result;
                    self.copyright = result.copyright;
                    self._panoId = result.location.pano;
                    self.composePanorama();
                }
            });
        },
        setZoom: function (z) {
            this._zoom = z;
            this.adaptTextureToZoom();
        }
    });
    return GoogleStreetviewLoader;
});
define('skylark-panolens/panorama/GoogleStreetviewPanorama',[
    './ImagePanorama',
    '../loaders/GoogleStreetviewLoader',
    'skylark-threejs'
], function (ImagePanorama, GoogleStreetviewLoader, THREE) {
    'use strict';
    function GoogleStreetviewPanorama(panoId, apiKey) {
        ImagePanorama.call(this);
        this.panoId = panoId;
        this.gsvLoader = null;
        this.loadRequested = false;
        this.setupGoogleMapAPI(apiKey);
    }
    GoogleStreetviewPanorama.prototype = Object.assign(Object.create(ImagePanorama.prototype), {
        constructor: GoogleStreetviewPanorama,
        load: function (panoId) {
            this.loadRequested = true;
            panoId = panoId || this.panoId || {};
            if (panoId && this.gsvLoader) {
                this.loadGSVLoader(panoId);
            }
        },
        setupGoogleMapAPI: function (apiKey) {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?';
            script.src += apiKey ? 'key=' + apiKey : '';
            script.onreadystatechange = this.setGSVLoader.bind(this);
            script.onload = this.setGSVLoader.bind(this);
            document.querySelector('head').appendChild(script);
        },
        setGSVLoader: function () {
            this.gsvLoader = new GoogleStreetviewLoader();
            if (this.loadRequested) {
                this.load();
            }
        },
        getGSVLoader: function () {
            return this.gsvLoader;
        },
        loadGSVLoader: function (panoId) {
            this.loadRequested = false;
            this.gsvLoader.onProgress = this.onProgress.bind(this);
            this.gsvLoader.onPanoramaLoad = this.onLoad.bind(this);
            this.gsvLoader.setZoom(this.getZoomLevel());
            this.gsvLoader.load(panoId);
            this.gsvLoader.loaded = true;
        },
        onLoad: function (canvas) {
            ImagePanorama.prototype.onLoad.call(this, new THREE.Texture(canvas));
        },
        reset: function () {
            this.gsvLoader = undefined;
            ImagePanorama.prototype.reset.call(this);
        }
    });
    return GoogleStreetviewPanorama;
});
define('skylark-panolens/shaders/StereographicShader',['skylark-threejs'], function (THREE) {
    'use strict';
    const StereographicShader = {
        uniforms: {
            'tDiffuse': { value: new THREE.Texture() },
            'resolution': { value: 1 },
            'transform': { value: new THREE.Matrix4() },
            'zoom': { value: 1 },
            'opacity': { value: 1 }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            'vUv = uv;',
            'gl_Position = vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D tDiffuse;',
            'uniform float resolution;',
            'uniform mat4 transform;',
            'uniform float zoom;',
            'uniform float opacity;',
            'varying vec2 vUv;',
            'const float PI = 3.141592653589793;',
            'void main(){',
            'vec2 position = -1.0 +  2.0 * vUv;',
            'position *= vec2( zoom * resolution, zoom * 0.5 );',
            'float x2y2 = position.x * position.x + position.y * position.y;',
            'vec3 sphere_pnt = vec3( 2. * position, x2y2 - 1. ) / ( x2y2 + 1. );',
            'sphere_pnt = vec3( transform * vec4( sphere_pnt, 1.0 ) );',
            'vec2 sampleUV = vec2(',
            '(atan(sphere_pnt.y, sphere_pnt.x) / PI + 1.0) * 0.5,',
            '(asin(sphere_pnt.z) / PI + 0.5)',
            ');',
            'gl_FragColor = texture2D( tDiffuse, sampleUV );',
            'gl_FragColor.a *= opacity;',
            '}'
        ].join('\n')
    };
    return StereographicShader;
});
define('skylark-panolens/panorama/LittlePlanet',[
    './ImagePanorama',
    '../infospot/Infospot',
    '../Constants',
    '../shaders/StereographicShader',
    'skylark-threejs'
], function (ImagePanorama, Infospot, Constants, StereographicShader, THREE) {
    'use strict';
    function LittlePlanet(type = 'image', source, size = 10000, ratio = 0.5) {
        if (type === 'image') {
            ImagePanorama.call(this, source, this.createGeometry(size, ratio), this.createMaterial(size));
        }
        this.size = size;
        this.ratio = ratio;
        this.EPS = 0.000001;
        this.frameId = null;
        this.dragging = false;
        this.userMouse = new THREE.Vector2();
        this.quatA = new THREE.Quaternion();
        this.quatB = new THREE.Quaternion();
        this.quatCur = new THREE.Quaternion();
        this.quatSlerp = new THREE.Quaternion();
        this.vectorX = new THREE.Vector3(1, 0, 0);
        this.vectorY = new THREE.Vector3(0, 1, 0);
        this.addEventListener('window-resize', this.onWindowResize);
    }
    LittlePlanet.prototype = Object.assign(Object.create(ImagePanorama.prototype), {
        constructor: LittlePlanet,
        add: function (object) {
            if (arguments.length > 1) {
                for (let i = 0; i < arguments.length; i++) {
                    this.add(arguments[i]);
                }
                return this;
            }
            if (object instanceof Infospot) {
                object.material.depthTest = false;
            }
            ImagePanorama.prototype.add.call(this, object);
        },
        createGeometry: function (size, ratio) {
            return new THREE.PlaneBufferGeometry(size, size * ratio);
        },
        createMaterial: function (size) {
            const shader = Object.assign({}, StereographicShader), uniforms = shader.uniforms;
            uniforms.zoom.value = size;
            uniforms.opacity.value = 0;
            return new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader,
                side: THREE.BackSide,
                transparent: true
            });
        },
        registerMouseEvents: function () {
            this.container.addEventListener('mousedown', this.onMouseDown.bind(this), { passive: true });
            this.container.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });
            this.container.addEventListener('mouseup', this.onMouseUp.bind(this), { passive: true });
            this.container.addEventListener('touchstart', this.onMouseDown.bind(this), { passive: true });
            this.container.addEventListener('touchmove', this.onMouseMove.bind(this), { passive: true });
            this.container.addEventListener('touchend', this.onMouseUp.bind(this), { passive: true });
            this.container.addEventListener('mousewheel', this.onMouseWheel.bind(this), { passive: false });
            this.container.addEventListener('DOMMouseScroll', this.onMouseWheel.bind(this), { passive: false });
            this.container.addEventListener('contextmenu', this.onContextMenu.bind(this), { passive: true });
        },
        unregisterMouseEvents: function () {
            this.container.removeEventListener('mousedown', this.onMouseDown.bind(this), false);
            this.container.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
            this.container.removeEventListener('mouseup', this.onMouseUp.bind(this), false);
            this.container.removeEventListener('touchstart', this.onMouseDown.bind(this), false);
            this.container.removeEventListener('touchmove', this.onMouseMove.bind(this), false);
            this.container.removeEventListener('touchend', this.onMouseUp.bind(this), false);
            this.container.removeEventListener('mousewheel', this.onMouseWheel.bind(this), false);
            this.container.removeEventListener('DOMMouseScroll', this.onMouseWheel.bind(this), false);
            this.container.removeEventListener('contextmenu', this.onContextMenu.bind(this), false);
        },
        onMouseDown: function (event) {
            const inputCount = event.touches && event.touches.length || 1;
            switch (inputCount) {
            case 1:
                const x = event.clientX >= 0 ? event.clientX : event.touches[0].clientX;
                const y = event.clientY >= 0 ? event.clientY : event.touches[0].clientY;
                this.dragging = true;
                this.userMouse.set(x, y);
                break;
            case 2:
                const dx = event.touches[0].pageX - event.touches[1].pageX;
                const dy = event.touches[0].pageY - event.touches[1].pageY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.userMouse.pinchDistance = distance;
                break;
            default:
                break;
            }
            this.onUpdateCallback();
        },
        onMouseMove: function (event) {
            const inputCount = event.touches && event.touches.length || 1;
            switch (inputCount) {
            case 1:
                const x = event.clientX >= 0 ? event.clientX : event.touches[0].clientX;
                const y = event.clientY >= 0 ? event.clientY : event.touches[0].clientY;
                const angleX = THREE.Math.degToRad(x - this.userMouse.x) * 0.4;
                const angleY = THREE.Math.degToRad(y - this.userMouse.y) * 0.4;
                if (this.dragging) {
                    this.quatA.setFromAxisAngle(this.vectorY, angleX);
                    this.quatB.setFromAxisAngle(this.vectorX, angleY);
                    this.quatCur.multiply(this.quatA).multiply(this.quatB);
                    this.userMouse.set(x, y);
                }
                break;
            case 2:
                const dx = event.touches[0].pageX - event.touches[1].pageX;
                const dy = event.touches[0].pageY - event.touches[1].pageY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.addZoomDelta(this.userMouse.pinchDistance - distance);
                break;
            default:
                break;
            }
        },
        onMouseUp: function () {
            this.dragging = false;
        },
        onMouseWheel: function (event) {
            event.preventDefault();
            event.stopPropagation();
            let delta = 0;
            if (event.wheelDelta !== undefined) {
                delta = event.wheelDelta;
            } else if (event.detail !== undefined) {
                delta = -event.detail;
            }
            this.addZoomDelta(delta);
            this.onUpdateCallback();
        },
        addZoomDelta: function (delta) {
            const uniforms = this.material.uniforms;
            const lowerBound = this.size * 0.1;
            const upperBound = this.size * 10;
            uniforms.zoom.value += delta;
            if (uniforms.zoom.value <= lowerBound) {
                uniforms.zoom.value = lowerBound;
            } else if (uniforms.zoom.value >= upperBound) {
                uniforms.zoom.value = upperBound;
            }
        },
        onUpdateCallback: function () {
            this.frameId = window.requestAnimationFrame(this.onUpdateCallback.bind(this));
            this.quatSlerp.slerp(this.quatCur, 0.1);
            if (this.material) {
                this.material.uniforms.transform.value.makeRotationFromQuaternion(this.quatSlerp);
            }
            if (!this.dragging && 1 - this.quatSlerp.clone().dot(this.quatCur) < this.EPS) {
                window.cancelAnimationFrame(this.frameId);
            }
        },
        reset: function () {
            this.quatCur.set(0, 0, 0, 1);
            this.quatSlerp.set(0, 0, 0, 1);
            this.onUpdateCallback();
        },
        onLoad: function (texture) {
            this.material.uniforms.resolution.value = this.container.clientWidth / this.container.clientHeight;
            this.registerMouseEvents();
            this.onUpdateCallback();
            this.dispatchEvent({
                type: 'panolens-viewer-handler',
                method: 'disableControl'
            });
            ImagePanorama.prototype.onLoad.call(this, texture);
        },
        onLeave: function () {
            this.unregisterMouseEvents();
            this.dispatchEvent({
                type: 'panolens-viewer-handler',
                method: 'enableControl',
                data: Constants.CONTROLS.ORBIT
            });
            window.cancelAnimationFrame(this.frameId);
            ImagePanorama.prototype.onLeave.call(this);
        },
        onWindowResize: function () {
            this.material.uniforms.resolution.value = this.container.clientWidth / this.container.clientHeight;
        },
        onContextMenu: function () {
            this.dragging = false;
        },
        dispose: function () {
            this.unregisterMouseEvents();
            ImagePanorama.prototype.dispose.call(this);
        }
    });
    return LittlePlanet;
});
define('skylark-panolens/panorama/ImageLittlePlanet',[
    './LittlePlanet',
    'skylark-threejs'
], function (LittlePlanet, THREE) {
    'use strict';
    function ImageLittlePlanet(source, size, ratio) {
        LittlePlanet.call(this, 'image', source, size, ratio);
    }
    ImageLittlePlanet.prototype = Object.assign(Object.create(LittlePlanet.prototype), {
        constructor: ImageLittlePlanet,
        onLoad: function (texture) {
            this.updateTexture(texture);
            LittlePlanet.prototype.onLoad.call(this, texture);
        },
        updateTexture: function (texture) {
            texture.minFilter = texture.magFilter = THREE.LinearFilter;
            this.material.uniforms['tDiffuse'].value = texture;
        },
        dispose: function () {
            const tDiffuse = this.material.uniforms['tDiffuse'];
            if (tDiffuse && tDiffuse.value) {
                tDiffuse.value.dispose();
            }
            LittlePlanet.prototype.dispose.call(this);
        }
    });
    return ImageLittlePlanet;
});
define('skylark-panolens/main',[
	"skylark-langx-objects",
	"./panolens",
	'./Constants',
	'./DataImage',
	'./Viewer',
	'./loaders/ImageLoader',
	'./loaders/TextureLoader',
	'./loaders/CubeTextureLoader',
	'./media/Media',
	'./interface/Reticle',
	'./infospot/Infospot',
	'./widget/Widget',
	'./panorama/Panorama',
	'./panorama/ImagePanorama',
	'./panorama/EmptyPanorama',
	'./panorama/CubePanorama',
	'./panorama/BasicPanorama',
	'./panorama/VideoPanorama',
	'./panorama/GoogleStreetviewPanorama',
	'./panorama/LittlePlanet',
	'./panorama/ImageLittlePlanet',
	'./panorama/CameraPanorama'
],function(
	objects,
	panolens,
	Constants,
	DataImage,
	Viewer,
	ImageLoader,
	TextureLoader,
	CubeTextureLoader,
	Media,
	Reticle,
	Infospot,
	Widget,
	Panorama,
	ImagePanorama,
	EmptyPanorama,
	CubePanorama,
	BasicPanorama,
	VideoPanorama,
	GoogleStreetviewPanorama,
	LittlePlanet,
	ImageLittlePlanet,
	CameraPanorama
){
	objects.mixin(panolens,Constants);
	objects.mixin(panolens,{
		DataImage,
		Viewer,
		ImageLoader,
		TextureLoader,
		CubeTextureLoader,
		Media,
		Reticle,
		Infospot,
		Widget,
		Panorama,
		ImagePanorama,
		EmptyPanorama,
		CubePanorama,
		BasicPanorama,
		VideoPanorama,
		GoogleStreetviewPanorama,
		LittlePlanet,
		ImageLittlePlanet,
		CameraPanorama	
	});
    return panolens;
});
define('skylark-panolens', ['skylark-panolens/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-panolens.js.map
