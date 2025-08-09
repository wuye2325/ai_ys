/**
 * Discussion Section Controller
 * Handles discussion area functionality including sorting and filtering
 */

import { getLikesCount, getCommentTime } from '../../assets/js/utils.js';

/**
 * Discussion Section Controller Class
 */
class DiscussionController {
  constructor() {
    this.isInitialized = false;
    this.currentSortType = 'hot';
    this.init();
  }

  /**
   * Initialize discussion functionality
   */
  init() {
    if (this.isInitialized) return;
    
    this.bindEvents();
    this.isInitialized = true;
    console.log('Discussion controller initialized');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Sort buttons
    const sortButtons = document.querySelectorAll('[onclick*="sortComments"]');
    sortButtons.forEach(btn => {
      btn.removeAttribute('onclick');
      const sortType = this.getSortTypeFromButton(btn);
      if (sortType) {
        btn.addEventListener('click', () => this.sortComments(sortType));
      }
    });

    // Discussion toggle button
    const discussionBtn = document.querySelector('.discussion-btn');
    if (discussionBtn) {
      discussionBtn.addEventListener('click', (e) => {
        // Keep the original navigation behavior
        // This is just for potential future enhancements
      });
    }
  }

  /**
   * Get sort type from button element
   * @param {HTMLElement} button - The sort button
   * @returns {string|null} The sort type
   */
  getSortTypeFromButton(button) {
    if (button.id === 'sort-hot-tab') return 'hot';
    if (button.id === 'sort-time-desc') return 'time-desc';
    if (button.id === 'sort-time-asc') return 'time-asc';
    return null;
  }

  /**
   * Sort comments by specified type
   * @param {string} sortType - The sort type ('hot', 'time-desc', 'time-asc')
   */
  sortComments(sortType) {
    console.log('Sorting comments by:', sortType);
    
    // Update sort button states
    this.updateSortButtonStates(sortType);
    
    // Get all comment elements
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    const comments = Array.from(commentsList.querySelectorAll('.comment-item'));
    if (comments.length === 0) return;

    // Sort comments based on type
    let sortedComments;
    switch (sortType) {
      case 'hot':
        sortedComments = this.sortByHot(comments);
        break;
      case 'time-desc':
        sortedComments = this.sortByTimeDesc(comments);
        break;
      case 'time-asc':
        sortedComments = this.sortByTimeAsc(comments);
        break;
      default:
        sortedComments = comments;
    }

    // Re-append comments in sorted order
    sortedComments.forEach(comment => {
      commentsList.appendChild(comment);
    });

    this.currentSortType = sortType;
    
    // Add visual feedback
    this.showSortFeedback(sortType);
  }

  /**
   * Sort comments by hotness (likes - dislikes)
   * @param {Array} comments - Array of comment elements
   * @returns {Array} Sorted comments
   */
  sortByHot(comments) {
    return comments.sort((a, b) => {
      const scoreA = this.calculateHotScore(a);
      const scoreB = this.calculateHotScore(b);
      return scoreB - scoreA; // Descending order
    });
  }

  /**
   * Calculate hot score for a comment
   * @param {HTMLElement} comment - Comment element
   * @returns {number} Hot score
   */
  calculateHotScore(comment) {
    const likeActions = comment.querySelectorAll('.comment-action');
    let likes = 0;
    let dislikes = 0;

    likeActions.forEach(action => {
      const icon = action.querySelector('img');
      const countSpan = action.querySelector('span');
      const count = parseInt(countSpan?.textContent) || 0;

      if (icon && icon.alt === '点赞') {
        likes = count;
      } else if (icon && icon.alt === '点踩') {
        dislikes = count;
      }
    });

    // Hot score = likes - dislikes + time factor
    const timeFactor = this.getTimeFactor(comment);
    return likes - dislikes + timeFactor;
  }

  /**
   * Get time factor for hot score calculation
   * @param {HTMLElement} comment - Comment element
   * @returns {number} Time factor (newer comments get slight boost)
   */
  getTimeFactor(comment) {
    const timeElement = comment.querySelector('.comment-time');
    if (!timeElement) return 0;

    const timeText = timeElement.textContent.trim();
    const commentTime = new Date(timeText).getTime();
    const now = Date.now();
    const hoursSinceComment = (now - commentTime) / (1000 * 60 * 60);

    // Newer comments get a small boost (max 2 points, decaying over 24 hours)
    return Math.max(0, 2 - (hoursSinceComment / 12));
  }

  /**
   * Sort comments by time (newest first)
   * @param {Array} comments - Array of comment elements
   * @returns {Array} Sorted comments
   */
  sortByTimeDesc(comments) {
    return comments.sort((a, b) => {
      const timeA = getCommentTime(a);
      const timeB = getCommentTime(b);
      return timeB - timeA; // Descending order (newest first)
    });
  }

  /**
   * Sort comments by time (oldest first)
   * @param {Array} comments - Array of comment elements
   * @returns {Array} Sorted comments
   */
  sortByTimeAsc(comments) {
    return comments.sort((a, b) => {
      const timeA = getCommentTime(a);
      const timeB = getCommentTime(b);
      return timeA - timeB; // Ascending order (oldest first)
    });
  }

  /**
   * Update sort button states
   * @param {string} activeType - The active sort type
   */
  updateSortButtonStates(activeType) {
    const hotTab = document.getElementById('sort-hot-tab');
    const timeTab = document.getElementById('sort-time-tab');
    const timeDescTab = document.getElementById('sort-time-desc');
    const timeAscTab = document.getElementById('sort-time-asc');

    // Reset all tab states
    [hotTab, timeTab, timeDescTab, timeAscTab].forEach(tab => {
      if (tab) {
        tab.setAttribute('data-state', 'inactive');
        tab.setAttribute('aria-selected', 'false');
        tab.classList.remove('active');
      }
    });

    // Set active tab
    let activeTab;
    switch (activeType) {
      case 'hot':
        activeTab = hotTab;
        break;
      case 'time-desc':
        activeTab = timeDescTab;
        if (timeTab) {
          timeTab.setAttribute('data-state', 'active');
          timeTab.setAttribute('aria-selected', 'true');
          timeTab.classList.add('active');
        }
        break;
      case 'time-asc':
        activeTab = timeAscTab;
        if (timeTab) {
          timeTab.setAttribute('data-state', 'active');
          timeTab.setAttribute('aria-selected', 'true');
          timeTab.classList.add('active');
        }
        break;
    }

    if (activeTab) {
      activeTab.setAttribute('data-state', 'active');
      activeTab.setAttribute('aria-selected', 'true');
      activeTab.classList.add('active');
    }
  }

  /**
   * Show visual feedback for sorting
   * @param {string} sortType - The sort type
   */
  showSortFeedback(sortType) {
    const messages = {
      'hot': '按热门排序',
      'time-desc': '按时间排序（最新在前）',
      'time-asc': '按时间排序（最旧在前）'
    };

    const message = messages[sortType] || '排序完成';
    
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
    `;

    document.body.appendChild(feedback);

    // Animate in
    setTimeout(() => {
      feedback.style.opacity = '1';
    }, 10);

    // Remove after delay
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 1500);
  }

  /**
   * Toggle detailed comments section visibility
   */
  toggleDetailedComments() {
    const detailedSection = document.getElementById('detailed-comments-section');
    if (!detailedSection) return;

    const isVisible = detailedSection.style.display !== 'none';
    detailedSection.style.display = isVisible ? 'none' : 'block';

    console.log('Detailed comments section toggled:', !isVisible);
  }

  /**
   * Update comment count display
   */
  updateCommentCount() {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    const comments = commentsList.querySelectorAll('.comment-item');
    const count = comments.length;

    // Update any comment count displays
    const countElements = document.querySelectorAll('.comments-count, .count-number');
    countElements.forEach(element => {
      element.textContent = count.toString();
    });

    console.log('Comment count updated:', count);
  }

  /**
   * Filter comments by type
   * @param {string} filterType - The filter type ('all', 'hot', 'quality', 'controversial')
   */
  filterComments(filterType = 'all') {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    const comments = commentsList.querySelectorAll('.comment-item');
    
    comments.forEach(comment => {
      let shouldShow = true;

      switch (filterType) {
        case 'hot':
          shouldShow = comment.classList.contains('hot-comment') || 
                      comment.querySelector('[style*="🔥 热门"]');
          break;
        case 'quality':
          shouldShow = comment.querySelector('[style*="💡 优质"]');
          break;
        case 'controversial':
          shouldShow = comment.querySelector('[style*="⚡ 争议"]');
          break;
        case 'all':
        default:
          shouldShow = true;
      }

      comment.style.display = shouldShow ? 'block' : 'none';
    });

    console.log('Comments filtered by:', filterType);
  }

  /**
   * Get current sort type
   * @returns {string} Current sort type
   */
  getCurrentSortType() {
    return this.currentSortType;
  }

  /**
   * Destroy the controller and clean up
   */
  destroy() {
    this.isInitialized = false;
    console.log('Discussion controller destroyed');
  }
}

/**
 * Load discussion section component HTML
 * @param {string} containerId - ID of the container element
 * @returns {Promise<boolean>} Success status
 */
export async function loadDiscussionComponent(containerId = 'discussion-container') {
  try {
    const response = await fetch('./components/discussion/discussion-section.html');
    if (!response.ok) {
      throw new Error(`Failed to load discussion component: ${response.status}`);
    }
    
    const html = await response.text();
    const container = document.getElementById(containerId);
    
    if (!container) {
      throw new Error(`Container element with ID '${containerId}' not found`);
    }
    
    container.innerHTML = html;
    
    // Initialize the discussion controller after loading HTML
    const controller = new DiscussionController();
    
    // Make DiscussionController methods available globally for HTML onclick handlers
    window.DiscussionController = {
      sortComments: (sortType) => controller.sortComments(sortType),
      toggleDetailedComments: () => controller.toggleDetailedComments(),
      updateCommentCount: () => controller.updateCommentCount(),
      filterComments: (filterType) => controller.filterComments(filterType),
      goToTopic: () => {
        window.location.href = 'topic-detail.html';
      }
    };
    
    console.log('Discussion component loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading discussion component:', error);
    
    // Fallback: create basic discussion structure
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="discussion-section">
          <div class="discussion-section-header">
            <div class="discussion-title-container">
              <span>讨论区</span>
            </div>
            <div class="discussion-actions-container">
              <button class="discussion-btn">
                <img src="assets/lficon/messages.svg" alt="消息">
                <span>去议事</span>
              </button>
            </div>
          </div>
          <div id="detailed-comments-section" class="comments-section-container">
            <div id="comments-list">
              <div class="loading-placeholder">
                <p>正在加载评论...</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Initialize controller with fallback HTML
      const controller = new DiscussionController();
      
      // Make methods available globally even in fallback mode
      window.DiscussionController = {
        sortComments: (sortType) => controller.sortComments(sortType),
        toggleDetailedComments: () => controller.toggleDetailedComments(),
        updateCommentCount: () => controller.updateCommentCount(),
        filterComments: (filterType) => controller.filterComments(filterType),
        goToTopic: () => {
          window.location.href = 'topic-detail.html';
        }
      };
    }
    
    return false;
  }
}

// Export the controller class and create a singleton instance
export { DiscussionController };

// Create and export a singleton instance for backward compatibility
export const discussionController = new DiscussionController();

// Export individual functions for backward compatibility
export const sortComments = (sortType) => discussionController.sortComments(sortType);
export const toggleDetailedComments = () => discussionController.toggleDetailedComments();
export const updateCommentCount = () => discussionController.updateCommentCount();
export const filterComments = (filterType) => discussionController.filterComments(filterType);