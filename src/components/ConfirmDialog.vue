<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="overlay" @click.self="onCancel">
        <Transition name="scale">
          <div class="dialog" v-if="visible">
            <div class="dialog-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 class="dialog-title">{{ dialogConfig.title }}</h3>
            <p class="dialog-message">{{ dialogConfig.message }}</p>
            <div class="dialog-actions">
              <button class="btn-cancel" @click="onCancel">{{ dialogConfig.cancelText }}</button>
              <button class="btn-confirm" @click="onConfirm">{{ dialogConfig.confirmText }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  title: { type: String, default: '提示' },
  message: String,
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
})
const dialogConfig = ref({ title: props.title, message: props.message, confirmText: props.confirmText, cancelText: props.cancelText })
const visible = ref(false)
let resolvePromise = null
const show = (options = {}) => {
  dialogConfig.value = { ...dialogConfig.value, ...options }
  visible.value = true
  return new Promise(resolve => { resolvePromise = resolve })
}
const onConfirm = () => { visible.value = false; resolvePromise?.(true) }
const onCancel = () => { visible.value = false; resolvePromise?.(false) }
defineExpose({ show })
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(20,10,40,0.45);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.dialog {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 22px;
  padding: 32px 28px 24px;
  width: 100%; max-width: 360px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(100,60,200,0.18), 0 4px 16px rgba(0,0,0,0.08);
}
.dialog-icon {
  width: 52px; height: 52px;
  background: rgba(139,92,246,0.1);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  color: #8b5cf6;
}
.dialog-title { font-size: 18px; font-weight: 800; color: #1a1028; margin-bottom: 8px; }
.dialog-message { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 24px; }
.dialog-actions { display: flex; gap: 10px; }
.btn-cancel, .btn-confirm {
  flex: 1; padding: 12px;
  border: none; border-radius: 12px;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-cancel { background: rgba(0,0,0,0.05); color: #666; }
.btn-cancel:hover { background: rgba(0,0,0,0.08); }
.btn-confirm {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
  box-shadow: 0 4px 14px rgba(109,40,217,0.25);
}
.btn-confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(109,40,217,0.32); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.scale-enter-from, .scale-leave-to { transform: scale(0.88); opacity: 0; }
</style>