<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col :class="pwm ? 'pb-1' : 'pb-3'">
                <v-list-subheader class="_fan-slider-subheader">
                    <v-icon
                        v-if="type === 'led' && target > 0"
                        class="mr-2"
                        size="small"
                        :retain-focus-on-click="true"
                        @click="ledOff">
                        {{ mdiLightbulbOnOutline }}
                    </v-icon>
                    <v-icon
                        v-else-if="type === 'led'"
                        class="mr-2"
                        size="small"
                        :retain-focus-on-click="true"
                        @click="ledOn">
                        {{ mdiLightbulbOutline }}
                    </v-icon>
                    <v-icon v-else-if="type.includes('fan')" size="small" :class="fanClasses">{{ mdiFan }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer />
                    <small v-if="rpm !== null" :class="rpmClasses">{{ Math.round(rpm ?? 0) }} RPM</small>
                    <span v-if="!controllable" class="font-weight-bold">
                        {{ Math.round(parseFloat(value) * 100) }} %
                    </span>
                    <v-icon v-if="controllable && !pwm" @click="switchOutputPin">
                        {{ value ? mdiToggleSwitch : mdiToggleSwitchOffOutline }}
                    </v-icon>
                    <form @submit.prevent="submitInput">
                        <v-text-field
                            v-if="controllable && pwm"
                            v-model="inputValue"
                            :error="errors.length > 0"
                            suffix="%"
                            type="number"
                            hide-spin-buttons
                            hide-details
                            variant="outlined"
                            density="compact"
                            class="_slider-input pt-1"
                            @blur="inputValue = Math.round(parseFloat(sliderValue) * 100)"
                            @focus="$event.target.select()"
                            @keydown="checkInvalidChars" />
                    </form>
                </v-list-subheader>
                <transition v-if="controllable && pwm" name="fade">
                    <!-- display errors -->
                    <div v-show="errors.length > 0" class="_error-msg d-flex justify-end">
                        {{ errors[0] ?? '' }}
                    </div>
                </transition>
                <v-card-text v-if="controllable && pwm" class="py-0 pb-2 d-flex align-center">
                    <v-btn
                        v-if="lockSliders && isTouchDevice && pwm"
                        variant="plain"
                        size="small"
                        icon
                        class="_lock-button"
                        @click="isLocked = !isLocked">
                        <v-icon size="small" :color="isLocked ? 'red' : ''">
                            {{ isLocked ? mdiLockOutline : mdiLockOpenVariantOutline }}
                        </v-icon>
                    </v-btn>
                    <v-slider
                        v-model="sliderValue"
                        v-touch="{ start: resetLockTimer }"
                        :disabled="isLocked"
                        :min="0.0"
                        :max="1.0"
                        :step="0.01"
                        :color="sliderValue < off_below && sliderValue > 0 ? 'red' : undefined"
                        hide-details
                        @end="changeSliderValue">
                        <template #prepend>
                            <v-icon :disabled="isLocked || sliderValue <= min" @click="decrement">
                                {{ mdiMinus }}
                            </v-icon>
                        </template>

                        <template #append>
                            <v-icon :disabled="isLocked || sliderValue >= 1" @click="increment">{{ mdiPlus }}</v-icon>
                        </template>
                    </v-slider>
                </v-card-text>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { convertName, debounce } from '@/plugins/helpers'
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import BaseMixin from '@/components/mixins/base'
import {
    mdiFan,
    mdiLockOpenVariantOutline,
    mdiLockOutline,
    mdiMinus,
    mdiPlus,
    mdiToggleSwitch,
    mdiToggleSwitchOffOutline,
    mdiLightbulbOutline,
    mdiLightbulbOnOutline,
} from '@mdi/js'

export default defineComponent({
    name: 'MiscellaneousSlider',
    mixins: [BaseMixin],
    props: {
        target: { type: Number, required: true },
        max: { type: Number, default: 1 },
        name: { type: String, default: '' },
        type: { type: String, default: '' },
        controllable: { type: Boolean, default: false },
        pwm: { type: Boolean, default: false },
        rpm: { type: [Number, Boolean] as PropType<number | boolean>, default: false },
        multi: { type: Number, default: 1 },
        off_below: { type: Number, default: 0 },
        colorOrder: { type: String, default: '' },
    },
    data() {
        return {
            mdiFan: mdiFan,
            mdiToggleSwitch: mdiToggleSwitch,
            mdiToggleSwitchOffOutline: mdiToggleSwitchOffOutline,
            mdiLockOutline: mdiLockOutline,
            mdiLockOpenVariantOutline: mdiLockOpenVariantOutline,
            mdiMinus: mdiMinus,
            mdiPlus: mdiPlus,
            mdiLightbulbOutline: mdiLightbulbOutline,
            mdiLightbulbOnOutline: mdiLightbulbOnOutline,

            convertName: convertName,
            timeout: undefined as ReturnType<typeof setTimeout> | undefined,
            isLocked: false,
            invalidChars: ['e', 'E', '+'] as string[],

            min: 0,
            inputValue: 0,
            sliderValue: 0,
        }
    },
    computed: {
        value(): number {
            return Math.round((this.target / this.max) * 100) / 100
        },

        lockSliders(): boolean {
            return this.$store.state.gui.uiSettings.lockSlidersOnTouchDevices
        },

        lockSlidersDelay(): number {
            return this.$store.state.gui.uiSettings.lockSlidersDelay
        },

        errors() {
            const errors = []
            const input = this.inputValue / 100
            if (this.inputValue.toString() === '') {
                // "Input must not be empty!"
                errors.push(this.$t('App.NumberInput.NoEmptyAllowedError'))
            }
            if (input < this.min) {
                // "Must be grater or equal than {min}!"
                errors.push(this.$t('App.NumberInput.GreaterOrEqualError', { min: this.min * 100 }))
            }
            return errors
        },

        disableFanAnimation() {
            return this.$store.state.gui.uiSettings.disableFanAnimation ?? false
        },

        fanClasses() {
            const output = ['mr-2']
            if (!this.disableFanAnimation && this.value >= this.off_below && this.value > 0)
                output.push('icon-rotate')

            return output
        },

        rpmClasses() {
            const output = []
            if (!this.controllable) output.push(['mr-3', 'mt-1'])
            else output.push(['mt-2'])
            if (this.rpm === 0 && this.value > 0) output.push('text-red')

            return output
        },

        ledChannelName() {
            if (this.colorOrder === 'R') return 'RED'
            if (this.colorOrder === 'G') return 'GREEN'
            if (this.colorOrder === 'B') return 'BLUE'

            return 'WHITE'
        },
    },
    watch: {
        lockSliders: {
            handler(): void {
                this.isLocked = this.lockSliders && this.isTouchDevice
            },
            immediate: true,
        },

        value(newVal: number): void {
            this.sliderValue = newVal
        },

        sliderValue: {
            handler(newVal: number): void {
                this.inputValue = Math.round(newVal * 100)
            },
            immediate: true,
        },
    },
    methods: {
        startLockTimer(): void {
            const t = this.lockSlidersDelay
            if (!this.isTouchDevice || !this.lockSliders || t <= 0) return
            this.timeout = setTimeout(() => (this.isLocked = true), t * 1000)
        },

        resetLockTimer(): void {
            clearTimeout(this.timeout)
        },

        changeSliderValue: debounce(function (this: any): void {
            if (this.value === this.sliderValue) return
            /**
             * snap slider handle to 0 if dragging from above 'off_below' to below 'off_below'
             * snap slider handle to 'off_below' if dragging from 0 to below 'off_below'
             */
            if (this.sliderValue < this.value && this.sliderValue < this.off_below) {
                this.sliderValue = 0
            } else if (this.sliderValue > this.value && this.sliderValue < this.off_below) {
                this.sliderValue = this.off_below
            }

            this.sendCmd(this.sliderValue)
        }, 500),

        sendCmd(newVal: number): void {
            if (this.value === newVal) return

            if (newVal < this.min) newVal = 0
            newVal = newVal * this.multi

            let gcode = `SET_PIN PIN=${this.name} VALUE=${newVal.toFixed(2)}`
            if (this.type === 'fan') gcode = `M106 S${newVal.toFixed(0)}`
            if (this.type === 'fan_generic') gcode = `SET_FAN_SPEED FAN=${this.name} SPEED=${newVal}`
            if (this.type === 'led')
                gcode = `SET_LED LED=${this.name} ${this.ledChannelName}=${newVal.toFixed(2)} SYNC=0 TRANSMIT=1`

            if (gcode !== '') {
                this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
                this.$socket.emit('printer.gcode.script', { script: gcode })
            }

            this.startLockTimer()
        },

        ledOff() {
            this.sendCmd(0)
        },

        ledOn() {
            this.sendCmd(1)
        },

        switchOutputPin(): void {
            const newVal = this.value ? 0 : 1
            const gcode = `SET_PIN PIN=${this.name} VALUE=${(newVal * this.multi).toFixed(2)}`
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        },

        decrement(): void {
            let newVal = this.value > 0 ? Math.round((this.value - 0.01) * 100) / 100 : 0
            if (this.value < this.off_below) newVal = 0
            this.sendCmd(newVal)
        },

        increment(): void {
            let newVal = this.value < 1.0 ? Math.round((this.value + 0.01) * 100) / 100 : 1.0
            if (this.value < this.off_below) newVal = this.off_below
            this.sendCmd(newVal)
        },

        // input validation //
        checkInvalidChars(event: KeyboardEvent): void {
            // add '-' to invalid characters if no negative input is allowed
            if (this.min >= 0) this.invalidChars.push('-')
            if (this.invalidChars.includes(event.key)) event.preventDefault()
        },

        submitInput(): void {
            if (this.errors.length > 0) return

            let newVal = this.inputValue / 100
            if (this.value === 0 && newVal < this.off_below) {
                newVal = this.off_below
            } else if (this.value >= this.off_below && newVal < this.off_below) {
                newVal = 0
            }

            this.sendCmd(newVal)
        },
    },
    mounted() {
        this.sliderValue = this.value
    },
})
</script>

<style scoped>
._fan-slider-subheader {
    height: auto;
}

._lock-button {
    margin-left: -6px;
}

._error-msg {
    color: #ff5252;
    font-size: 12px;
    padding: 4px 16px 2px 0;
}

.fade-enter-active {
    animation: slide-in 0.15s reverse;
    opacity: 1;
}

.fade-leave-active {
    animation: slide-in 0.15s;
    opacity: 1;
}

@keyframes slide-in {
    100% {
        transform: translateY(-5px);
    }
}

._slider-input {
    min-width: 4.2rem;
    max-width: 5rem;
    margin-left: 12px;
}

._slider-input :deep(.v-input__slot) {
    min-height: 1rem !important;
}

._slider-input :deep(.v-text-field__slot input) {
    padding: 4px 0 4px;
}
</style>
