import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    redirect: '/home',
    children: [
      { path: 'home', name: 'Home', component: () => import('../views/Home.vue'), meta: { title: '首页工作台', icon: 'HomeFilled' } },
      { path: 'json', name: 'JsonTool', component: () => import('../views/devtools/JsonTool.vue'), meta: { title: 'JSON 工具', icon: 'Document', group: 'devtools' } },
      { path: 'xml', name: 'XmlTool', component: () => import('../views/devtools/XmlTool.vue'), meta: { title: 'XML 工具', icon: 'Document', group: 'devtools' } },
      { path: 'yaml', name: 'YamlTool', component: () => import('../views/devtools/YamlTool.vue'), meta: { title: 'YAML 工具', icon: 'Document', group: 'devtools' } },
      { path: 'timestamp', name: 'TimestampTool', component: () => import('../views/devtools/TimestampTool.vue'), meta: { title: '时间戳转换', icon: 'Clock', group: 'devtools' } },
      { path: 'uuid', name: 'UuidTool', component: () => import('../views/devtools/UuidTool.vue'), meta: { title: '唯一ID生成', icon: 'Key', group: 'devtools' } },
      { path: 'regex', name: 'RegexTool', component: () => import('../views/devtools/RegexTool.vue'), meta: { title: '正则测试', icon: 'Search', group: 'devtools' } },
      { path: 'base-convert', name: 'BaseConvert', component: () => import('../views/devtools/BaseConvert.vue'), meta: { title: '进制转换', icon: 'Switch', group: 'devtools' } },
      { path: 'http-request', name: 'HttpRequest', component: () => import('../views/devtools/HttpRequest.vue'), meta: { title: 'HTTP 请求', icon: 'Connection', group: 'devtools' } },
      { path: 'curl', name: 'CurlTool', component: () => import('../views/devtools/CurlTool.vue'), meta: { title: 'CURL 转代码', icon: 'Promotion', group: 'devtools' } },
      { path: 'text-process', name: 'TextProcess', component: () => import('../views/text/TextProcess.vue'), meta: { title: '文本处理', icon: 'Edit', group: 'text' } },
      { path: 'encode', name: 'EncodeConvert', component: () => import('../views/text/EncodeConvert.vue'), meta: { title: '编码转换', icon: 'Transform', group: 'text' } },
      { path: 'hash', name: 'HashTool', component: () => import('../views/crypto/HashTool.vue'), meta: { title: '哈希加密', icon: 'Lock', group: 'crypto' } },
      { path: 'aes', name: 'AesTool', component: () => import('../views/crypto/AesTool.vue'), meta: { title: 'AES/DES 加密', icon: 'Lock', group: 'crypto' } },
      { path: 'rsa', name: 'RsaTool', component: () => import('../views/crypto/RsaTool.vue'), meta: { title: 'RSA 加密', icon: 'Lock', group: 'crypto' } },
      { path: 'password', name: 'PasswordTool', component: () => import('../views/crypto/PasswordTool.vue'), meta: { title: '密码工具', icon: 'Lock', group: 'crypto' } },
      { path: 'unit', name: 'UnitConvert', component: () => import('../views/office/UnitConvert.vue'), meta: { title: '单位换算', icon: 'TrendCharts', group: 'office' } },
      { path: 'qrcode', name: 'QrcodeTool', component: () => import('../views/office/QrcodeTool.vue'), meta: { title: '二维码工具', icon: 'Picture', group: 'office' } },
      { path: 'color', name: 'ColorTool', component: () => import('../views/office/ColorTool.vue'), meta: { title: '颜色工具', icon: 'Brush', group: 'office' } },
      { path: 'snippet', name: 'CodeSnippet', component: () => import('../views/knowledge/CodeSnippet.vue'), meta: { title: '代码片段', icon: 'Collection', group: 'knowledge' } },
      { path: 'notes', name: 'Notes', component: () => import('../views/knowledge/Notes.vue'), meta: { title: '技术笔记', icon: 'Notebook', group: 'knowledge' } },
      { path: 'settings', name: 'Settings', component: () => import('../views/settings/Settings.vue'), meta: { title: '个人中心', icon: 'Setting', hideInMenu: true } }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router