"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _Counter = _interopRequireDefault(require("./components/Counter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const App = (0, _vue.defineComponent)({
  name: 'App',
  components: {
    Counter: _Counter.default
  },

  setup() {
    return () => (0, _vue.createVNode)("div", {
      "class": "panel"
    }, [(0, _vue.createVNode)(_Counter.default, null, null)]);
  }

});
var _default = App;
exports.default = _default;