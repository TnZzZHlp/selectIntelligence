# Select Intelligence

**Select Intelligence** 是一款基于 Tampermonkey 的划词问 AI 脚本，支持在任意网页上选中文字并即时调用 OpenAI 等 AI 接口，实现智能问答或文本处理。

## 功能特性

- 页面任意位置划词触发 AI 请求，展示结果于悬浮面板
- 可配置 API Key、Endpoint、Model、System Prompt 等参数
- 拖拽式展开/收起设置面板和触发按钮
- 支持 OpenAI 格式的 SSE 流式输出，实时渲染返回内容

## 前提条件

- 安装 Tampermonkey（Chrome/Firefox/Edge 等浏览器插件）
- 拥有可用的 AI 接口（例如 OpenAI）Key 和 Endpoint

## 安装与使用

1. [点击安装](https://raw.githubusercontent.com/TnZzZHlp/selectIntelligence/refs/heads/main/selectIntelligence.user.js)。
2. 确保 Tampermonkey 扩展已启用该脚本。
3. 打开任意网页，点击页面左上角的小机器人按钮（🤖）打开设置面板。
4. 输入并保存：
   - **API Key**：你的 AI 服务密钥
   - **Endpoint**：AI 请求地址（如 <https://api.openai.com/v1/chat/completions>）
   - **Model**：调用的模型名称（如 `gpt-3.5-turbo`）
   - **System Prompt**：系统角色提示，可留空或自定义基础指令
5. 在页面选中一段文字，会出现一个小蓝点，鼠标移入后会发送请求并在右侧弹出面板显示 AI 返回结果。

## 配置说明

- GM_setValue / GM_getValue 存储用户配置，无需每次刷新重设
- `toggleBtnPosition` 自动吸附页面边缘，重置时按钮不会跑出视窗
- SSE 流以 `data:` 格式拆分、实时解析和渲染，支持大段文本实时更新

## 常见问题

- **无法连接 Endpoint**：请检查浏览器 CSP 设置或接口地址是否正确
- **请求无响应或报错**：查看控制台日志，确认 API Key/Endpoint 是否生效
- **界面样式问题**：可根据个人喜好修改脚本中的 `GM_addStyle` 部分

## 自定义与扩展

- 可改造输出面板样式，如调整宽度、背景色等
- 通过修改 `onloadstart` 中的 `println` 逻辑，可支持其他流式协议
- 欢迎提交 Issue 与 PR 贡献新功能或优化体验

## 许可证

MIT © TnZzZHlp
