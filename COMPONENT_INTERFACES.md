# 组件接口和使用指南

本文档提供了关于 HTML 重构项目的组件接口、使用模式和集成指南的详细信息。

## 组件接口标准

### 组件文件结构
每个组件必须遵循以下结构：
```
component-name/
├── component-name.html    # 模板文件
├── component-name.css     # 样式文件
└── component-name.js      # 逻辑文件
```

### 组件配置
组件在 `assets/js/main.js` 中配置：

```javascript
const COMPONENTS = {
  componentName: {
    containerId: 'component-container',     // 必需：DOM 容器 ID
    htmlPath: './components/path/file.html', // 必需：HTML 模板路径
    cssPath: './components/path/file.css',   // 可选：CSS 文件路径
    jsPath: './components/path/file.js',     // 可选：JS 文件路径
    required: true                           // 必需：组件是否关键
  }
};
```

## 组件接口

### 1. 导航栏组件

#### 用途
提供导航控件和应用级操作。

#### 容器
```html
<div id="navbar-container"></div>
```

#### 配置
```javascript
navbar: {
  containerId: 'navbar-container',
  htmlPath: './components/navbar/navbar.html',
  cssPath: './components/navbar/navbar.css',
  jsPath: './components/navbar/navbar.js',
  required: true
}
```

#### 公共方法
- `showMoreOptions()`: 显示更多菜单选项
- `closeApp()`: 处理应用关闭
- `navigateBack()`: 处理返回导航

#### 派发事件
- `navbar:optionsShown`: 当选项菜单显示时
- `navbar:backPressed`: 当按下返回按钮时

#### CSS 类
- `.navbar`: 主导航栏容器
- `.navbar-back`: 返回按钮
- `.navbar-title`: 标题文本
- `.navbar-actions`: 操作按钮容器

#### 降级行为
组件加载失败时显示具备基本功能的简单导航。

---

### 2. 讨论组件

#### 用途
管理讨论区显示和评论排序。

#### 容器
```html
<div id="discussion-container"></div>
```

#### 配置
```javascript
discussion: {
  containerId: 'discussion-container',
  htmlPath: './components/discussion/discussion-section.html',
  cssPath: './components/discussion/discussion-section.css',
  jsPath: './components/discussion/discussion-section.js',
  required: true
}
```

#### 公共方法
- `sortComments(criteria)`: 按指定条件排序评论
- `toggleView(viewType)`: 在不同视图模式间切换
- `refreshDiscussion()`: 重新加载讨论内容

#### 派发事件
- `discussion:sorted`: 当评论被排序时
- `discussion:viewChanged`: 当视图模式更改时

#### CSS 类
- `.discussion-section`: 主讨论区容器
- `.discussion-header`: 头部区域
- `.discussion-actions`: 操作按钮
- `.sort-controls`: 排序控件

#### 数据依赖
- 需要来自 `assets/data/comments.json` 的评论数据
- 与评论组件集成以进行显示

#### 降级行为
组件失败时显示具备基本功能的简单评论列表。

---

### 3. 评论组件

#### 用途
显示和管理单个评论及交互。

#### 容器
```html
<div id="comments-container"></div>
```

#### 配置
```javascript
comments: {
  containerId: 'comments-container',
  htmlPath: './components/comments/comment-list.html',
  cssPath: './components/comments/comments.css',
  jsPath: './components/comments/comments.js',
  required: true
}
```

#### 公共方法
- `toggleLike(commentId)`: 切换评论的点赞状态
- `toggleDislike(commentId)`: 切换评论的点踩状态
- `replyComment(commentId)`: 打开回复界面
- `toggleReplies(commentId)`: 显示/隐藏评论回复
- `sendFlower(commentId)`: 发送鲜花反应

#### 派发事件
- `comment:liked`: 当评论被点赞时
- `comment:disliked`: 当评论被点踩时
- `comment:replied`: 当提交回复时
- `comment:flowerSent`: 当发送鲜花时

#### CSS 类
- `.comment-item`: 单个评论容器
- `.comment-content`: 评论文本内容
- `.comment-actions`: 操作按钮
- `.comment-replies`: 回复容器
- `.comment-author`: 作者信息

#### 数据结构
```javascript
{
  id: "string",
  author: {
    name: "string",
    avatar: "string"
  },
  content: "string",
  timestamp: "string",
  likes: number,
  dislikes: number,
  replies: Array,
  tags: Array
}
```

#### 降级行为
组件加载失败时显示只读评论列表。

---

### 4. AI 助手组件

#### 用途
提供 AI 驱动的内容分析和建议。

#### 容器
```html
<div id="ai-assistant-container"></div>
```

#### 配置
```javascript
aiAssistant: {
  containerId: 'ai-assistant-container',
  htmlPath: './components/ai-assistant/ai-panel.html',
  cssPath: './components/ai-assistant/ai-panel.css',
  jsPath: './components/ai-assistant/ai-panel.js',
  required: false
}
```

#### 公共方法
- `toggleAIAssistant()`: 显示/隐藏 AI 面板
- `updateAIAnalysis()`: 刷新 AI 分析
- `generateSummary()`: 创建内容摘要
- `provideSuggestions()`: 获取 AI 建议

#### 派发事件
- `ai:panelToggled`: 当 AI 面板可见性更改时
- `ai:analysisUpdated`: 当分析刷新时
- `ai:summaryGenerated`: 当摘要创建时

#### CSS 类
- `.ai-assistant`: 主 AI 面板容器
- `.ai-content`: AI 生成的内容
- `.ai-controls`: 控制按钮
- `.ai-summary`: 摘要区域

#### 降级行为
组件加载失败时隐藏（非关键组件）。

## 组件加载生命周期

### 1. 初始化阶段
```javascript
// 组件加载器初始化
const componentLoader = new ComponentLoader();
await componentLoader.init();
```

### 2. 加载顺序
1. **验证**: 检查容器是否存在
2. **CSS 加载**: 加载样式表（非阻塞）
3. **HTML 加载**: 获取并注入模板
4. **JS 加载**: 加载并执行组件逻辑
5. **注册**: 在系统中注册组件
6. **事件派发**: 通知系统完成

### 3. 错误处理
```javascript
// 带降级方案的自动错误处理
try {
  await componentLoader.loadComponent('navbar', config);
} catch (error) {
  // 自动提供降级内容
  console.error('组件失败:', error);
}
```

## 集成模式

### 组件通信

#### 基于事件的通信
```javascript
// 派发自定义事件
document.dispatchEvent(new CustomEvent('component:action', {
  detail: { data: 'value' }
}));

// 监听事件
document.addEventListener('component:action', (event) => {
  console.log('收到:', event.detail);
});
```

#### 直接方法调用
```javascript
// 通过全局引用访问组件方法
if (window.NavbarController) {
  window.NavbarController.showMoreOptions();
}
```

### 数据管理

#### 加载数据
```javascript
// 使用数据管理器进行一致的数据加载
import { loadAndRenderAllContent } from './assets/js/data-manager.js';

await loadAndRenderAllContent();
```

#### 数据绑定
```javascript
// 将数据绑定到组件元素
function bindCommentData(comment, element) {
  element.querySelector('.comment-author').textContent = comment.author.name;
  element.querySelector('.comment-content').textContent = comment.content;
}
```

### 错误处理集成

#### 组件级错误处理
```javascript
// 使用错误处理器进行一致的错误管理
window.ErrorHandler?.safeAsync(async () => {
  // 组件操作
}, 'ComponentName', fallbackValue);
```

#### 日志集成
```javascript
// 使用日志记录器进行调试和监控
window.Logger?.info('ComponentName', '操作完成');
window.Logger?.error('ComponentName', '操作失败', error);
```

## 最佳实践

### 组件开发

1. **关注点分离**
   - 保持 HTML 语义化和可访问性
   - 仅使用 CSS 进行样式设计
   - 在 JavaScript 中处理逻辑

2. **错误弹性**
   - 始终包含错误处理
   - 提供有意义的降级方案
   - 记录错误以供调试

3. **性能**
   - 延迟加载非关键组件
   - 最小化 DOM 操作
   - 使用事件委托

4. **可访问性**
   - 包含 ARIA 属性
   - 支持键盘导航
   - 提供屏幕阅读器支持

### 集成指南

1. **一致的接口**
   - 遵循命名约定
   - 使用标准事件模式
   - 保持 API 一致性

2. **优雅降级**
   - 确保无 JavaScript 时核心功能正常工作
   - 提供降级内容
   - 处理缺失的依赖项

3. **测试**
   - 测试组件隔离
   - 验证集成点
   - 检查错误场景

## 调试和故障排除

### 组件状态检查
```javascript
// 检查组件加载状态
const stats = window.ComponentLoader.stats();
console.log('已加载组件:', stats);

// 检查特定组件
const isLoaded = window.ComponentLoader.instance.isComponentLoaded('navbar');
console.log('导航栏已加载:', isLoaded);
```

### 日志分析
```javascript
// 获取组件特定日志
const logs = window.Logger.getComponentLogs('ComponentName');
console.log('组件日志:', logs);

// 导出所有日志
const allLogs = window.Logger.exportLogs();
console.log('所有日志:', allLogs);
```

### 错误恢复
```javascript
// 重新加载失败的组件
await window.ComponentLoader.instance.reloadComponent('componentName');

// 重新加载所有组件
await window.ComponentLoader.reload();
```

## 迁移指南

### 添加新组件

1. **创建组件文件**
   ```bash
   mkdir components/new-component
   touch components/new-component/new-component.html
   touch components/new-component/new-component.css
   touch components/new-component/new-component.js
   ```

2. **添加配置**
   ```javascript
   // 在 assets/js/main.js 中
   const COMPONENTS = {
     // ... 现有组件
     newComponent: {
       containerId: 'new-component-container',
       htmlPath: './components/new-component/new-component.html',
       cssPath: './components/new-component/new-component.css',
       jsPath: './components/new-component/new-component.js',
       required: false
     }
   };
   ```

3. **在 HTML 中添加容器**
   ```html
   <!-- 在 index.html 中 -->
   <div id="new-component-container"></div>
   ```

### 修改现有组件

1. **更新组件文件**: 根据需要修改 HTML、CSS 或 JS
2. **测试集成**: 确保更改不会破坏其他组件
3. **更新文档**: 在本文档中反映更改
4. **测试错误场景**: 验证降级行为仍然有效

---

本文档作为组件接口和集成模式的权威指南。随着组件的演进，请保持文档更新。