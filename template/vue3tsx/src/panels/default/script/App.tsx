import { defineComponent } from 'vue'

import Counter from './components/Counter'

const App = defineComponent({
  name: 'App',
  components: {
    Counter
  },
  setup() {
    return () => (
      <div class="panel">
        <Counter />
      </div>
    )
  }
})

export default App
