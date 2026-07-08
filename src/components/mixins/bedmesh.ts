import { defineComponent } from 'vue'

export default defineComponent({
    computed: {
        bed_mesh() {
            return this.$store.state.printer.bed_mesh ?? {}
        },

        profiles() {
            return this.bed_mesh.profiles ?? {}
        },

        mesh_min(): number[] {
            return this.bed_mesh.mesh_min ?? [0, 0]
        },

        mesh_max(): number[] {
            return this.bed_mesh.mesh_max ?? [0, 0]
        },

        min(): number {
            return Math.min(...this.points)
        },

        max(): number {
            return Math.max(...this.points)
        },

        variance(): string {
            return Math.abs(this.min - this.max).toFixed(3)
        },

        is_active(): boolean {
            // if the current profile_mane is not empty, return true
            if (this.bed_mesh.profile_name) return true

            return this.mesh_min[0] !== 0 || this.mesh_min[1] !== 0 || this.mesh_max[0] !== 0 || this.mesh_max[1] !== 0
        },

        name(): string {
            if (this.bed_mesh.profile_name) return this.bed_mesh.profile_name

            return 'Unknown'
        },

        probed_matrix(): number[][] {
            return this.bed_mesh.probed_matrix ?? []
        },

        points(): number[] {
            const points: number[] = []

            for (let i = 0; i < this.probed_matrix.length; i++) {
                for (let j = 0; j < this.probed_matrix[i].length; j++) {
                    points.push(this.probed_matrix[i][j])
                }
            }

            return points
        },
    },
})
