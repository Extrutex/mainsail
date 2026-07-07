# Vue & TypeScript

## Vue 3 Options API

Use Vue 3 **Options API** with `defineComponent`.
Never use `<script setup>` and never use the old class-component decorators
(`vue-class-component` / `vue-property-decorator` were removed with the Vue 3 migration).

See canonical example: [examples/VueComponentExample.vue](examples/VueComponentExample.vue)

### Option Order

1. `name`
2. `components`
3. `mixins`
4. `props`
5. `emits`
6. `data()`
7. `computed`
8. `watch`
9. Lifecycle hooks (`created`, `mounted`, `beforeUnmount`, …)
10. `methods`

### Documentation

- [Vue 3 Options API](https://vuejs.org/guide/typescript/options-api.html)
- [Vuetify 3](https://vuetifyjs.com/en/components/all/)

## TypeScript

Use explicit types for props, computed return values, and complex objects.
Computed properties MUST have explicit return types (required for cross-references).
Use `@/` alias for imports (e.g., `import { foo } from '@/store/types'`).

Define `type`, `required`, and `default` for all props. Use `PropType<T>` for complex prop types.

Declare all emitted events in the `emits` option.

## Template Best Practices

Extract complex logic into computed properties.
Keep templates declarative - no inline filtering or complex expressions.

## Cleanup in beforeUnmount

Always clean up resources:

- Event listeners
- Timers and intervals
- Observers (ResizeObserver, MutationObserver)
- ECharts instances
- WebSocket/WebRTC connections
