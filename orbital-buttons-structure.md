# orbital-buttons.html 结构文档

> **总行数**: 1506 行  
> **文件大小**: ~1.5MB (含内联数据)  
> **依赖**: GSAP 3.12.5 (CDN), Marked.js (CDN), Google Fonts

---

## 一、HTML 头部 (`<head>`) — 行 1-1046

### 1.1 元数据 & 字体加载 — 行 1-11
| 行号 | 内容 | 作用 |
|------|------|------|
| 1-6 | `<!DOCTYPE html>` ~ `<meta viewport>` | HTML5 文档声明、视口设置 |
| 7-9 | `<link rel="preconnect">` + Google Fonts | 预连接 Google Fonts CDN，加载 Syne, Bebas Neue, DM Sans, Fredoka, Noto Sans SC, JetBrains Mono |
| 10-11 | `<script src="gsap">` + `<script src="marked">` | 加载 GSAP 动画库 + Marked.js Markdown 解析 |

### 1.2 CSS 自定义属性 `:root` — 行 12-30
| 行号 | 变量组 | 用途 |
|------|--------|------|
| 13 | 全局颜色 | obsidian(#08080c), amber(#c8963e), silver, text |
| 14-18 | 画布尺寸 | canvas-w:1920, canvas-h:1080, btn-size:420, fade-duration:1.5s |
| 19-22 | Persona 红色系 | bg-deep, bg-card, red-bright~pink-soft, gold, white-soft |
| 24-26 | Archive 蓝色系 | blue-klein(#002FA7) ~ blue-deep, sky-bright~sky-soft, gold-pale |
| 27-31 | 字体变量 | font-display(Bebas Neue), font-body(DM Sans), font-accent(Fredoka), font-mono(JetBrains Mono) |

### 1.3 全局重置 & 基础样式 — 行 32-36
- 全局 `*,*::before,*::after` 重置盒模型
- `html,body`: 全视口尺寸、隐藏溢出、深色背景(#08080c)、抗锯齿、禁用用户选择

### 1.4 共享背景层 — 行 38-52
| 行号 | 类名 | 作用 |
|------|------|------|
| 39-40 | `.bg-layer` | 固定背景图层，使用 back.png |
| 41-47 | `.bg-wave` | 波浪滤镜背景，带 SVG 扭曲滤镜 `#waveDistort`，clip-path 圆形扫描动画 |
| 48-49 | `.vignette-overlay` | 暗角遮罩，径向渐变 |
| 50-52 | `.grain-overlay` | 颗粒噪点纹理，SVG 数据 URI，不透明度 0.04 |

### 1.5 水面 Canvas — 行 54-56
- `#waterCanvas`: 固定全屏 canvas，z-index:200，用于红色水面过渡动画

### 1.6 Pop 过渡层 — 行 58-65
- `.pop-overlay`: 固定全屏，z-index:250，默认隐藏
- `.pop-column`: 绝对定位柱状条，带圆角 + 圆点纹理

### 1.7 固定左上角控制 — 行 67-86
| 行号 | 元素 | 作用 |
|------|------|------|
| 68-69 | `.fixed-controls` | 固定定位 z-index:300，flex 布局 |
| 70-78 | `.music-control` / `.disc-icon` | 黑胶唱片 SVG 图标，旋转动画(spinning/paused)，悬停琥珀色光晕 |
| 79 | `.music-label` | "Audio" 标签文字 |
| 80-86 | `.esc-btn` | ESC 返回按钮，圆形 SVG，悬停缩放/光晕，disabled 状态灰色 |

### 1.8 轨道主舞台 — 行 88-129
| 行号 | 区域 | 作用 |
|------|------|------|
| 89-93 | `.app-wrapper` | 绝对定位 1920×1080 画布，居中缩放适配视口，淡入淡出过渡 |
| 95-106 | `.scroll-hint` | 滚动提示 SVG(弧形箭头)，reveal/dismiss 动画 |
| 108-109 | `.buttons-layer` | 按钮容器层，pointer-events:none |
| 110-122 | `.btn-wrapper` / `.btn-orbit` | 420px 圆形按钮，阴影+缩放悬停效果，idle-breathing 呼吸动画 |
| 123-124 | `.top-video` | 顶层装饰视频(top.webm)，覆盖整个画布 |
| 125-128 | `.angle-display` | 右下角角度显示(0°-360°)，淡入显示 |

### 1.9 子页面 1 — Persona (红色系) — 行 130-267
| 行号 | 区域 | 作用 |
|------|------|------|
| 131-136 | `.subpage-overlay` | 固定全屏 z-index:5，可滚动，深红黑色径向渐变底 |
| 137-154 | 装饰背景层 | polkadot 波尔卡圆点(红)、large 大圆点、halftone 半色调条纹、action-lines 放射线 |
| 155-162 | 入场动画 | `panelReveal`(上移+缩放)、`slashIn`(宽度展开) |
| 163-164 | `.page-grid` / `.content-col` | 三列网格布局(1fr min(65ch,90%) 1fr) |
| 168-170 | `.p5-diamond` | P5风格菱形装饰，旋转入场动画，small/gold 变体 |
| 171-178 | `.comic-panel` | 漫画面板卡片，3px 黑边框+1.5px 红轮廓，偏移阴影，悬停浮起 |
| 179-193 | `.hero-block` | 标题区：calling-card-label(金色标签)、hero-name(大标题+红色高亮+星形装饰)、hero-subtitle |
| 194-200 | `.speech-accent` | 对话气泡标签，红色背景+脉冲光晕动画 |
| 201-202 | `.halftone-highlight` | 半色调高亮文本 |
| 203-208 | `.section-header` | 章节标题(红色)，前置◆菱形 |
| 209-228 | `.traits-grid` / `.trait-card` | 2列特质卡片网格，黑边框+红轮廓，悬停浮起 |
| 229-233 | `.confidant-rank` / `.star` | 五角星评级，clip-path 星形，旋转动画 |
| 236-246 | `.contact-list` | 联系方式链接列表，红色边框，悬停变红背景 |
| 247-249 | `.site-footer` | 页脚虚线分隔 |
| 250-264 | 角落装饰 & 滴落效果 | corner-deco(四角L形边框)、drip-container(红色滴落线条) |
| 265-267 | 滚动条样式 | 6px宽，深红色主题 |

### 1.10 子页面 2 — Archive (克莱因蓝) — 行 269-530
| 行号 | 区域 | 作用 |
|------|------|------|
| 270-275 | `.subpage2-overlay` | 固定全屏 z-index:6，深蓝黑色底 |
| 276-293 | 装饰背景层 | 蓝色系 polkadot、large dots、halftone、action-lines |
| 319-328 | `.app-layout` / `.article-panel` | 居中→左移弹性布局，reader-open 时左侧 380px |
| 329-339 | `.reader-panel` | 阅读器面板，flex 展开动画，sticky 定位 |
| 340-348 | `.comic-panel` | 蓝色系漫画面板 |
| 349-364 | `.archive-header` | 标题区：PHANTOM ARCHIVE 标签、怪盗文庫 大标题(蓝色高亮)、header-slash |
| 365-426 | `.article-btn` | 文章列表按钮，蓝色边框+偏移阴影，悬停浮起，active 发光动画 |
| 427-502 | `.reader-inner` / `.md-content` | 阅读器面板+Markdown渲染样式(h1-h3, p, strong, em, a, ul/ol, blockquote, code, pre, table, hr) |
| 503-509 | `.api-status` | 右下角 API 状态指示器 |
| 510-530 | 滚动条 & 响应式 | 蓝色主题滚动条，@media 860px/640px 断点 |

### 1.11 子页面 3 — Verdant Codex (翠玉文庫/绿色) — 行 547-799
- 结构与 Subpage 2 完全对称，颜色替换为绿色系
- 类名前缀 `.subpage3-overlay`
- 绿色主题: #00D840(primary), #30FF30(neon), #80FF40(lime), #0D7020(crimson)
- 含 reader-ripple 波纹效果

### 1.12 子页面 4 — Rebel Gallery (反逆の画廊/黄色) — 行 800-970
- 电影胶片画廊布局
- 类名前缀 `.subpage4-overlay`
- 黄色主题: #C8A200(primary), #E6BE00(bright), #FFD700(gold)
- 独特组件:
  - `.film-card`: 胶片卡片，sprocket-holes 齿轮孔装饰，film-image-area(3:2 比例)
  - `.lightbox-overlay`: 全屏灯箱，3D 透视舞台
  - `.lightbox-film-card`: 放大胶片卡，perspective(1200px)，3D 倾斜
  - `.film-glare`: 光泽反射叠加层

### 1.13 过渡 Canvas & 加载层 — 行 971-998
| 行号 | 元素 | 作用 |
|------|------|------|
| 972-973 | `#curtainCanvas` | 绿色幕布过渡 canvas，z-index:400 |
| 974-998 | `.curtain-loading` | 幕布加载指示器，旋转星形+脉冲文字+跳动菱形圆点 |

### 1.14 对角线过渡层 — 行 999-1003
- `#diagOverlay`: 全屏黄色水面过渡层，z-index:350
- `#diagSvg`: 内嵌 SVG(波动滤镜+水面圆)

### 1.15 响应式媒体查询 — 行 1005-1043
- `@media(max-width:860px)`: 平板布局(单列、隐藏角落装饰)
- `@media(max-width:640px)`: 手机布局(缩小字号、紧凑间距)

---

## 二、HTML 主体 (`<body>`) — 行 1047-1257

### 2.1 SVG 滤镜定义 — 行 1049-1054
- `#waveDistort`: feTurbulence + feDisplacementMap 水面扭曲滤镜

### 2.2 全局背景层 — 行 1056-1063
| 行号 | 元素 | 作用 |
|------|------|------|
| 1057 | `.bg-layer` | 背景图 back.png |
| 1058 | `.bg-wave` | 波浪动画层 |
| 1059 | `.vignette-overlay` | 暗角 |
| 1060 | `.grain-overlay` | 噪点 |
| 1062 | `#waterCanvas` | 水面过渡 canvas |
| 1063 | `#popTransitionOverlay` | Pop 柱状过渡容器 |

### 2.3 固定控制 — 行 1065-1073
| 行号 | 元素 | ID | 作用 |
|------|------|-----|------|
| 1067-1069 | 音乐控制 | `#musicToggle`, `#discIcon` | 黑胶唱片 SVG 图标 + "Audio" 标签 |
| 1071-1072 | ESC 按钮 | `#escButton` | ESC 文字圆形按钮 |

### 2.4 子页面 1 HTML — 行 1075-1119
- Persona 红色主题页面
- 标题区: CALLING CARD 标签、Kaito 名字(红色高亮+星形)、副标题
- 4 个 anim-section: Origin Story、Arsenal(特质卡片)、Current Heist(星级+进度)、Contact(链接)
- 页脚虚线+版权

### 2.5 子页面 2 HTML — 行 1121-1150
- Archive 蓝色主题页面
- 标题区: PHANTOM ARCHIVE 标签、怪盗文庫 大标题
- `#articleList2`: 文章列表(JS 动态渲染)
- `#readerPanel2`: 阅读器面板(Markdown 渲染区)
- API 状态指示器

### 2.6 子页面 3 HTML — 行 1152-1181
- Verdant Codex 绿色主题
- `#articleList3`: 翠玉文庫文章列表
- `#readerPanel3`: 绿色阅读器

### 2.7 子页面 4 HTML — 行 1183-1216
- Rebel Gallery 黄色主题
- `#galleryGrid4`: 2列胶片卡片网格
- `#lightboxOverlay4`: 3D 灯箱(含舞台、胶片卡、图片区、光泽层)
- `#lightboxClose4`: 菱形关闭按钮（45°旋转）

### 2.8 过渡层 HTML — 行 1218-1245
| 行号 | 元素 | 来源 | 作用 |
|------|------|------|------|
| 1219-1225 | `#curtainCanvas` + `.curtain-loading` | branch3 | 绿色幕布过渡 canvas + 加载指示器 |
| 1228-1244 | `#diagOverlay` | branch4 | 黄色水面过渡层，含 SVG(波动滤镜+正向圆+反向圆+遮罩圆)、2张碰撞图片(`branch4/first.png`, `branch4/second.png`) |

### 2.9 轨道主舞台 HTML — 行 1247-1257
| 行号 | 元素 | 作用 |
|------|------|------|
| 1248 | `.app-wrapper#appWrapper` | 主容器 1920×1080 |
| 1249 | `.buttons-layer#buttonsLayer` | 按钮层(JS 动态生成) |
| 1250 | `video.top-video` | top.webm 装饰视频 |
| 1251-1255 | `.scroll-hint` | 滚动提示 SVG |
| 1256 | `audio#bgMusic` | BGM 音频(BLU-SWING - Fabulous.mp3) |
| 1257 | `.angle-display#angleDisplay` | 角度显示 000° |

---

## 三、JavaScript (`<script>`) — 行 1258-1503

### 3.1 轨道配置 — 行 1260-1264
| 行号 | 变量/函数 | 作用 |
|------|----------|------|
| 1260 | `CANVAS_W/CANVAS_H` | 画布尺寸 1920×1080 |
| 1260 | `CENTER_X/CENTER_Y` | 轨道圆心(288, 885.6) |
| 1260 | `RADIUS` | 轨道半径 1248 |
| 1260 | `BTN_SIZE` | 按钮尺寸 420px |
| 1260 | `FADE_MARGIN` | 边缘淡出距离 220px |
| 1260 | `ANGLE_SENSITIVITY` | 滚轮角度灵敏度 0.08 |
| 1260 | `LERP_FACTOR` | 平滑插值因子 0.12 |
| 1260 | `INITIAL_ANGLE` | 初始角度 60° |
| 1261 | `SNAP_EFFECTIVE_ANGLE` | 吸附有效角度 20° |
| 1261 | `SNAP_DURATION/COOLDOWN` | 吸附动画 800ms / 冷却 1200ms |
| 1262 | `BUTTON_DEFS` | 4个按钮定义: but4(0°), but3(90°), but2(180°), but1(270°) |

### 3.2 DOM 引用 — 行 1264
- 14 个核心 DOM 元素引用(appWrapper, buttonsLayer, scrollHint, discIcon, musicToggle, bgMusic, angleDisplay, escButton, 4×subpageOverlay, waterCanvas, popOverlay)

### 3.3 轨道按钮系统 — 行 1266-1273
| 行号 | 函数 | 作用 |
|------|------|------|
| 1267-1269 | `buildButtons()` | 动态创建 4 个 SVG 圆形按钮(420px)，绑定点击事件 |
| 1269 | 点击分发 | dataId 4→water(b1/persona), 3→pop(b2/archive), 2→curtain(b3/codex), 1→diag(b4/gallery) |
| 1271 | `updateAllButtons(a)` | 根据角度计算按钮在椭圆轨道上的位置，边缘淡出，空闲呼吸动画 |

### 3.4 吸附系统 — 行 1275-1279
| 行号 | 函数 | 作用 |
|------|------|------|
| 1275 | `findSnapTarget(d)` | 找到最近的吸附角度 |
| 1276 | `triggerSnap(t)` | 启动吸附动画 |
| 1277 | `cancelSnap()` | 取消吸附 |
| 1278 | `scheduleSnapCheck()` | 滚动停止后延迟检查是否需要吸附 |

### 3.5 滚动提示 — 行 1281-1284
- `revealScrollHint()`: 显示弧形滚动提示
- `dismissScrollHint()`: 首次滚动后隐藏并移除提示

### 3.6 轨道动画循环 — 行 1286-1287
- `orbitalAnimate(ts)`: requestAnimationFrame 循环，处理吸附动画 + 平滑插值

### 3.7 输入处理 — 行 1289-1293
| 行号 | 函数 | 作用 |
|------|------|------|
| 1289 | `initScrollHandler()` | 鼠标滚轮旋转轨道(非被动模式，可 preventDefault) |
| 1290 | `initKeyboardHandler()` | 方向键旋转轨道(上下箭头)，ESC 键触发返回过渡 |
| 1291 | `initTouchHandler()` | 触摸滑动旋转轨道 |
| 1292 | `applyScale()` | 根据视口缩放画布 |
| 1293 | `initResizeHandler()` | 窗口大小变化时重新缩放 |

### 3.8 音乐控制 — 行 1296-1299
- `initMusicControl()`: 点击切换播放/暂停，黑胶图标旋转/暂停动画，M 键快捷键

### 3.9 ESC 按钮 — 行 1301
- `initEscButton()`: 点击触发对应过渡返回轨道

### 3.10 统一页面就绪检查 — 行 1303-1310
| 行号 | 函数 | 作用 |
|------|------|------|
| 1304 | `pageReadyFlags` | 标记 4 个子页面是否已初始化完成 |
| 1305 | `setPageReady(name)` | 设置指定页面就绪 |
| 1306-1310 | `waitForPageReady(name, maxWait)` | Promise 轮询等待页面就绪(默认最长 5s)，用于过渡下半部分触发条件 |

### 3.11 页面状态管理 — 行 1312-1320
| 行号 | 函数 | 作用 |
|------|------|------|
| 1312 | `currentPage` | 当前页面标识: 'orbital'/'persona'/'archive'/'codex'/'gallery' |
| 1313 | `hideAllSubpages()` | 隐藏所有子页面(重置 transition/opacity/active) |
| 1314 | `showOrbital()` | 显示轨道主页，隐藏所有子页面，ESC 按钮失效 |
| 1315 | `showPersona()` | 显示 Persona 子页面(subpageOverlay)，更新滚动动画 |
| 1316 | `showArchive()` | 显示 Archive 子页面(subpage2Overlay) |
| 1317 | `showCodex()` | 显示 Verdant Codex 子页面(subpage3Overlay) |
| 1318 | `showGallery()` | 显示 Rebel Gallery 子页面(subpage4Overlay) |

### 3.12 Persona 滚动动画 — 行 1322-1326
- `updatePersonaSections()`: 根据视口位置淡入淡出 anim-section
- `onPersonaScroll()`: 滚动节流
- `initPersonaScroll()`: 绑定滚动事件+设置 persona 页面就绪(500ms 延迟)

### 3.13 点击火花效果 — 行 1328-1329
- `initSparkle()`: 各子页面点击产生对应颜色火花粒子(红/蓝/绿/黄)

### 3.14 水面过渡 (but1 → Persona) — 行 1331-1355
| 行号 | 函数/变量 | 作用 |
|------|----------|------|
| 1331-1341 | 红色调色板 | `RED_PALETTE`(35色)、`STRIPE_REDS`(8色) |
| 1332 | 时间常量 | RISE_DURATION=1400, FALL_DURATION=1400, MIN_HOLD=600, WATER_IDLE=0.035 |
| 1333-1337 | 波形函数 | easeInOutCubic, easeOutExpo, triWave, sawWave, computeAngularSurface |
| 1340-1341 | 纹理构建 | `createBenDayPattern`(波点纹理)、`buildBlocks`(生成随机多边形水块) |
| 1342-1344 | Canvas 渲染 | getSurfaceYArray, clipToWater, drawBlocks, drawSurfaceLine, drawSurfaceDots, waterRender |
| 1348 | `triggerWaterTransition(dir)` | 触发水面过渡('toPersona'/'toOrbital')，设置 rising 阶段 |
| 1349-1350 | `updateWaterTransition(now)` | 三阶段状态机: rising→holding→falling，**holding 阶段等待 `pageReadyFlags[targetPage]` + MIN_HOLD** |
| 1352-1353 | `waterAnimate(ts)` | RAF 水面动画循环 |

### 3.15 Pop 柱状过渡 (but2 → Archive) — 行 1357-1363
| 行号 | 函数 | 作用 |
|------|------|------|
| 1357-1360 | `PopTransition` 对象 | _calcGeometry(计算列数/宽高)、_createColumns(创建彩色列元素) |
| 1360 | `PopTransition.play(isRev)` | 播放过渡(柱状条覆盖屏幕)，GSAP stagger 动画 |
| 1361 | `PopTransition.finish()` | 完成过渡(柱状条移出屏幕) |
| 1363 | `triggerPopTransition(dir)` | 异步触发: play → showArchive/showOrbital → **`await waitForPageReady(targetP)`** → finish |

### 3.16 Archive 文章系统 (子页面2) — 行 1365-1373
| 行号 | 函数/变量 | 作用 |
|------|----------|------|
| 1366 | `STATIC_ARTICLES` | 4篇内置 Persona 5 主题文章(日文+中文) |
| 1368 | `archiveState` | 文章列表状态(articles, activeArticleId, isReaderOpen) |
| 1369 | `renderArticleButtons(articles)` | 渲染文章列表按钮 |
| 1370 | `openArchiveArticle(id)` | 打开文章并展开阅读器面板 |
| 1371 | `closeArchiveReader()` | 关闭阅读器返回列表视图 |
| 1372 | `renderArchiveContent(a)` | 在阅读器中渲染 Markdown 内容 |
| 1373 | `initArchive()` | 初始化 Archive(渲染列表、绑定事件、2s 后设置 `setPageReady('archive')`) |

### 3.17 对角线水面过渡 (but4 → Gallery) — 行 1375-1429
| 行号 | 函数/变量 | 作用 |
|------|----------|------|
| 1376 | DOM 引用 | diagOverlay, diagSvg, diagCircle, diagCircleRev, diagRevealCircle, diagTurbulence, diagImg1, diagImg2 |
| 1377-1382 | 辅助函数 | diagGetViewport, diagMaxRadius, diagComputeStartPos, diagUpdateViewBox, diagPositionImages, diagStartWaterBreath, diagStopWaterBreath |
| 1385-1429 | `triggerDiagTransition(dir)` | **两阶段 GSAP 时间线**: |
| | 阶段1 (0~1.0s) | 两张图片从对角线方向滑入并碰撞(9个tween)，黄色水面圆从左上角扩散覆盖全屏，碰撞震动效果 |
| | 页面切换 (1.0s) | onComplete 触发: 启动水面呼吸动画，切换页面(showGallery/showOrbital)，**`await waitForPageReady(targetP)`** |
| | 阶段2 (动态) | 等待就绪后: 图片原路返回(1s)，切换反向水面圆+遮罩圆扩散(1s)，最终重置所有元素 |

### 3.18 幕布过渡 (but3 → Codex) — 行 1430-1477
| 行号 | 函数/变量 | 作用 |
|------|----------|------|
| 1431-1434 | 配置 | curtainCanvas, curtainCtx, curtainLoading; 状态变量(curtainState, curtainProgress等)；常量(CURT_CLOSE=1000, CURT_OPEN=1000, CURT_HOLD=1200) |
| 1435-1438 | 缓动函数 | curtEaseClose(先快后慢+微弹跳)、curtEaseOpen(快速打开+平滑) |
| 1439-1448 | `buildCurtainTex()` | 构建幕布纹理 Canvas: 13种色块(黑/深绿/霓虹绿)+Ben-Day圆点图案+Persona 5风格底部锯齿边+霓虹绿描边 |
| 1449-1450 | Canvas 函数 | curtResize(适配DPR)、curtGetOffset(计算水平条纹偏移)、curtGetHoldWave(闭合状态波动) |
| 1452-1466 | `curtDraw(now)` | 核心渲染: open→空，closed→左右幕布条纹+波动，closing/opening→条纹偏移+中心霓虹接缝 |
| 1468 | `triggerCurtainTransition(dir)` | 触发幕布关闭动画，启动 RAF 循环 |
| 1469-1475 | `curtainLoop(now)` | RAF 循环: closing(1s)→closed(loading)→**检查 `pageReadyFlags[targetP]` + CURT_HOLD**→opening(1s) |
| 1476-1477 | 初始化 | 调用 curtResize+curtDraw，绑定 resize 事件 |

### 3.19 翠玉文庫文章系统 (子页面3) — 行 1479-1486
| 行号 | 函数/变量 | 作用 |
|------|----------|------|
| 1480 | `STATIC_CODEX` | 6篇内置 Persona 5 主题文章(翠玉文庫/绿色版) |
| 1481 | `codexState` | 文章列表状态 |
| 1482 | `renderCodexButtons()` | 渲染文章列表按钮(绿色主题) |
| 1483 | `openCodexArticle(id)` | 打开文章展开阅读器 |
| 1484 | `closeCodexReader()` | 关闭阅读器 |
| 1485 | `renderCodexContent(a)` | Markdown 渲染(绿色主题样式) |
| 1486 | `initCodex()` | 初始化 Codex + `setPageReady('codex')` |

### 3.20 反逆の画廊系统 (子页面4) — 行 1488-1495
| 行号 | 函数/变量 | 作用 |
|------|----------|------|
| 1489 | `GALLERY_IMAGES` | 8张 picsum 示例图片(反逆の画廊/黄色版) |
| 1490 | `galleryState` | 画廊状态(images, activeId, isOpen, mx/my, onCard, raf, entranceComplete) |
| 1491 | `renderGallery()` | 渲染2列胶片卡片网格 |
| 1492 | `openLightbox4(id)` | 打开3D灯箱(设置图片+标题，启动鼠标跟踪 RAF) |
| 1493 | `closeLightbox4()` | 关闭灯箱(停止RAF，移除active类) |
| 1494 | `updateTilt4()` | 3D 倾斜+光泽反射(鼠标驱动 perspective 旋转) |
| 1495 | `initGallery()` | 初始化画廊(渲染、绑定事件、键盘导航、鼠标追踪、`setPageReady('gallery')`) |

### 3.21 主初始化 — 行 1497-1503
| 行号 | 函数 | 作用 |
|------|------|------|
| 1498 | `initFadeIn()` | 淡入显示 appWrapper + 角度显示 + 滚动提示 |
| 1499 | `init()` | **总初始化**: buildButtons → applyScale → 所有 init* 函数 → initArchive → initCodex → initGallery → curtResize → 启动 RAF 动画循环 |
| 1500 | DOMContentLoaded | 等待 DOM 加载后执行 init() |
| 1502 | `window.OrbitalExperience` | **公开 API**: getButtons, getWrapper, getAngle, setTargetAngle, toggleMusic, isMusicPlaying, refreshScale, isSnapActive, hasScrolled, getCurrentPage, goToPersona, goToArchive, goToCodex, goToGallery, goToOrbital |

---

## 四、CSS 动画关键帧 (散落各处)

| 动画名 | 位置 | 作用 |
|--------|------|------|
| `wave-sweep` | 45 | 背景波浪 clip-path 扫描 |
| `disc-rotate` | 75 | 黑胶唱片旋转 |
| `btn-breathe` | 121 | 按钮琥珀色呼吸光晕 |
| `hint-appear/breathe/vanish` | 100-102 | 滚动提示出现/呼吸/消失 |
| `panelReveal` | 155 | 面板入场(上移+缩放) |
| `slashIn` | 156 | 斜线宽度展开 |
| `diamondSpin` | 169 | 菱形旋转入场 |
| `floatUpDown` | 188 | 浮动上下 |
| `pulseRed` | 200 | 红色脉冲光晕 |
| `confidantSpin` | 227 | 五角星旋转(b1) |
| `diamondSpinBlue` | 294 | 蓝色菱形旋转(b2) |
| `borderGlow` | 384 | 蓝色边框发光(b2) |
| `readerSlideIn` | 450 | 阅读器滑入 |
| `polkaDrift/G3/G4` | 各段 | 波尔卡圆点漂移 |
| `borderGlowGreen` | 622 | 绿色边框发光(b3) |
| `pulseYellow` | 807 | 黄色脉冲光晕(b4) |
| `filmPopIn` | 812 | 胶片卡片弹入(b4) |
| `loadStarSpin` | 985 | 幕布加载星形旋转(b3) |
| `loadTextPulse` | 990 | 幕布加载文字脉冲(b3) |
| `loadDotBounce` | 995 | 幕布加载圆点弹跳(b3) |
| `sparkFade` | 1504 | 火花粒子淡出 |

---

## 五、文件依赖关系

```
orbital-buttons.html
├── back.png                    (背景图)
├── top.webm                    (装饰视频)
├── but1.png ~ but4.png         (4个轨道按钮图片)
├── branch4/first.png           (对角线过渡碰撞图1)
├── branch4/second.png          (对角线过渡碰撞图2)
├── BLU-SWING - Fabulous.mp3    (BGM)
├── Google Fonts CDN            (6种字体)
├── GSAP 3.12.5 CDN             (动画引擎)
└── Marked.js CDN               (Markdown解析)
```

---

## 六、按钮→过渡→子页面映射

| 按钮 | dataId | 轨道角度 | 过渡动画 | 来源文件 | 子页面 | 颜色主题 |
|------|--------|---------|----------|----------|--------|----------|
| but1 | 4 | 270° (顶) | 水面潮汐 (Canvas) | branch1 | Persona | 红色 |
| but2 | 3 | 180° (左) | Pop 柱状 (CSS+GSAP) | branch2 | Archive/怪盗文庫 | 蓝色 |
| but3 | 2 | 90° (底) | 幕布 (Canvas) | branch3 | 翠玉文庫/Codex | 绿色 |
| but4 | 1 | 0° (右) | 对角线水面 (SVG+GSAP) | branch4 | 反逆の画廊/Gallery | 黄色 |

---

## 七、过渡流程统一模式

所有4个过渡均遵循相同模式：

```
[触发] → [覆盖屏幕] → [切换子页面] → [等待 pageReadyFlags + 最小等待时间] → [揭开屏幕]
```

| 过渡 | 覆盖方式 | 最小等待 | 页面就绪检查位置 | 揭开方式 |
|------|---------|---------|-----------------|---------|
| 水面(红) | Canvas 红色水块上升 | 600ms | `updateWaterTransition` holding 阶段 | 水块下降 |
| Pop(蓝) | CSS 柱状条覆盖 | 0ms | `triggerPopTransition` await waitForPageReady | 柱状条移出 |
| 幕布(绿) | Canvas 幕布关闭 | 1200ms | `curtainLoop` closed 阶段 | 幕布打开 |
| 对角(黄) | SVG 水圆+图片碰撞 | 0ms | `triggerDiagTransition` onComplete waitForPageReady | 反向水圆+图片退出 |
