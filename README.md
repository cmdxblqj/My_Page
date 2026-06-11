# Orbital Experience

基于轨道公转交互的个人主页，四个按钮沿椭圆轨道运行，滚轮/键盘旋转切换子页面。

> 1920×1080 固定比例 · 全屏等比缩放 · GitHub Pages 自动部署

---

## 项目结构

```
My_Page/
├── index.html                # 主页面，内嵌四个子页面
├── css/
│   ├── base.css              # 全局变量、重置、背景
│   ├── orbital.css           # 轨道、按钮、控件栏、过渡层
│   ├── subpage1.css          # Subpage 1 · 红色
│   ├── subpage2.css          # Subpage 2 · 蓝色
│   ├── subpage3.css          # Subpage 3 · 绿色
│   ├── subpage4.css          # Subpage 4 · 黄色
│   └── responsive.css        # 响应式
├── js/
│   ├── app.js                # 核心逻辑：轨道、吸附、过渡、播放器、搜索
│   └── data.js               # 自动生成，文章及图片数据
├── content/                  # 内容文件（编辑这里即可更新页面）
│   ├── archive/              # Subpage 2 文章（.md）
│   ├── codex/                # Subpage 3 文章（.md）
│   └── gallery/              # Subpage 4 图片（图片文件 / .json 元数据）
├── scripts/
│   └── build-content.js      # 构建脚本：扫描 content/ → 生成 js/data.js
├── audio/                    # 音乐文件
└── .github/workflows/
    └── deploy.yml            # GitHub Actions 自动部署
```

---

## 四个子页面

| 页面 | 标题 | 颜色 | 内容 | 数据来源 |
|------|------|------|------|----------|
| Subpage 1 | Persona | 红色 | 个人信息 | index.html 内嵌 HTML |
| Subpage 2 | 先輩文庫 | 蓝色 | 文章阅读器 | `content/archive/*.md` |
| Subpage 3 | 後輩寶庫 | 绿色 | 文章阅读器 | `content/codex/*.md` |
| Subpage 4 | 真實的走廊 | 黄色 | 胶片画廊 | `content/gallery/` |

---

## 添加内容

### Subpage 2 / 3 — 文章

在 `content/archive/` 或 `content/codex/` 下新建 `.md` 文件，使用 YAML 前置元数据：

```markdown
---
id: my-post
title: 文章标题
date: 2026.06.01
time: 14:30
cover: 📝
tags: [标签1, 标签2]
excerpt: 一句话摘要
---

# 正文标题

正文内容，支持完整 Markdown 语法（GFM）……
```

- `id` 必填，唯一标识
- 正文支持标题、表格、代码块、引用、列表、图片
- 按 `date` 降序排列

### Subpage 4 — 图片

**方式一**：直接把图片丢进 `content/gallery/`，自动生成标题。

**方式二**：加同名 `.json` 自定义元数据：

```json
{
  "src": "https://example.com/photo.jpg",
  "title": "图片标题",
  "sub": "副标题",
  "caption": "说明文字"
}
```

- 本地图片 `src` 填相对路径，如 `content/gallery/photo.jpg`
- 远程图片直接填 URL
- JSON 的 `src` 会覆盖自动检测

### 本地预览

```bash
node scripts/build-content.js   # 生成 js/data.js
# 浏览器打开 index.html
```

---

## 键盘 & 交互

| 操作 | 页面 | 行为 |
|------|------|------|
| 滚轮 | 轨道 | 旋转轨道，停止后自动吸附 |
| `↓` / `↑` | 轨道 | 直接切换到下一个/上一个图标 |
| `Esc` | 子页面 | 返回轨道（子页面回到初始状态） |
| `Esc` | 画廊灯箱 | 关闭灯箱 |
| `←` / `→` / `↑` / `↓` | 画廊灯箱 | 上一张/下一张 |
| `M` | 全局 | 音乐播放/暂停 |
| `Ctrl` + `←` / `→` | 全局 | 上一首/下一首 |

### 搜索栏

子页面 2/3/4 中顶栏右侧出现搜索框，按文章/图片标题过滤，支持 `Enter` 键和点击搜索按钮。

---

## 轨道吸附

滚动停止后自动吸附到最近的"稳定角"，确保始终有一个按钮居中展示。

- **阈值**：偏离稳定角 ≤ 5° → 弹回原位；> 5° → 吸附到下一个
- 箭头键直接跳转，不受阈值限制

---

## 自动部署

`git push` 到 `master` 分支后，GitHub Actions 自动运行 `scripts/build-content.js` 并将最新内容部署到 GitHub Pages。

```bash
git add content/
git commit -m "更新内容"
git push
```

首次使用需在仓库 Settings → Pages 中将 Source 设为 `gh-pages` 分支。

---

## 技术栈

- **JavaScript**：Vanilla JS（ES6+），无框架
- **动画**：GSAP（过渡动画）、CSS @keyframes
- **Markdown**：marked.js（GFM 渲染）
- **字体**：Google Fonts（Syne, DM Sans, Bebas Neue, JetBrains Mono 等）
- **部署**：GitHub Pages + Actions
