<template>
    <div ref="view" class="codeview" @mouseup="mouseUp" @keydown="keyPress"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'

export default defineComponent({
    name: 'CodeStream',
    props: {
        currentline: { type: Number, required: true },
        document: { type: String, default: '' },
        isSimulating: { type: Boolean, default: false },
        shown: { type: Boolean, default: false },
    },
    emits: ['update:currentline', 'got-focus'],
    data() {
        return {
            view: undefined as EditorView | undefined,
        }
    },
    computed: {
        currentLineNumber: {
            get(): number {
                return this.currentline
            },
            set(value: number) {
                this.$emit('update:currentline', value)
            },
        },
    },
    watch: {
        document() {
            if (this.view && this.shown) {
                this.view.dispatch({
                    changes: {
                        from: 0,
                        to: this.view.state.doc.length,
                        insert: this.document,
                    },
                })
            }
        },

        currentLineNumber(to: number) {
            if (this.view && this.shown) {
                const line = this.view.state.doc.lineAt(to)
                this.view.dispatch({
                    selection: {
                        anchor: line.from,
                        head: line.from,
                    },
                    scrollIntoView: true,
                })
            }
        },
    },
    mounted() {
        this.view = new EditorView({
            doc: this.document,
            extensions: [basicSetup, EditorState.readOnly.of(true)],
            parent: this.$refs['view'] as HTMLElement,
        })
    },
    methods: {
        mouseUp() {
            if (this.view) {
                const line = this.view.state.doc.lineAt(this.view.state.selection.ranges[0].from)
                this.$emit('update:currentline', line.to)
                this.view.contentDOM.blur()
                this.$emit('got-focus')
            }
        },

        keyPress() {
            if (this.view) {
                const line = this.view.state.doc.lineAt(this.view.state.selection.ranges[0].from)
                this.$emit('update:currentline', line.to)
                this.$emit('got-focus')
            }
        },
    },
})
</script>

<style scoped>
:deep(.cm-activeLine) {
    background-color: #333 !important;
}

.codeview {
    height: 100%;
    overflow: auto;
}
</style>
