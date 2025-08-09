/**
 * Navbar Component Controller
 * Handles navigation bar functionality and interactions
 */

import { showFeedback } from '../../assets/js/utils.js';

/**
 * Navbar Controller Class
 */
class NavbarController {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  /**
   * Initialize navbar functionality
   */
  init() {
    if (this.isInitialized) return;
    
    this.bindEvents();
    this.isInitialized = true;
    console.log('Navbar controller initialized');
  }

  /**
   * Bind event listeners to navbar elements
   */
  bindEvents() {
    // Back button
    const backBtn = document.querySelector('.navbar-back');
    if (backBtn) {
      // Remove any existing onclick attribute
      backBtn.removeAttribute('onclick');
      backBtn.addEventListener('click', this.goBack.bind(this));
    }

    // More options button
    const moreBtns = document.querySelectorAll('.capsule-btn');
    moreBtns.forEach(btn => {
      const onclick = btn.getAttribute('onclick');
      if (onclick && onclick.includes('showMoreOptions')) {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', this.showMoreOptions.bind(this));
      } else if (onclick && onclick.includes('closeApp')) {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', this.closeApp.bind(this));
      }
    });
  }

  /**
   * Handle back navigation
   */
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback for when there's no history
      window.location.href = '/';
    }
  }

  /**
   * Show more options menu
   */
  showMoreOptions() {
    // Remove existing menu if present
    const existingMenu = document.getElementById('more-options-menu');
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    // Create options menu
    const options = [
      { text: '分享给朋友', icon: 'fas fa-share', action: () => this.shareToFriend() },
      { text: '添加到收藏', icon: 'fas fa-star', action: () => this.addToFavorites() },
      { text: '举报内容', icon: 'fas fa-flag', action: () => this.reportContent() },
      { text: '设置', icon: 'fas fa-cog', action: () => this.openSettings() }
    ];

    const menu = this.createOptionsMenu(options);
    document.body.appendChild(menu);

    // Close menu when clicking outside
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
          menu.remove();
        }
      }, { once: true });
    }, 100);
  }

  /**
   * Create options menu element
   * @param {Array} options - Array of option objects
   * @returns {HTMLElement} The menu element
   */
  createOptionsMenu(options) {
    const menu = document.createElement('div');
    menu.id = 'more-options-menu';
    menu.style.cssText = `
      position: fixed;
      top: 60px;
      right: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      z-index: 1000;
      min-width: 160px;
      overflow: hidden;
      border: 1px solid #E5E7EB;
    `;

    options.forEach((option, index) => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: ${index < options.length - 1 ? '1px solid #F3F4F6' : 'none'};
      `;
      
      item.innerHTML = `
        <i class="${option.icon}" style="width: 16px; color: #6B7280;"></i>
        <span style="color: #374151; font-size: 14px;">${option.text}</span>
      `;

      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#F9FAFB';
      });

      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
      });

      item.addEventListener('click', () => {
        option.action();
        menu.remove();
      });

      menu.appendChild(item);
    });

    return menu;
  }

  /**
   * Close the application
   */
  closeApp() {
    if (confirm('确定要关闭当前页面吗？')) {
      // In a WeChat mini-program, this would call wx.navigateBack() or wx.exitMiniProgram()
      // For web, we can close the window if it was opened by script, otherwise go back
      if (window.opener) {
        window.close();
      } else {
        window.history.back();
      }
    }
  }

  /**
   * Share to friend functionality
   */
  shareToFriend() {
    // In a real WeChat mini-program, this would call wx.shareAppMessage()
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: '查看这个有趣的讨论',
        url: window.location.href
      }).then(() => {
        showFeedback('分享成功！', 'success');
      }).catch((error) => {
        console.error('分享失败:', error);
        this.fallbackShare();
      });
    } else {
      this.fallbackShare();
    }
  }

  /**
   * Fallback share method
   */
  fallbackShare() {
    // Copy URL to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showFeedback('链接已复制到剪贴板', 'success');
      }).catch(() => {
        showFeedback('分享功能暂不可用', 'error');
      });
    } else {
      showFeedback('分享功能暂不可用', 'error');
    }
  }

  /**
   * Add to favorites functionality
   */
  addToFavorites() {
    try {
      // In a real application, this would save to user's favorites list
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const currentPage = {
        title: document.title,
        url: window.location.href,
        timestamp: Date.now()
      };

      // Check if already in favorites
      const exists = favorites.some(fav => fav.url === currentPage.url);
      if (exists) {
        showFeedback('已经在收藏夹中了', 'info');
        return;
      }

      favorites.push(currentPage);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      showFeedback('已添加到收藏夹', 'success');
    } catch (error) {
      console.error('添加收藏失败:', error);
      showFeedback('添加收藏失败', 'error');
    }
  }

  /**
   * Report content functionality
   */
  reportContent() {
    const reason = prompt('请输入举报原因：');
    if (reason && reason.trim()) {
      // In a real application, this would send the report to the backend
      console.log('举报内容:', reason);
      showFeedback('举报已提交，感谢您的反馈', 'success');
    }
  }

  /**
   * Open settings page
   */
  openSettings() {
    showFeedback('设置功能开发中', 'info');
    // In a real application, this would navigate to settings page
    // window.location.href = '/settings';
  }

  /**
   * Destroy the controller and clean up event listeners
   */
  destroy() {
    // Remove any created menus
    const menu = document.getElementById('more-options-menu');
    if (menu) {
      menu.remove();
    }
    
    this.isInitialized = false;
    console.log('Navbar controller destroyed');
  }
}

/**
 * Load navbar component HTML
 * @param {string} containerId - ID of the container element
 * @returns {Promise<boolean>} Success status
 */
export async function loadNavbarComponent(containerId = 'navbar-container') {
  try {
    const response = await fetch('./components/navbar/navbar.html');
    if (!response.ok) {
      throw new Error(`Failed to load navbar component: ${response.status}`);
    }
    
    const html = await response.text();
    const container = document.getElementById(containerId);
    
    if (!container) {
      throw new Error(`Container element with ID '${containerId}' not found`);
    }
    
    container.innerHTML = html;
    
    // Initialize the navbar controller after loading HTML
    const controller = new NavbarController();
    
    // Make NavbarController methods available globally for HTML onclick handlers
    window.NavbarController = {
      goBack: () => controller.goBack(),
      showMoreOptions: () => controller.showMoreOptions(),
      closeApp: () => controller.closeApp(),
      shareToFriend: () => controller.shareToFriend(),
      addToFavorites: () => controller.addToFavorites(),
      reportContent: () => controller.reportContent(),
      openSettings: () => controller.openSettings()
    };
    
    console.log('Navbar component loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading navbar component:', error);
    
    // Fallback: create basic navbar structure
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="navbar">
          <div class="navbar-back" role="button" tabindex="0" aria-label="返回上一页">
            <i class="fas fa-chevron-left icon-md"></i>
          </div>
          <div class="navbar-title td-text-primary">议事详情</div>
          <div class="navbar-capsule">
            <button class="capsule-btn" title="更多选项" aria-label="显示更多选项">
              <i class="fas fa-ellipsis-h icon-sm"></i>
            </button>
            <div class="capsule-divider"></div>
            <button class="capsule-btn" title="关闭页面" aria-label="关闭当前页面">
              <i class="fas fa-times icon-sm"></i>
            </button>
          </div>
        </div>
      `;
      
      // Initialize controller with fallback HTML
      const controller = new NavbarController();
      
      // Make methods available globally even in fallback mode
      window.NavbarController = {
        goBack: () => controller.goBack(),
        showMoreOptions: () => controller.showMoreOptions(),
        closeApp: () => controller.closeApp(),
        shareToFriend: () => controller.shareToFriend(),
        addToFavorites: () => controller.addToFavorites(),
        reportContent: () => controller.reportContent(),
        openSettings: () => controller.openSettings()
      };
    }
    
    return false;
  }
}

// Export the controller class and create a singleton instance
export { NavbarController };

// Create and export a singleton instance for backward compatibility
export const navbarController = new NavbarController();

// Export individual functions for backward compatibility
export const showMoreOptions = () => navbarController.showMoreOptions();
export const closeApp = () => navbarController.closeApp();
export const shareToFriend = () => navbarController.shareToFriend();
export const addToFavorites = () => navbarController.addToFavorites();
export const reportContent = () => navbarController.reportContent();
export const openSettings = () => navbarController.openSettings();