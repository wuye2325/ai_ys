# Navbar Capsule 容器组件文档

## 概述

`navbar-capsule` 是一个遵循微信小程序设计规范的胶囊按钮容器组件，用于在导航栏右侧提供更多选项和关闭功能。该组件采用TDesign设计系统的样式规范。

## HTML 结构

```html
<div class="navbar-capsule">
  <button class="capsule-btn" onclick="showMoreOptions()" title="更多选项" aria-label="显示更多选项">
    <i class="fas fa-ellipsis-h" style="font-size: 14px;"></i>
  </button>
  <div class="capsule-divider"></div>
  <button class="capsule-btn" onclick="closeApp()" title="关闭页面" aria-label="关闭当前页面">
    <i class="fas fa-times" style="font-size: 14px;"></i>
  </button>
</div>
```

### 结构说明

- **navbar-capsule**: 胶囊容器，包含两个按钮和一个分割线
- **capsule-btn**: 胶囊按钮，用于承载具体功能
- **capsule-divider**: 分割线，用于分隔两个按钮
- **Font Awesome 图标**: 使用 `fa-ellipsis-h` (更多选项) 和 `fa-times` (关闭) 图标

## CSS 样式

```css
/* TDesign胶囊按钮容器 - 遵循微信小程序设计规范 */
.navbar-capsule {
    display: flex;
    align-items: center;
    background: var(--td-bg-color-container-hover);
    border-radius: var(--td-spacing-l);
    height: 32px;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--td-border-color);
    box-shadow: var(--td-shadow-1);
    transition: var(--td-transition-fast);
}

/* TDesign胶囊按钮 */
.capsule-btn {
    width: 40px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--td-text-color-primary);
    cursor: pointer;
    transition: var(--td-transition-fast);
    border: none;
    background: transparent;
    font-size: var(--td-font-size-base);
    border-radius: 0;
}

.capsule-btn:active {
    background: var(--td-brand-color-light);
    color: var(--td-brand-color);
    transform: scale(0.95);
}

/* TDesign胶囊分割线 */
.capsule-divider {
    width: 1px;
    height: 18px;
    background: var(--td-border-color);
    margin: 0;
    transition: var(--td-transition-fast);
}
```

### 样式特点

- 使用TDesign设计系统的CSS变量
- 遵循微信小程序胶囊按钮的视觉规范
- 支持按压反馈效果（缩放动画）
- 响应式设计，适配不同屏幕尺寸

## JavaScript 功能

### 主要函数

#### 1. showMoreOptions() - 显示更多选项

```javascript
/**
 * 显示更多选项菜单
 * 微信小程序胶囊按钮 - 更多功能
 */
function showMoreOptions() {
  // 创建选项菜单
  const options = [
    { text: '分享给朋友', icon: 'fas fa-share', action: () => shareToFriend() },
    { text: '收藏', icon: 'fas fa-star', action: () => addToFavorites() },
    { text: '举报', icon: 'fas fa-flag', action: () => reportContent() },
    { text: '设置', icon: 'fas fa-cog', action: () => openSettings() }
  ];
  
  // 显示选项菜单（这里可以实现一个弹出菜单）
  const menuText = options.map(opt => opt.text).join('\n');
  const choice = prompt('请选择操作：\n' + menuText);
  
  const selectedOption = options.find(opt => opt.text === choice);
  if (selectedOption) {
    selectedOption.action();
  }
}
```

#### 2. closeApp() - 关闭应用

```javascript
/**
 * 关闭应用
 * 微信小程序胶囊按钮 - 关闭功能
 */
function closeApp() {
  if (confirm('确定要关闭当前页面吗？')) {
    // 在微信小程序中，这里会调用 wx.navigateBack() 或 wx.exitMiniProgram()
    // 在网页中，我们使用 window.close() 或返回上一页
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  }
}
```

### 辅助功能函数

#### 3. shareToFriend() - 分享给朋友

```javascript
/**
 * 分享给朋友功能
 */
function shareToFriend() {
  // 在实际微信小程序中，这里会调用 wx.shareAppMessage()
  if (navigator.share) {
    navigator.share({
      title: '业主委员会津贴标准与权责分配讨论',
      text: '参与社区议事，共建美好家园',
      url: window.location.href
    });
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('链接已复制到剪贴板');
    });
  }
}
```

#### 4. addToFavorites() - 添加到收藏

```javascript
/**
 * 添加到收藏功能
 */
function addToFavorites() {
  // 在实际应用中，这里会保存到用户的收藏列表
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const currentPage = {
    title: '业主委员会津贴标准与权责分配讨论',
    url: window.location.href,
    timestamp: Date.now()
  };
  
  if (!favorites.find(item => item.url === currentPage.url)) {
    favorites.push(currentPage);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('已添加到收藏');
  } else {
    alert('已经在收藏中了');
  }
}
```

#### 5. reportContent() - 举报内容

```javascript
/**
 * 举报内容功能
 */
function reportContent() {
  const reason = prompt('请输入举报原因：');
  if (reason && reason.trim()) {
    // 在实际应用中，这里会发送举报信息到服务器
    console.log('举报原因：', reason);
    alert('举报已提交，感谢您的反馈');
  }
}
```

#### 6. openSettings() - 打开设置

```javascript
/**
 * 打开设置页面
 */
function openSettings() {
  alert('设置功能开发中');
}
```

## 使用说明

### 1. 依赖项

- **Font Awesome**: 用于图标显示
- **TDesign CSS变量**: 用于样式主题

### 2. 集成步骤

1. 引入Font Awesome CSS文件
2. 确保TDesign CSS变量已定义
3. 将HTML结构添加到导航栏
4. 引入CSS样式
5. 添加JavaScript功能函数

### 3. 自定义配置

- 可以修改 `showMoreOptions()` 中的选项菜单内容
- 可以自定义按钮图标和样式
- 可以调整胶囊容器的尺寸和颜色

## 设计规范

### 视觉规范

- **容器高度**: 32px
- **按钮宽度**: 40px
- **分割线宽度**: 1px，高度18px
- **圆角**: 使用TDesign的 `--td-spacing-l` 变量
- **颜色**: 遵循TDesign色彩规范

### 交互规范

- **按压反馈**: 按钮按下时缩放至95%
- **悬停效果**: 使用TDesign的过渡动画
- **无障碍**: 提供 `title` 和 `aria-label` 属性

## 兼容性

- **浏览器**: 支持现代浏览器（Chrome、Firefox、Safari、Edge）
- **移动端**: 支持iOS Safari和Android Chrome
- **微信小程序**: 可适配微信小程序环境（需要调整API调用）

## 注意事项

1. 在微信小程序环境中，需要将相关Web API替换为小程序API
2. 确保TDesign CSS变量已正确定义
3. 图标文件路径需要根据实际项目结构调整
4. 建议在生产环境中使用更完善的弹出菜单组件替代 `prompt()` 和 `alert()`

## 扩展建议

1. **弹出菜单优化**: 使用更美观的弹出菜单组件
2. **动画效果**: 添加更丰富的过渡动画
3. **主题切换**: 支持深色模式
4. **国际化**: 支持多语言文本
5. **权限控制**: 根据用户权限显示不同的菜单选项