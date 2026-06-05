# AGENTS.md — 开发规范

## 技术栈
Vue3 + Vite + Element Plus + Vue Router，Electron 桌面端，Node.js 后端。

## 代码规范
- 组件单一职责，每个 `.vue` 不超过 300 行
- 提取公共逻辑到 `composables/`，复用工具函数到 `utils/`
- 命名：组件 PascalCase，文件夹 kebab-case，函数 camelCase
- 禁止 `any` 类型，禁止 `console.log` 提交

## 质量要求
- 所有工具 100% 离线可用，无网络依赖
- 输入实时生效，结果一键复制，零冗余点击
- 数据纯本地 localStorage 存储，不发起外部请求
- 提交前自测：格式化/加密/转换各测 3 组边界值

## 工程化
- 路由懒加载，`base: './'` 适配 Electron
- 深色模式优先，CSS 变量统一主题
- 小步提交，一个工具一个 commit