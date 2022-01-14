"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

const Counter = (0, _vue.defineComponent)({
  name: 'Counter',

  setup() {
    const counter = (0, _vue.ref)(0);

    const addition = () => {
      counter.value++;
    };

    const subtraction = () => {
      counter.value--;
    };

    return () => (0, _vue.createVNode)("div", {
      "class": "counter"
    }, [(0, _vue.createVNode)("h2", null, [counter.value]), (0, _vue.createVNode)((0, _vue.resolveComponent)("ui-button"), {
      "class": "blue",
      "onClick": addition
    }, {
      default: () => [(0, _vue.createTextVNode)("+")]
    }), (0, _vue.createVNode)((0, _vue.resolveComponent)("ui-button"), {
      "onClick": subtraction
    }, {
      default: () => [(0, _vue.createTextVNode)("-")]
    })]);
  }

});
var _default = Counter;
exports.default = _default;