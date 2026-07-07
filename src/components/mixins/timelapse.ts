import { defineComponent } from 'vue'

export default defineComponent({
    computed: {
        variable_fps: {
            get(): boolean {
                return this.$store.state.server.timelapse?.settings?.variable_fps ?? false
            },
            set(newVal: boolean) {
                this.$store.dispatch('server/timelapse/saveSetting', { variable_fps: newVal })
            },
        },

        variable_fps_min: {
            get(): number {
                return this.$store.state.server.timelapse?.settings?.variable_fps_min ?? 5
            },
            set(newVal: number) {
                this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_min: newVal })
            },
        },

        variable_fps_max: {
            get(): number {
                return this.$store.state.server.timelapse?.settings?.variable_fps_max ?? 60
            },
            set(newVal: number) {
                this.$store.dispatch('server/timelapse/saveSetting', { variable_fps_max: newVal })
            },
        },

        targetlength: {
            get(): number {
                return this.$store.state.server.timelapse?.settings?.targetlength ?? 10
            },
            set(newVal: number) {
                this.$store.dispatch('server/timelapse/saveSetting', { targetlength: newVal })
            },
        },

        output_framerate: {
            get(): number {
                return this.$store.state.server.timelapse?.settings?.output_framerate ?? 30
            },
            set(newVal: number) {
                this.$store.dispatch('server/timelapse/saveSetting', { output_framerate: newVal })
            },
        },

        duplicatelastframe: {
            get(): number {
                return this.$store.state.server.timelapse?.settings?.duplicatelastframe ?? 0
            },
            set(newVal: number) {
                this.$store.dispatch('server/timelapse/saveSetting', { duplicatelastframe: newVal })
            },
        },

        framesCount(): number {
            return this.$store.state.server.timelapse?.lastFrame?.count ?? 0
        },

        estimatedVideoLength(): string {
            let seconds = Math.round((this.framesCount + this.duplicatelastframe) / this.output_framerate)

            if (this.variable_fps) {
                seconds = Math.round((this.framesCount + this.duplicatelastframe) / this.variableTargetFps)
                if (seconds < this.targetlength) seconds = this.targetlength
            }

            return seconds > 60
                ? Math.floor(seconds / 60) + 'm ' + (seconds - Math.floor(seconds / 60) * 60) + 's'
                : seconds + 's'
        },

        variableTargetFps(): number {
            let targetFps = Math.floor(this.framesCount / this.targetlength)
            targetFps = Math.max(targetFps, this.variable_fps_min)
            targetFps = Math.min(targetFps, this.variable_fps_max)

            return targetFps
        },
    },
})
