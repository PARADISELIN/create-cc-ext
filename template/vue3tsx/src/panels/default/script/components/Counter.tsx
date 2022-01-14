import { defineComponent, ref } from 'vue'

const Counter = defineComponent({
  name: 'Counter',
  setup() {
    const counter = ref(0)

    const addition = () => {
      counter.value++
    }

    const subtraction = () => {
      counter.value--
    }

    return () => (
      <div class="counter">
        <h2>{counter.value}</h2>
        <ui-button class="blue"onClick={addition}>+</ui-button>
        <ui-button onClick={subtraction}>-</ui-button>
      </div>
    )
  }
})

export default Counter