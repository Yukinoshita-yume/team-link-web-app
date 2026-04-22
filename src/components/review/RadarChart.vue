<template>
  <div class="radar-wrap">
    <canvas ref="canvasRef" :width="SIZE" :height="SIZE"></canvas>
    <div class="radar-legend">
      <div
        v-for="(dim, i) in dimensions"
        :key="i"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ background: fillColor }"></span>
        <span class="legend-name">{{ dim.name }}</span>
        <span class="legend-val">{{ dim.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  dimensions: {
    type: Array,
    // [{ name: '技术能力', value: 85 }, ...]
    default: () => [],
  },
})

const SIZE = 240
const canvasRef = ref(null)
const fillColor = '#5c6bc0'

function drawRadar() {
  const canvas = canvasRef.value
  if (!canvas || !props.dimensions.length) return
  const ctx = canvas.getContext('2d')
  const cx = SIZE / 2
  const cy = SIZE / 2
  const R = SIZE / 2 - 28
  const n = props.dimensions.length
  const step = (Math.PI * 2) / n

  ctx.clearRect(0, 0, SIZE, SIZE)

  // 背景网格
  const levels = 5
  for (let l = 1; l <= levels; l++) {
    const r = (R / levels) * l
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const angle = step * i - Math.PI / 2
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = '#e8eaf6'
    ctx.lineWidth = 1
    ctx.stroke()
    if (l === levels) {
      ctx.fillStyle = 'rgba(232,234,246,0.15)'
      ctx.fill()
    }
  }

  // 轴线
  for (let i = 0; i < n; i++) {
    const angle = step * i - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R)
    ctx.strokeStyle = '#e8eaf6'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 数据区域
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const angle = step * i - Math.PI / 2
    const ratio = (props.dimensions[i].value || 0) / 100
    const x = cx + Math.cos(angle) * R * ratio
    const y = cy + Math.sin(angle) * R * ratio
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(92,107,192,0.18)'
  ctx.fill()
  ctx.strokeStyle = '#5c6bc0'
  ctx.lineWidth = 2
  ctx.stroke()

  // 数据点
  for (let i = 0; i < n; i++) {
    const angle = step * i - Math.PI / 2
    const ratio = (props.dimensions[i].value || 0) / 100
    const x = cx + Math.cos(angle) * R * ratio
    const y = cy + Math.sin(angle) * R * ratio
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#5c6bc0'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // 轴标签
  ctx.fillStyle = '#666'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < n; i++) {
    const angle = step * i - Math.PI / 2
   const labelR = R + 28
    const x = cx + Math.cos(angle) * labelR
    const y = cy + Math.sin(angle) * labelR
    ctx.fillText(props.dimensions[i].name, x, y)
  }
}

onMounted(() => drawRadar())
watch(() => props.dimensions, () => drawRadar(), { deep: true })
</script>

<style scoped>
.radar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

canvas {
  display: block;
}

.radar-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 20px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  color: #777;
}

.legend-val {
  font-weight: 700;
  color: #1a1d2e;
}
</style>
