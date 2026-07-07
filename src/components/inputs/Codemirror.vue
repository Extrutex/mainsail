<template>
    <div class="vue-codemirror">
        <div ref="editor" v-observe-visibility="visibilityChanged"></div>
    </div>
</template>

<script lang="ts">
// Inspired by this repo: https://github.com/surmon-china/vue-codemirror

import { defineComponent, markRaw } from 'vue'
import BaseMixin from '../mixins/base'
import ThemeMixin from '../mixins/theme'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { StreamLanguage } from '@codemirror/language'
import { klipper_config } from '@/plugins/StreamParserKlipperConfig'
import { gcode } from '@/plugins/StreamParserGcode'
import { insertTab, indentLess } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { indentUnit } from '@codemirror/language'

export default defineComponent({
    name: 'Codemirror',
    mixins: [BaseMixin, ThemeMixin],
    props: {
        code: { type: String, required: false, default: '' },
        modelValue: { type: String, required: false, default: '' },
        name: { type: String, required: false, default: 'codemirror' },
        fileExtension: { type: String, required: false, default: '' },
    },
    emits: ['ready', 'lineChange', 'update:modelValue'],
    data() {
        return {
            content: '',
            codemirror: null as null | EditorView,
            cminstance: null as null | EditorView,
        }
    },
    computed: {
        cmExtensions() {
            const extensions = [
                EditorView.theme({}, { dark: this.themeMode === 'dark' }),
                basicSetup,
                this.vscodeTheme,
                indentUnit.of(' '.repeat(this.tabSize)),
                keymap.of([
                    { key: 'Tab', run: insertTab },
                    { key: 'Shift-Tab', run: indentLess },
                ]),
                EditorView.updateListener.of((update) => {
                    if (update.selectionSet) {
                        const line = this.cminstance?.state?.doc.lineAt(
                            this.cminstance?.state?.selection.main.head
                        ).number
                        this.$emit('lineChange', line)
                    }
                    this.content = update.state?.doc.toString()
                    if (this.$emit) {
                        this.$emit('update:modelValue', this.content)
                    }
                }),
            ]

            if (['cfg', 'conf'].includes(this.fileExtension)) extensions.push(StreamLanguage.define(klipper_config))
            else if (['gcode'].includes(this.fileExtension)) extensions.push(StreamLanguage.define(gcode))
            else if (['json'].includes(this.fileExtension)) extensions.push(json())
            else if (['css', 'scss', 'sass'].includes(this.fileExtension)) extensions.push(css())

            return extensions
        },

        tabSize() {
            return this.$store.state.gui.editor.tabSize || 2
        },

        vscodeTheme() {
            return this.themeMode === 'dark' ? vscodeDark : vscodeLight
        },
    },
    watch: {
        modelValue(newVal: string) {
            const cm_value = this.cminstance?.state?.doc.toString()
            if (newVal !== cm_value) {
                this.setCmValue(newVal)
            }
        },
    },
    mounted(): void {
        this.initialize()
    },
    beforeUnmount() {
        this.destroy()
    },
    methods: {
        destroy() {
            this.cminstance?.destroy()
        },

        initialize() {
            this.codemirror = markRaw(
                new EditorView({
                    parent: this.$refs.editor as HTMLElement,
                })
            )
            this.cminstance = this.codemirror

            this.$nextTick(() => {
                this.setCmValue(this.code || this.modelValue || this.content)

                this.$emit('ready', this.codemirror)
            })
        },

        setCmValue(content: string) {
            this.cminstance?.setState(EditorState.create({ doc: content, extensions: this.cmExtensions }))
        },

        visibilityChanged(isVisible: boolean) {
            if (isVisible) this.cminstance?.focus()
        },

        gotoLine(line: number) {
            const l = this.cminstance?.state?.doc.line(line)
            if (!l) return

            this.cminstance?.dispatch({
                selection: { head: l.from, anchor: l.to },
                scrollIntoView: true,
            })
        },
    },
})
</script>
