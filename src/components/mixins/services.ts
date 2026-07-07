import { defineComponent } from 'vue'

export default defineComponent({
    computed: {
        hideOtherInstances(): boolean {
            return this.$store.state.gui.uiSettings.hideOtherInstances ?? false
        },

        instance_ids(): { klipper?: string; moonraker?: string } {
            return this.$store.state.server.system_info?.instance_ids ?? {}
        },

        klipperInstance(): string {
            return this.instance_ids.klipper ?? ''
        },

        moonrakerInstance(): string {
            return this.instance_ids.moonraker ?? ''
        },
    },
})
