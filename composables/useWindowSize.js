export default function useWindowSize() {
  const width = ref(process.client ? window.innerWidth : 0);
  const height = ref(process.client ? window.innerHeight : 0);

  if (process.client) {
    const updateSize = () => {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
    };

    onMounted(() => {
      window.addEventListener('resize', updateSize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updateSize);
    });
  }

  return {
    width,
    height
  };
} 