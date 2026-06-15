# Orbital Experience — 后期维护与扩展建议

> 适用版本：`div/` 目录（已拆分版本）  
> 最后更新：2026-06-11

---

## 一、文件结构速查

```
main/
├── back.png                    (背景图)
├── top.webm                    (装饰视频)
├── but1.png ~ but4.png         (4个轨道按钮图)
├── BLU-SWING - Fabulous.mp3    (BGM)
├── branch4/                    (不再使用，已改为纯代码)
├── orbital-buttons.html        (旧单文件版，保留参考)
│
└── div/                        ★ 当前工作目录
    ├── index.html              (232行 · 入口)
    ├── css/
    │   ├── base.css            (53行 · 变量/重置/背景/水面/Pop层)
    │   ├── orbital.css         (109行 · 控件/轨道/按钮/幕布/对角层)
    │   ├── subpage1.css        (139行 · Persona 红色)
    │   ├── subpage2.css        (278行 · Archive 蓝色)
    │   ├── subpage3.css        (253行 · Codex 绿色)
    │   ├── subpage4.css        (171行 · Gallery 黄色)
    │   └── responsive.css      (40行 · 全局响应式)
    └── js/
        └── app.js              (228行 · 全部 JS 逻辑)
```

---

## 二、界面元素修改指南

### 2.1 全局配色

**位置**：`div/css/base.css` 第 1-30 行 `:root` 块

```css
--obsidian: #08080c;       /* 最深背景 */
--amber: #c8963e;           /* 琥珀色（按钮光晕、滚动提示） */
--amber-glow: rgba(200,150,62,0.45);
```

**常见修改**：
- 改整体暗度 → 修改 `--obsidian`
- 改按钮悬停光 → 修改 `--amber` 和 `--amber-glow`
- 改字体 → 修改 `--font-display` / `--font-body` / `--font-accent` / `--font-mono`（同时需更新 `index.html` 第 7-8 行的 Google Fonts 链接）

### 2.2 轨道按钮

**图片**：替换 `main/but1.png` ~ `but4.png`（保持 800×800 圆形 PNG）

**路径**：`div/js/app.js` 第 3 行 `BUTTON_DEFS`
```javascript
const BUTTON_DEFS=[
  {dataId:1,img:'../../but4.png',baseAngle:0},
  {dataId:2,img:'../../but3.png',baseAngle:90},
  {dataId:3,img:'../../but2.png',baseAngle:180},
  {dataId:4,img:'../../but1.png',baseAngle:270}
];
```

**按钮尺寸**：`div/css/base.css` 第 5 行 `--btn-size: 420px`

**轨道参数**：`div/js/app.js` 第 2 行
```javascript
const CANVAS_W=1920, CANVAS_H=1080,       // 画布尺寸
      CENTER_X=CANVAS_W*0.15,              // 圆心 X（0.15=偏左）
      CENTER_Y=CANVAS_H*0.82,              // 圆心 Y（0.82=偏下）
      RADIUS=CANVAS_W*0.65;                // 轨道半径
```

### 2.3 左上角控件

**隐藏/显示行为**：`div/css/orbital.css` 第 55-79 行 `.fixed-controls`

```css
transform: translateY(calc(-100% + 5px));  /* 隐藏幅度：+5px 是露出边缘 */
transition: transform 0.5s cubic-bezier(0.22,0.61,0.36,1);  /* 动画缓动 */
```

- 改露出边缘：调 `+5px`（越大露出越多）
- 改动画速度：调 `0.5s`
- 改光晕颜色：改 `::after` 中的 `rgba(200,150,62,0.7)` 和 `--amber-glow`
- 改首次展示时长：`div/js/app.js` 搜索 `setTimeout(..., 2200)` 改毫秒数

### 2.4 ESC 按钮

**禁用态样式**：`div/css/orbital.css` `.esc-btn.disabled`

在轨道主界面时 ESC 自动 `disabled`（灰色不可点击），进入子页面后解除。

### 2.5 BGM 音乐

**替换音频**：覆盖 `main/BLU-SWING - Fabulous.mp3`

**路径引用**：`div/index.html` 第 225 行 `<audio>` 标签的 `src` 属性

**快捷键**：按 `M` 键切换播放/暂停

---

## 三、四个子页面内容修改

### 3.1 Persona（红色 · but1 · Subpage 1）

**HTML 位置**：`div/index.html` 第 48-92 行

**修改方式**：直接编辑 HTML。主要区块：
- 标题区（第 56-58 行）：名字 "Kaito"、副标题
- 特质卡片（第 66-70 行）：4 个 trait-card
- 星级评定（第 74 行）：5 个 star（`.star.empty` 为空星）
- 联系方式（第 83-85 行）：3 个链接

**滚动入场动画**：`div/js/app.js` 搜索 `updatePersonaSections` — 控制各 section 随滚动淡入淡出

### 3.2 Archive（蓝色 · but2 · Subpage 2）

**数据位置**：`div/js/app.js` 搜索 `STATIC_ARTICLES`（约第 107 行）

**数据结构**：
```javascript
{
  id: 'mission-01',              // 唯一ID
  title: '心の怪盗団 · 最初の任務',
  date: '2026.06.01',
  time: '14:30',
  cover: '🎭',                   // emoji 封面
  tags: ['使命', '怪盗'],
  excerpt: '摘要文字...',
  content: '\n# Markdown正文...'  // 支持完整 Markdown
}
```

**操作**：
- **添加文章**：在 `STATIC_ARTICLES` 数组末尾追加对象
- **删除文章**：移除对应对象
- **写正文**：`content` 支持 Markdown（标题 h1-h3、表格、代码块、引用、列表）
- **超 9 篇**：需在 `div/css/subpage2.css` 追加 `.article-btn:nth-child(10){...}` 延迟规则

### 3.3 Verdant Codex（绿色 · but3 · Subpage 3）

**数据位置**：`div/js/app.js` 搜索 `STATIC_CODEX`（约第 205 行）

数据结构与 Archive 相同，共 6 篇。操作方式完全一致。

**与 Archive 的差异**：
- 绿色主题 CSS 在 `div/css/subpage3.css`
- 含 `reader-ripple` 波纹切换效果
- 状态变量 `codexState`（不是 `archiveState`）

### 3.4 Rebel Gallery（黄色 · but4 · Subpage 4）

**数据位置**：`div/js/app.js` 搜索 `GALLERY_IMAGES`（约第 214 行）

**数据结构**：
```javascript
{
  id: 'frame-01',
  src: 'https://picsum.photos/seed/rebel01/800/533',  // 图片URL
  title: '覚醒の刻',
  sub: 'FRAME 001 · AWAKENING',
  caption: 'Awakening',
}
```

**操作**：
- **替换图片**：改 `src` 字段，支持本地路径（如 `../../images/photo01.jpg`）或远程 URL
- **推荐尺寸**：800×533（3:2），文件 < 500KB
- **本地路径注意**：JS 中路径相对于 `div/index.html`，所以 `../../images/xx.jpg` = `main/images/xx.jpg`
- **灯箱 3D 倾斜**：`div/js/app.js` 搜索 `updateTilt4`，调 `maxRotateY=22` / `maxRotateX=16` 改变倾斜幅度

---

## 四、数据接入方案

三个子页面使用**静态内联数据**。以下是从静态到动态的升级路径。

### 4.1 方案A：JSON 文件接入（推荐起步）

**Archive/Codex 改造**（`div/js/app.js` 中修改 `initArchive`/`initCodex`）：
```javascript
async function initArchive(){
  const resp = await fetch('../../data/articles-archive.json');
  archiveState.articles = await resp.json();
  renderArticleButtons(archiveState.articles);
  document.getElementById('readerBack2').addEventListener('click', closeArchiveReader);
  setTimeout(()=>{ archiveState.entranceComplete=true; setPageReady('archive'); }, 500);
}
```

**JSON 文件**（放在 `main/data/articles-archive.json`）：
```json
[
  {
    "id": "mission-01",
    "title": "标题",
    "date": "2026.06.01",
    "time": "14:30",
    "cover": "🎭",
    "tags": ["标签1"],
    "excerpt": "摘要...",
    "content": "# Markdown 正文..."
  }
]
```

### 4.2 方案B：Markdown 文件直读

**结构**：
```
main/
├── data/
│   ├── archive-index.json    (索引)
│   ├── archive/
│   │   ├── mission-01.md
│   │   └── mission-02.md
│   └── codex/
│       ├── codex-01.md
│       └── ...
```

**加载逻辑**：文章正文延迟到点击打开时才 `fetch('.md')`，解析靠已有的 `marked.js`。

### 4.3 方案C：REST API

适合有后端服务的场景。API 端点参考：
```
GET    /api/articles/:archive    → 列表
GET    /api/articles/:id         → 详情
GET    /api/gallery              → 图片列表
```
前端改造时保留静态数据作为 `catch` 降级方案。

### 4.4 Gallery 图片接入

```javascript
// 本地图片（路径相对 div/index.html）
const GALLERY_IMAGES = [
  { id:'frame-01', src:'../../gallery/photo01.jpg', title:'标题', sub:'FRAME 001', caption:'说明' },
];

// 远程 CDN
const CDN = 'https://your-cdn.com/';
const GALLERY_IMAGES = [
  { id:'frame-01', src: CDN+'photo01.jpg', ... },
];
```

Gallery 内置懒加载：前 4 张 `loading="eager"`，后续 `loading="lazy"`。

---

## 五、CSS 修改定位表

| 要改什么 | 文件 | 行号范围 | 关键选择器 |
|---------|------|---------|-----------|
| 全局配色变量 | css/base.css | 1-30 | `:root` |
| 背景图路径 | css/base.css | 27-30 | `.bg-layer`, `.bg-wave` |
| 按钮隐藏动画 | css/orbital.css | 55-79 | `.fixed-controls` |
| 按钮悬停光晕 | css/orbital.css | 80-82 | `.btn-orbit:hover` |
| Persona 红色 | css/subpage1.css | 全文件 | `.subpage-overlay` |
| Archive 蓝色 | css/subpage2.css | 全文件 | `.subpage2-overlay` |
| Codex 绿色 | css/subpage3.css | 全文件 | `.subpage3-overlay` |
| Gallery 黄色 | css/subpage4.css | 全文件 | `.subpage4-overlay` |
| 幕布加载动画 | css/orbital.css | 969-998 | `.curtain-loading` |
| 平板适配 | css/responsive.css | 1005-1028 | `@media(max-width:860px)` |
| 手机适配 | css/responsive.css | 1030-1043 | `@media(max-width:640px)` |

---

## 六、JS 修改定位表

| 要改什么 | 行号 | 关键标识 |
|---------|------|---------|
| 按钮图/角度 | 3 | `BUTTON_DEFS` |
| 轨道圆心/半径 | 2 | `CENTER_X`, `CENTER_Y`, `RADIUS` |
| 滚动灵敏度 | 2 | `ANGLE_SENSITIVITY`, `LERP_FACTOR` |
| 吸附参数 | 2 | `SNAP_EFFECTIVE_ANGLE`, `SNAP_DURATION` |
| Archive 文章数据 | ~107 | `STATIC_ARTICLES` |
| Codex 文章数据 | ~205 | `STATIC_CODEX` |
| Gallery 图片数据 | ~214 | `GALLERY_IMAGES` |
| 水面过渡速度 | ~73 | `RISE_DURATION`, `FALL_DURATION`, `MIN_HOLD` |
| Pop 过渡速度 | ~98 | `PopTransition` 内的 `duration:0.6` |
| 幕布过渡速度 | ~166 | `CURT_CLOSE`, `CURT_OPEN`, `CURT_HOLD` |
| 对角过渡速度 | ~117 | `duration:1.0` 在 `triggerDiagTransition` 内 |
| 页面就绪等待 | ~42 | `waitForPageReady` 的 `maxWait` 参数(默认5000ms) |

---

## 七、过渡动画 4 说明（对角水面 · but4 · 已优化）

当前版本**不再使用** `branch4/first.png` 和 `branch4/second.png`，改为纯代码实现：

1. 黄色水面圆从左上角扩散覆盖全屏（~1s）
2. 切换子页面 + 等待页面就绪
3. 反向遮罩圆从左上角消退（~1s）

如需恢复图片碰撞效果，参考旧版 `orbital-buttons.html` 中的 `triggerDiagTransition` 函数。

---

## 八、子页面扩展建议

### 8.1 标签筛选（Archive/Codex）

```javascript
function filterByTag(tag){
  const filtered = archiveState.articles.filter(a => a.tags.includes(tag));
  renderArticleButtons(filtered);
}
```

在 `div/index.html` 的 `article-list` 上方加筛选按钮 HTML，在 `div/js/app.js` 中绑定事件。

### 8.2 文章排序

```javascript
function sortArticles(by='date'){
  const sorted = [...archiveState.articles].sort((a,b)=>{
    if(by==='date') return b.date.localeCompare(a.date);
    if(by==='title') return a.title.localeCompare(b.title);
  });
  renderArticleButtons(sorted);
}
```

### 8.3 Gallery 键盘导航（已内置）

灯箱打开时：`← → ↑ ↓` 切换图片，`ESC` 关闭灯箱（再次 `ESC` 返回轨道）。

---

## 九、性能提示

| 过渡 | 优化点 |
|------|--------|
| 水面(but1) | `buildBlocks()` 生成 200+ 多边形，低配机减少 `rC`(行数，当前22) |
| Pop(but2) | 纯 CSS+GSAP，开销最低 |
| 幕布(but3) | `buildCurtainTex()` resize 时重建 Canvas，可用 `ResizeObserver` 替代 |
| 对角(but4) | 已去除图片，仅 SVG 水圆，开销大幅降低 |

---

## 十、路径规则速记

```
div/index.html  (基准)
   ├── css/base.css      →  url() 相对CSS自身    → ../../back.png
   ├── js/app.js         →  img:'' 相对HTML文档  → ../../but4.png
   ├── src="..."         →  相对HTML自身          → ../top.webm
   └── fetch('...')      →  相对HTML自身          → ../../data/xxx.json
```
