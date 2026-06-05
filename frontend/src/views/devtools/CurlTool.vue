<template>
  <div class="tool-page">
    <h3>CURL 转代码</h3>
    <el-input v-model="curlCmd" type="textarea" :rows="8" placeholder="粘贴 CURL 命令..." />
    <div class="toolbar">
      <el-button type="primary" @click="convert">转换</el-button>
      <el-select v-model="lang" size="small" style="width: 120px">
        <el-option label="JavaScript" value="js" />
        <el-option label="Python" value="python" />
        <el-option label="Java" value="java" />
        <el-option label="Go" value="go" />
      </el-select>
    </div>
    <el-input v-if="output" v-model="output" type="textarea" :rows="12" readonly style="margin-top: 12px" />
    <el-button v-if="output" size="small" style="margin-top: 8px" @click="copy(output)">复制代码</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const curlCmd = ref('')
const lang = ref('js')
const output = ref('')

function parseCurl(cmd) {
  const result = { method: 'GET', url: '', headers: {}, data: '' }
  const parts = cmd.replace(/\\\n/g, ' ').split(/\s+/)
  let i = 0
  while (i < parts.length) {
    const p = parts[i]
    if (p === 'curl') { i++; continue }
    if (p === '-X' || p === '--request') { result.method = parts[++i]; i++; continue }
    if (p === '-H' || p === '--header') { const h = parts[++i]; const idx = h.indexOf(':'); if (idx > 0) result.headers[h.substring(0, idx).trim()] = h.substring(idx + 1).trim(); i++; continue }
    if (p === '-d' || p === '--data' || p === '--data-raw') { result.data = parts[++i]; result.method = result.method === 'GET' ? 'POST' : result.method; i++; continue }
    if (p.startsWith('http')) { result.url = p; i++; continue }
    if (p.startsWith('-')) { i++; continue }
    if (!result.url) { result.url = p; i++; continue }
    i++
  }
  return result
}

function convert() {
  if (!curlCmd.value.trim()) { ElMessage.warning('请输入 CURL 命令'); return }
  const parsed = parseCurl(curlCmd.value)
  const headers = JSON.stringify(parsed.headers, null, parsed.headers && Object.keys(parsed.headers).length ? 2 : 0)

  const templates = {
    js: `fetch('${parsed.url}', {
  method: '${parsed.method}',
  headers: ${headers}${parsed.data ? `,\n  body: '${parsed.data}'` : ''}
})
  .then(res => res.json())
  .then(data => console.log(data))`,

    python: `import requests

headers = ${headers.replace(/"([^"]+)":/g, "'$1':").replace(/"/g, "'")}
${parsed.data ? `data = '${parsed.data}'` : ''}

response = requests.${parsed.method.toLowerCase()}('${parsed.url}', headers=headers${parsed.data ? ', data=data' : ''})
print(response.json())`,

    java: `import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${parsed.url}"))
    ${Object.entries(parsed.headers).map(([k, v]) => `.header("${k}", "${v}")`).join('\n    ')}
    ${parsed.data ? `.${parsed.method}(HttpRequest.BodyPublishers.ofString("${parsed.data}"))` : `.${parsed.method}()`}
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,

    go: buildGoCode(parsed)
  }

  output.value = templates[lang.value] || templates.js
}

function buildGoCode(parsed) {
  const imports = ['"fmt"', '"io"', '"net/http"']
  if (parsed.data) imports.push('"strings"')
  const headerLines = Object.entries(parsed.headers).map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`).join('\n')
  const bodyLine = parsed.data
    ? `\tbody := strings.NewReader("${parsed.data.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`
    : '\tvar body io.Reader'
  return `package main

import (
${imports.join('\n\t')}
)

func main() {
${bodyLine}
\treq, _ := http.NewRequest("${parsed.method}", "${parsed.url}", body)
${headerLines}

\tresp, _ := http.DefaultClient.Do(req)
\tdefer resp.Body.Close()
\tdata, _ := io.ReadAll(resp.Body)
\tfmt.Println(string(data))
}`
}

async function copy(val) {
  await navigator.clipboard.writeText(val)
  ElMessage.success('已复制')
}
</script>

<style scoped>
.tool-page { max-width: 800px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.toolbar { margin-top: 12px; display: flex; gap: 8px; align-items: center; }
</style>