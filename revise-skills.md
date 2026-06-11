
---

# 🚀 前端项目重构与视觉升级需求文档

## 一、 核心目标
对现有项目进行视觉与交互重构，实现 **1920×1080 固定比例的全屏响应式适配**，移除冗余样式，引入多层级视觉元素（背景图、不规则透明按钮、顶层视频、背景音乐），并保证交互的精准性与动画的流畅度。

## 二、 技术栈建议
- **核心**：HTML5, CSS3 (Flexbox/Grid, Animations, Transforms), Vanilla JavaScript (ES6+)
- **构建工具**（可选）：Vite / Webpack (便于处理静态资源压缩与路径管理)
- **资源格式要求**：背景图 (JPG/WebP), 按钮图 (PNG-24 带 Alpha 透明通道), 顶层视频 (WebM), 音频 (MP3/AAC)

---

## 三、 标准化执行流程与详细要求

### 1. 按钮 DOM 结构重组
- **任务描述**：将原项目中的按钮排序倒转，并仅保留 4 个按钮。
- **实现方案**：
  - 使用 JavaScript 获取原按钮容器内的所有按钮节点。
  - 过滤出需要保留的 4 个目标按钮（建议通过 `data-id` 或特定 `class` 标识）。
  - 使用 `Array.prototype.reverse()` 反转节点顺序，并重新 `appendChild` 到容器中。
- **补充说明**：需在代码中明确注释这 4 个按钮的业务逻辑映射关系，防止倒转后事件绑定错乱。

### 2. 样式重置 (CSS Reset)
- **任务描述**：去除原有背景颜色、按钮样式及按钮上的字样。
- **实现方案**：
  - 为目标按钮添加专属类名（如 `.btn-reset`）。
  - 设置：`background: transparent !important; border: none; color: transparent; text-indent: -9999px; box-shadow: none; outline: none;`
- **补充说明**：使用 `!important` 或更高权重的 CSS 选择器，确保彻底覆盖原有框架（如 Bootstrap/Tailwind）的默认样式。

### 3. 底层背景与全局缩放适配系统
- **任务描述**：底层添加 1920×1080 背景图（"C:\Users\LQJ\Desktop\新建文件夹 (3)\back.png"），限制小窗尺寸，所有元素根据窗口缩放进行等比适配。
- **实现方案**：
  - **不推荐使用**单纯的 `vw/vh` 或 `background-size: cover`，因为这会导致元素相对比例失调。
  - **推荐方案（Transform Scale 适配）**：
    1. 创建一个全局包裹容器 `.app-wrapper`，固定尺寸 `width: 1920px; height: 1080px;`。
    2. 底层背景设为该容器的 `background-image`，`background-size: cover`。
    3. 使用 JS 监听 `window.resize`，计算缩放比：`scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)`。
    4. 将 `transform: scale(${scale})` 应用于 `.app-wrapper`，并设置 `transform-origin: center center`。
- **补充说明**：此方案可完美保证 1920×1080 设计稿在任何屏幕（包括小窗）下均等比缩放，无滚动条，且内部所有绝对定位元素（如 150×150 的按钮）相对位置永不偏移。

### 4. 按钮视觉重构与不规则点击区域限制
- **任务描述**：4 个按钮（"C:\Users\LQJ\Desktop\新建文件夹 (3)\but1.png" "C:\Users\LQJ\Desktop\新建文件夹 (3)\but2.png" "C:\Users\LQJ\Desktop\新建文件夹 (3)\but3.png" "C:\Users\LQJ\Desktop\新建文件夹 (3)\but4.png"）赋予 800×800 PNG 样式，在 1920×1080 坐标系下显示为 150×150。限制点击区间仅为有色区域，保留点击时的边缘阴影及旋转淡入淡出效果。
- **实现方案**：
  - **尺寸**：CSS 设置 `width: 150px; height: 150px; background-size: contain; background-repeat: no-repeat;`。
  - **不规则点击限制（核心难点）**：纯 CSS 对 PNG 透明区域点击限制支持不佳。**推荐使用 SVG 方案**：
    ```html
    <svg width="150" height="150" style="pointer-events: visiblePainted;">
      <image href="button1.png" width="150" height="150" />
    </svg>
    ```
    *注：`pointer-events: visiblePainted` 会使得只有 SVG 图像中非透明的像素区域才能触发鼠标事件，完美解决透明区域穿透问题。*
  - **动画效果**：
    - 边缘阴影：`filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));` (注意使用 `drop-shadow` 而非 `box-shadow`，以贴合不规则 PNG 形状)。
    - 旋转与淡入淡出：使用 CSS `@keyframes` 结合 `opacity` 和 `transform: rotate()`，在 hover 或特定状态触发，并设置 `transition: all 0.3s ease`。

### 5. 顶层 WebM 视频覆盖
- **任务描述**：最上层添加 1920×1080 WebM 视频（"C:\Users\LQJ\Desktop\新建文件夹 (3)\top.webm"），无限循环播放，全屏适配，且不影响中层按键交互。
- **实现方案**：
  - HTML: `<video class="top-video" src="[地址]" autoplay loop muted playsinline></video>`
  - CSS: 
    ```css
    .top-video {
      position: absolute;
      top: 0; left: 0;
      width: 1920px; height: 1080px; /* 随 wrapper 缩放 */
      object-fit: cover;
      pointer-events: none; /* 核心：允许鼠标事件穿透视频层，直达下方按钮 */
      z-index: 100;
    }
    ```
- **补充说明**：**必须包含 `muted` 属性**，否则现代浏览器（Chrome/Safari）会拦截 `autoplay`，导致视频无法自动播放。

### 6. 背景音乐与极简唱片控制器
- **任务描述**：左上角添加极简唱片图标，点击控制背景音乐开关。
- **实现方案**：
  - HTML: 
    ```html
    <div class="music-control" id="musicToggle">
      <svg class="disc-icon">...</svg> <!-- 极简唱片 SVG -->
    </div>
    <audio id="bgMusic" loop>
      <!-- [地址] 导入背景音乐，此处留空占位 -->
      <!-- <source src="[音乐文件地址]" type="audio/mpeg"> -->
    </audio>
    ```
  - JS 逻辑：点击图标时，切换 `audio.paused` 状态。播放时给 `.disc-icon` 添加 `animation: rotate 4s linear infinite`，暂停时移除该动画（或设置 `animation-play-state: paused`）。
- **补充说明**：浏览器的 Autoplay Policy 禁止网页加载时自动播放有声媒体。因此，**必须依赖用户首次点击（即点击唱片图标）来触发 `audio.play()`**，这是符合规范的唯一可靠方式。

### 7. 全局淡入浮现效果
- **任务描述**：整个网站文件打开时呈现淡淡浮现的效果。
- **实现方案**：
  - CSS: `.app-wrapper { opacity: 0; transition: opacity 1.5s ease-in-out; }`
  - JS: 监听 `window.addEventListener('load', () => { document.querySelector('.app-wrapper').style.opacity = '1'; })`
- **补充说明**：使用 `load` 事件而非 `DOMContentLoaded`，确保背景图、视频首帧和音频元数据加载完毕后再开始淡入，避免闪烁或白屏。

---

## 四、 推荐目录结构
```text
project-root/
├── index.html
├── css/
│   └── style.css          # 包含重置样式、动画关键帧、缩放容器样式
├── js/
│   └── main.js            # 包含：DOM重组、缩放计算逻辑、音乐控制逻辑
├── assets/
│   ├── images/
│   │   ├── bg-1920x1080.jpg   # 底层背景
│   │   ├── btn-1.png          # 4个 800x800 按钮原图 (带透明通道)
│   │   ├── btn-2.png
│   │   ├── btn-3.png
│   │   ├── btn-4.png
│   │   └── icon-disc.svg      # 极简唱片图标
│   ├── video/
│   │   └── overlay.webm       # 顶层 1920x1080 视频
│   └── audio/
│       └── bgm.mp3            # 背景音乐 (占位)
```

---

## 五、 关键代码片段参考 (JS 缩放适配)

```javascript
// main.js
function handleResize() {
    const wrapper = document.querySelector('.app-wrapper');
    if (!wrapper) return;
    
    // 计算保持 16:9 比例的最佳缩放比
    const scaleX = window.innerWidth / 1920;
    const scaleY = window.innerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);
    
    // 应用缩放，保持居中
    wrapper.style.transform = `scale(${scale})`;
    
    // 可选：如果希望小窗时不出现滚动条，可配合 CSS overflow: hidden
}

window.addEventListener('resize', handleResize);
window.addEventListener('load', () => {
    handleResize();
    // 触发全局淡入
    document.querySelector('.app-wrapper').style.opacity = '1';
});
```

---

## 六、 测试与验收标准 (Checklist)
- [ ] 窗口缩小至 800×600 时，页面整体等比缩小，无滚动条，无元素错位。
- [ ] 按钮数量严格为 4 个，且顺序已反转，无原始文字和背景色残留。
- [ ] 鼠标悬停在按钮 PNG 的**透明区域**时，无点击反馈（cursor 不变，不触发 click）；悬停在**有色区域**时，正常触发点击及阴影/旋转动画。
- [ ] 顶层 WebM 视频正常无缝循环播放，且鼠标可以穿透视频点击下方的按钮。
- [ ] 首次点击左上角唱片图标，音乐正常播放且图标开始旋转；再次点击，音乐暂停且旋转停止。
- [ ] 刷新页面时，整体画面有平滑的淡入（Fade-in）视觉效果。


