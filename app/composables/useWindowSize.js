export default function useWindowSize() {
	const width = ref(import.meta.client ? window.innerWidth : 0)
	const height = ref(import.meta.client ? window.innerHeight : 0)

	if (import.meta.client) {
		const updateSize = () => {
			width.value = window.innerWidth
			height.value = window.innerHeight
		}

		onMounted(() => {
			window.addEventListener('resize', updateSize)
		})

		onUnmounted(() => {
			window.removeEventListener('resize', updateSize)
		})
	}

	return {
		width,
		height
	}
}
