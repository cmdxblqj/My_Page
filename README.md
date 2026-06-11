# ◆ Smart Senpai · Orbital Experience

> *「汝、我が名を呼べ。心の怪盗団、出陣せよ！」*

---

## 🎭 CALLING CARD

**Orbital Experience** 是一款以 **ペルソナ5** 视觉美学为灵感的前端交互作品——将"轨道公转"作为核心交互范式，四颗按钮沿椭圆轨道运行，滚轮/键盘驱动旋转，每一个子页面都承载着不同的叙事氛围。

| 属性 | 数值 |
|------|------|
| 🎨 **设计系統** | Persona 5 Pop Art · 极简唱片 · 幕布过渡 |
| ⚡ **技术栈** | Vanilla JS · GSAP · marked.js · Google Fonts |
| 📐 **分辨率** | 1920×1080 固定比例 · 全屏等比缩放 |
| 🎵 **音频** | MP3 播放器 · 自定义歌单 |
| 🚀 **部署** | GitHub Pages · Actions 自动构建 |

> **美学宣言**：红蓝绿黄四色对应四个子页面。Pop art 遇上极简主义，大胆的调色板、粗边框、网点纹理——每一帧都是一张漫画面板。

---

## ◆ アーキテクチャ

```
My_Page/
├── index.html                   ★ 主入口 · 轨道页面 + 四个子页面内嵌
├── css/
│   ├── base.css                 # 全局变量 · 重置 · 背景 · 水面 · Pop层
│   ├── orbital.css              # 轨道 · 按钮 · 控件 · 幕布 · 对角层
│   ├── subpage1.css             # Persona 红色 · 个人介绍
│   ├── subpage2.css             # Archive 蓝色 · 怪盗文庫
│   ├── subpage3.css             # Codex  绿色 · 翠玉文庫
│   ├── subpage4.css             # Gallery 黄色 · 反逆画廊
│   └── responsive.css           # 响应式适配
├── js/
│   ├── app.js                   ★ 核心引擎 · 轨道物理 · 吸附 · 过渡 · 播放器
│   └── data.js                  🤖 自动生成 · 文章/画廊数据
├── content/                     ★ 内容目录 · 丢文件即可更新
│   ├── archive/                 # → Subpage 2 · 怪盗文庫
│   ├── codex/                   # → Subpage 3 · 翠玉文庫
│   └── gallery/                 # → Subpage 4 · 反逆画廊
├── scripts/
│   └── build-content.js         ★ 构建脚本 · md/json → data.js
├── .github/workflows/
│   └── deploy.yml               ★ CI/CD · push 即部署
├── audio/                       # 音乐资源
└── back.webp / but*.webp        # 视觉资源
```

---

## 🪐 轨道力学

### 核心参数

| 参数 | 值 | 说明 |
|------|-----|------|
| `CANVAS_W × H` | 1920 × 1080 | 设计分辨率 |
| `CENTER` | (288, 885.6) | 圆心偏左下 |
| `RADIUS` | 1248px | 轨道半径 |
| `BTN_SIZE` | 420px | 按钮图原始尺寸 |
| `INITIAL_ANGLE` | 60° | 初始旋转角 |
| `SNAP_EFFECTIVE_ANGLE` | 20° | 稳定视角偏移 |

### 吸附逻辑

```
滚动停止 → 找到最近稳定角
  ├─ 距离 ≤ 5° → 弹回原位（归位）
  └─ 距离 > 5° → 方向吸附（换下一个按钮）
```

### 四个稳定角度

| 角度 | 稳定按钮 | 子页面 |
|------|----------|--------|
| **20°** | Gallery · but4 | Subpage 4 · 黄色 |
| **110°** | Persona · but1 | Subpage 1 · 红色 |
| **200°** | Archive · but2 | Subpage 2 · 蓝色 |
| **290°** | Codex · but3 | Subpage 3 · 绿色 |

---

## 🎨 四个子页面

### 🔴 Subpage 1 · Persona — `Take Your Heart`

> 个人信息页 · 红色朋克 · 漫画面板 · 星级评定

- 静态 HTML 内嵌于 `index.html`
- 滚动驱动淡入淡出动画
- 特质卡片 + 联系方式

### 🔵 Subpage 2 · 怪盗文庫 — `Take Your Wisdom`

> 蓝色档案 · Markdown 阅读器 · 文章列表

```yaml
# content/archive/*.md 格式
---
id: mission-01
title: 心の怪盗団 · 最初の任務
date: 2026.06.01
cover: 🎭
tags: [使命, 怪盗]
excerpt: 最初のパレスへの潜入…
---
# Markdown 正文…
```

### 🟢 Subpage 3 · 翠玉文庫 — `Take Your Wealth`

> 绿色资料库 · 波纹过渡 · 资源笔记

- 与 Archive 结构相同，独立数据源
- `content/codex/*.md` 驱动

### 🟡 Subpage 4 · 反逆画廊 — `Take Your Vision`

> 黄色画廊 · 胶片灯箱 · 3D 倾斜

```json
// content/gallery/custom.json
{
  "src": "path/to/image.jpg",
  "title": "覚醒の刻",
  "caption": "Awakening"
}
```

---

## 🎛️ MP3 播放器

| 按键 | 行为 |
|------|------|
| `M` | 播放 / 暂停 |
| `Ctrl+←` | 上一首 |
| `Ctrl+→` | 下一首 |

```javascript
// audio/ 目录下添加音乐，然后在 app.js 注册：
const AUDIO_PLAYLIST = [
  { title:'Fabulous', artist:'BLU-SWING', src:'audio/xxx.mp3' }
];
```

---

## ⌨️ 完整键位表

| 按键 | 页面 | 行为 |
|------|------|------|
| `↓` / `↑` | 轨道 | 直接吸附到下一个/上一个图标 |
| `Esc` | 子页面 | 返回轨道主界面 |
| `Esc` | 灯箱 | 关闭灯箱（再按返回轨道） |
| `Esc` | 搜索框 | 清空搜索 |
| `Enter` | 搜索框 | 执行搜索 |
| `←` / `→` | 灯箱 | 上一张/下一张图片 |
| `M` | 全局 | 音乐播放/暂停 |
| `Ctrl+←/→` | 全局 | 切歌 |
| 滚轮 | 轨道 | 旋转轨道 |

---

## 🚀 自动部署

```
写 .md 丢图片 → git push → GitHub Actions → 网页更新
                                    │
                         ① checkout 代码
                         ② node scripts/build-content.js
                         ③ 部署到 gh-pages 分支
```

### 添加文章

```bash
# 1. 创建 md 文件
vim content/archive/my-post.md

# 2. 本地预览
node scripts/build-content.js
# 打开 index.html

# 3. 推送
git add content/ && git commit -m "新文章" && git push
```

### 添加图片

```bash
# 直接丢进 content/gallery/
cp photo.jpg content/gallery/
# 可选：加同名 .json 自定义标题
echo '{"title":"觉醒","caption":"Awakening"}' > content/gallery/photo.json
git add content/gallery/ && git commit -m "新图片" && git push
```

---

## 🧬 技术亮点

| 模块 | 技术 |
|------|------|
| 轨道渲染 | JS 三角函数定位 + `requestAnimationFrame` |
| 吸附系统 | 360° 环绕双向优先最近算法 + 5° 阈值 |
| 水面过渡 | Canvas 2D · 分形噪声 · 多边形网格 · 网点图案 |
| Pop 过渡 | CSS columns + GSAP 交错动画 |
| 幕布过渡 | Canvas 纹理生成 · 正弦波纹 · 缓动曲线 |
| 对角过渡 | SVG mask 水圆扩散 · Turbulence 滤镜 |
| Markdown | marked.js GFM 渲染 · P5 风格定制 CSS |

---

> *「俺たちは、心の怪盗団だ。」*  
> — Joker · Persona 5

◆ **TAKE YOUR HEART** ◆
