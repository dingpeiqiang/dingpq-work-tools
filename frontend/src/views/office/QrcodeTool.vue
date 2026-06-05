<template>
  <div class="tool-page">
    <h3>二维码工具</h3>
    <el-row :gutter="24">
      <el-col :span="12">
        <h4>生成二维码</h4>
        <el-input v-model="qrText" type="textarea" :rows="3" placeholder="输入文本或链接..." />
        <div class="qr-box" v-if="qrText">
          <img :src="qrSrc" alt="QR Code" class="qr-img" />
        </div>
        <el-button type="primary" style="margin-top: 8px" :disabled="!qrText" @click="downloadQr">下载二维码</el-button>
      </el-col>
      <el-col :span="12">
        <h4>二维码解析</h4>
        <el-alert
          title="提示"
          type="info"
          description="浏览器解析二维码需要额外库支持，当前版本使用 API 生成。"
          :closable="false"
          show-icon
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const qrText = ref('')

const qrSrc = computed(() => {
  if (!qrText.value) return ''
  const encoded = encodeURIComponent(qrText.value)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`
})

function downloadQr() {
  if (!qrSrc.value) return
  const a = document.createElement('a')
  a.href = qrSrc.value
  a.download = 'qrcode.png'
  a.click()
  ElMessage.success('下载中...')
}
</script>

<style scoped>
.tool-page { max-width: 800px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.tool-page h4 { color: #c0c0d0; margin-bottom: 10px; }
.qr-box { margin-top: 12px; text-align: center; background: #fff; padding: 16px; border-radius: 8px; display: inline-block; }
.qr-img { width: 200px; height: 200px; }
</style>