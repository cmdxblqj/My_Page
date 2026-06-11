
---

# 🎨 波普风格网页过渡动画实现指导手册

## 一、 动画流程梳理 (Animation Flow)

整个过渡动画是一个**状态机驱动**的过程，分为 5 个明确阶段，确保在页面跳转的“黑盒期”提供极佳的视觉体验：

1. **潜伏期 (Idle)**：正常浏览状态，动画容器完全隐藏（`display: none` 或 `visibility: hidden`），不占用渲染资源，不干扰当前页面。
2. **触发与覆盖期 (Enter & Cover, 约 0.6s)**：
   - 用户触发跳转瞬间，动画容器显现。
   - 屏幕顶部生成一排紧密排列的垂直条状图形（底部为半圆）。
   - **核心动效**：从左至右，每个条状图形依次向下“生长”延伸。上方固定，下方半圆向下移动，延伸部分填充同色蓝色，最终在 1 秒内完全覆盖整个屏幕。
3. **等待期 (Hold)**：屏幕被高饱和度蓝色色块完全覆盖。动画在此暂停，等待下一个页面的核心 DOM/资源加载完成 (Promise resolved)。
4. **退场期 (Exit, 约 0.4s)**：
   - 新页面加载就绪。
   - 覆盖层以“从上往下收起”的方式收缩（高度从 100vh 缩减至 0，锚点在顶部），最终从屏幕下方完全消失，露出新页面。
5. **返回倒放期 (Reverse)**：
   - 从页面 2 返回页面 1 时，触发完全对称的逆向动画：蓝色条状从下往上生长覆盖屏幕 -> 等待页面 1 就绪 -> 从下往上收缩消失。

---

## 二、 技术栈推荐

为实现精准的“依次延迟”、“加载等待”和“完美倒放”，纯 CSS 难以胜任复杂的状态控制。推荐以下技术组合：

- **核心动画引擎**：**GSAP (GreenSock Animation Platform)**。其 `Timeline` 功能完美支持 `stagger`（交错动画）、`pause()`（等待加载）和 `reverse()`（倒放）。
- **路由控制**：
  - 若为 **SPA (Vue/React)**：使用 Vue Router 的 `beforeEach` / React Router 的拦截器，结合 GSAP Timeline。
  - 若为 **MPA (多页应用)**：推荐使用 **Barba.js**，它专为页面间的无缝过渡动画设计，可轻松拦截页面切换并执行 GSAP 动画。
- **样式预处理**：Sass/Less 或原生 CSS Variables (便于动态生成错落颜色)。

---

## 三、 艺术风格规范 (Pop Art Style Guide)

- **色彩 (Color)**：高饱和度、高明度的蓝色系。**拒绝线性渐变**，采用随机打乱的纯色块拼接，制造波普艺术特有的视觉冲击力。
  - 推荐色值池：`#0000FF` (纯蓝), `#0044FF`, `#0088FF`, `#0022CC`, `#3366FF`, `#0055DD`。
- **形状 (Shape)**：垂直矩形，底部为完美的半圆。
  - 实现方式：`border-radius: 0 0 50% 50%` 或 `clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)`。
- **边缘 (Edge)**：**无粗线条、无描边 (No thick borders)**。保持极致的扁平化 (Flat Design)，色块之间紧密贴合 (`gap: 0`)。
- **节奏 (Timing)**：使用 `power2.inOut` 或 `elastic.out` 缓动函数，赋予波普风格特有的弹性和活力，但总时长严格控制在 1 秒以内。

---

## 四、 步骤式实现指南 (Step-by-Step)

### Step 1: DOM 结构设计
在 `body` 的最外层（所有页面共享的层级）创建动画遮罩容器。

```html
<!-- 过渡动画容器，初始隐藏 -->
<div id="pop-transition-overlay" class="pop-overlay">
  <!-- 将通过 JS 动态生成 12 个柱子，以适应不同屏幕宽度 -->
  <!-- <div class="pop-column" style="--col-color: #0044FF;"></div> -->
</div>
```

### Step 2: CSS 样式定义
使用 CSS 变量控制颜色，确保初始状态绝对隐藏在屏幕上方之外。

```css
.pop-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  z-index: 9999;
  visibility: hidden; /* 初始不渲染，不干扰点击 */
  pointer-events: none;
}

.pop-overlay.active {
  visibility: visible;
  pointer-events: auto;
}

.pop-column {
  flex: 1; /* 均分屏幕宽度 */
  height: 0%; /* 初始高度为 0 */
  background-color: var(--col-color);
  border-radius: 0 0 50% 50%; /* 底部半圆 */
  transform-origin: top center; /* 关键：确保从上往下生长和从上往下收起 */
  will-change: height, transform;
}
```

### Step 3: 核心动画逻辑 (GSAP 实现)
这是整个需求的灵魂。我们将动画封装为一个可复用的类或函数，支持正向和反向。

```javascript
import { gsap } from "gsap";

class PopTransition {
  constructor() {
    this.overlay = document.getElementById('pop-transition-overlay');
    this.columns = [];
    this.isReverse = false; // 标记是否为返回动画
    this.initColumns();
  }

  // 初始化 12 个柱子，并赋予随机高饱和蓝色
  initColumns() {
    const colors = ['#0000FF', '#0044FF', '#0088FF', '#0022CC', '#3366FF', '#0055DD', '#0033AA', '#1155FF'];
    this.overlay.innerHTML = '';
    
    for (let i = 0; i < 12; i++) {
      const col = document.createElement('div');
      col.className = 'pop-column';
      // 随机取色，避免从深到浅的规律渐变
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      col.style.setProperty('--col-color', randomColor);
      this.overlay.appendChild(col);
      this.columns.push(col);
    }
  }

  // 核心：执行过渡动画 (返回一个 Promise，resolve 时代表动画结束，可以切换路由)
  async play(isReverse = false) {
    this.isReverse = isReverse;
    this.overlay.classList.add('active');
    
    // 重置初始状态
    gsap.set(this.columns, { 
      height: '0%', 
      scaleY: this.isReverse ? -1 : 1 // 倒放时从底部向上生长
    });

    const tl = gsap.timeline();

    // 1. 覆盖阶段 (Enter)：从左到右依次生长 (stagger)
    tl.to(this.columns, {
      height: '100%',
      duration: 0.6,
      stagger: {
        amount: 0.4, // 整体错落时间
        from: this.isReverse ? "end" : "start", // 正向从左到右，反向从右到左
        ease: "power2.inOut"
      },
      ease: "power2.inOut"
    });

    // 2. 等待阶段 (Hold)：暂停 Timeline，等待外部传入的页面加载 Promise
    tl.pause(); 
    
    return new Promise((resolve) => {
      this.resolveHold = resolve; // 暴露控制权给外部路由
    });
  }

  // 外部调用：页面已加载完成，执行退场动画
  finish() {
    const tl = gsap.timeline({
      onComplete: () => {
        this.overlay.classList.remove('active');
        this.resolveHold(); // 通知外部动画彻底结束
      }
    });

    // 3. 退场阶段 (Exit)：从上往下收起 (正向) 或 从下往上收起 (反向)
    tl.to(this.columns, {
      height: '0%',
      duration: 0.4,
      stagger: {
        amount: 0.2,
        from: this.isReverse ? "end" : "start",
        ease: "power2.in"
      },
      ease: "power2.in"
    });
  }
}

// 实例化全局过渡管理器
const pageTransition = new PopTransition();
```

### Step 4: 与路由系统对接 (以 Vue Router 为例)

在路由守卫中拦截跳转，串联动画与页面加载。

```javascript
router.beforeEach(async (to, from, next) => {
  // 判断是否为“返回”操作 (可根据 history.state 或自定义逻辑判断)
  const isBack = window.history.state?.back !== null; 
  
  // 1. 触发覆盖动画，并等待其完成 (约 0.6s)
  await pageTransition.play(isBack);

  // 2. 此时屏幕已被完全覆盖。执行实际的路由跳转和组件加载
  next();

  // 3. 等待 Vue 组件挂载完成 (或关键资源加载完成)
  await nextTick(); 
  // 若有大型资源，可在此处 await 特定的 load 事件

  // 4. 通知过渡管理器执行退场动画
  pageTransition.finish();
});
```
*(注：若使用 React，逻辑类似，在 `<Routes>` 外层包裹动画组件，利用 `useNavigate` 的拦截或 Suspense 边界来触发 `play` 和 `finish`)*

---

## 五、 关键细节与避坑指南

1. **“上方依次拓展也成蓝色”的实现原理**：
   - 不要尝试去移动半圆并动态绘制矩形，这在 Web 中性能极差。
   - **最佳实践**：直接让包含半圆的整个 `div` 的 `height` 从 `0%` 动画到 `100%`，并设置 `transform-origin: top center`。视觉上，这完美等价于“顶部固定，下方半圆带着颜色向下延伸拓展”。
2. **严格避免未跳转时出现**：
   - 必须使用 `visibility: hidden` 配合 `pointer-events: none`，而不是单纯的 `opacity: 0`。`visibility: hidden` 确保元素不参与布局和鼠标事件拦截。
3. **性能优化 (Will-Change)**：
   - 动画仅改变 `height` 或 `transform`。对于 12 个柱子，现代浏览器可轻松保持 60fps。已添加 `will-change: height` 提示浏览器提升图层。
4. **响应式适配**：
   - 柱子的数量（示例中为 12）可根据屏幕宽度动态计算：`Math.ceil(window.innerWidth / 100)`，确保在移动端和超宽屏上都能保持“紧挨着的条状”视觉比例，半圆不会因过宽而变形。
5. **倒放逻辑的严谨性**：
   - 返回时，通过 `isReverse` 标记，将 `stagger.from` 设为 `"end"`（从右到左），并将初始 `scaleY` 设为 `-1`（从底部向上生长），完美实现用户要求的“之前的倒放，效果一样”。

---

## 六、 验收 Checklist

- [ ] 触发跳转时，动画瞬间出现，无闪烁。
- [ ] 蓝色条状从左到右依次向下延伸，底部保持完美半圆，无粗边框。
- [ ] 颜色为高饱和度蓝色，且相邻柱子颜色深浅错落，无明显渐变规律。
- [ ] 屏幕被完全覆盖后，动画停止，等待新页面内容。
- [ ] 新页面加载完成后，蓝色条状从上往下平滑收缩消失。
- [ ] 点击浏览器“后退”按钮时，动画以从下往上覆盖、再从下往上收缩的倒放形式完美呈现。
- [ ] 在动画播放期间，无法点击底层页面的任何元素（`pointer-events` 生效）。

