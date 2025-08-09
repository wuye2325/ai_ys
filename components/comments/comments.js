/**
 * Comments Component Controller
 * Handles comment interactions and functionality
 */

import { showFeedback, getLikesCount } from '../../assets/js/utils.js';
import { updateCommentInteraction } from '../../assets/js/data-manager.js';

/**
 * Comments Controller Class
 */
class CommentsController {
  constructor() {
    this.isInitialized = false;
    this.userVotes = new Map(); // Track user votes to prevent multiple votes
    this.init();
  }

  /**
   * Initialize comments functionality
   */
  init() {
    if (this.isInitialized) return;
    
    this.bindEvents();
    this.isInitialized = true;
    console.log('Comments controller initialized');
  }

  /**
   * Bind event listeners using event delegation
   */
  bindEvents() {
    const commentsContainer = document.getElementById('comments-list');
    if (!commentsContainer) return;

    // Use event delegation for dynamic content
    commentsContainer.addEventListener('click', (e) => {
      const target = e.target.closest('.comment-action');
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();

      // Determine action type based on the icon or text
      const icon = target.querySelector('img');
      const text = target.querySelector('span').textContent.trim();
      
      if (icon && icon.alt === '点赞' || text === '点赞') {
        this.toggleLike(target);
      } else if (icon && icon.alt === '点踩' || text === '点踩') {
        this.toggleDislike(target);
      } else if (icon && icon.alt === '回复' || text === '回复') {
        this.replyComment(target);
      } else if (icon && icon.alt === '送花' || text === '送花') {
        this.sendFlower(target);
      }
    });

    // Bind reply toggle buttons
    commentsContainer.addEventListener('click', (e) => {
      if (e.target.closest('.expand-replies-btn')) {
        e.preventDefault();
        this.toggleReplies(e.target.closest('.expand-replies-btn'));
      }
    });
  }

  /**
   * Toggle like on a comment
   * @param {HTMLElement} element - The like button element
   */
  toggleLike(element) {
    const commentItem = element.closest('.comment-item');
    const commentId = this.getCommentId(commentItem);
    
    // Check if user already voted
    const currentVote = this.userVotes.get(commentId);
    if (currentVote === 'like') {
      // Remove like
      this.userVotes.delete(commentId);
      element.classList.remove('active');
      this.updateCount(element, -1);
      showFeedback('已取消点赞', 'info');
    } else {
      // Add like (remove dislike if exists)
      if (currentVote === 'dislike') {
        const dislikeBtn = this.findDislikeButton(commentItem);
        if (dislikeBtn) {
          dislikeBtn.classList.remove('active');
          this.updateCount(dislikeBtn, -1);
        }
      }
      
      this.userVotes.set(commentId, 'like');
      element.classList.add('active');
      this.updateCount(element, currentVote === 'dislike' ? 1 : 1);
      showFeedback('点赞成功', 'success');
    }

    // Update backend
    const newCount = this.getCountFromElement(element);
    updateCommentInteraction(commentId, 'like', newCount);
  }

  /**
   * Toggle dislike on a comment
   * @param {HTMLElement} element - The dislike button element
   */
  toggleDislike(element) {
    const commentItem = element.closest('.comment-item');
    const commentId = this.getCommentId(commentItem);
    
    // Check if user already voted
    const currentVote = this.userVotes.get(commentId);
    if (currentVote === 'dislike') {
      // Remove dislike
      this.userVotes.delete(commentId);
      element.classList.remove('active');
      this.updateCount(element, -1);
      showFeedback('已取消点踩', 'info');
    } else {
      // Add dislike (remove like if exists)
      if (currentVote === 'like') {
        const likeBtn = this.findLikeButton(commentItem);
        if (likeBtn) {
          likeBtn.classList.remove('active');
          this.updateCount(likeBtn, -1);
        }
      }
      
      this.userVotes.set(commentId, 'dislike');
      element.classList.add('active');
      this.updateCount(element, currentVote === 'like' ? 1 : 1);
      showFeedback('已点踩', 'info');
    }

    // Update backend
    const newCount = this.getCountFromElement(element);
    updateCommentInteraction(commentId, 'dislike', newCount);
  }

  /**
   * Handle comment reply
   * @param {HTMLElement} element - The reply button element
   */
  replyComment(element) {
    const commentItem = element.closest('.comment-item');
    const author = commentItem.querySelector('.comment-author').textContent.trim();
    
    // Check if reply input already exists
    let replyInput = commentItem.querySelector('.reply-input-container');
    
    if (replyInput) {
      // Focus existing input
      const textarea = replyInput.querySelector('textarea');
      if (textarea) textarea.focus();
      return;
    }

    // Create reply input
    replyInput = this.createReplyInput(author);
    
    // Insert after comment actions
    const commentActions = commentItem.querySelector('.comment-actions');
    commentActions.parentNode.insertBefore(replyInput, commentActions.nextSibling);
    
    // Focus the textarea
    const textarea = replyInput.querySelector('textarea');
    if (textarea) textarea.focus();
  }

  /**
   * Create reply input element
   * @param {string} replyToAuthor - The author being replied to
   * @returns {HTMLElement} The reply input container
   */
  createReplyInput(replyToAuthor) {
    const container = document.createElement('div');
    container.className = 'reply-input-container';
    container.style.cssText = `
      margin-top: 12px;
      padding: 12px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    `;

    container.innerHTML = `
      <textarea 
        placeholder="回复 @${replyToAuthor}..." 
        class="reply-textarea"
        style="
          width: 100%;
          min-height: 60px;
          padding: 8px 12px;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          resize: vertical;
          font-size: 14px;
          font-family: inherit;
          outline: none;
        "
      ></textarea>
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
        <button class="reply-cancel-btn" style="
          padding: 6px 12px;
          border: 1px solid #D1D5DB;
          background: white;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        ">取消</button>
        <button class="reply-send-btn" style="
          padding: 6px 12px;
          border: none;
          background: #3B82F6;
          color: white;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        ">发送</button>
      </div>
    `;

    // Bind reply actions
    const cancelBtn = container.querySelector('.reply-cancel-btn');
    const sendBtn = container.querySelector('.reply-send-btn');
    const textarea = container.querySelector('.reply-textarea');

    cancelBtn.addEventListener('click', () => {
      container.remove();
    });

    sendBtn.addEventListener('click', () => {
      const content = textarea.value.trim();
      if (content) {
        this.sendReply(content, replyToAuthor);
        container.remove();
      } else {
        showFeedback('请输入回复内容', 'error');
      }
    });

    // Auto-resize textarea
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });

    return container;
  }

  /**
   * Send a reply
   * @param {string} content - The reply content
   * @param {string} replyToAuthor - The author being replied to
   */
  sendReply(content, replyToAuthor) {
    // In a real application, this would send to backend
    console.log('Sending reply:', { content, replyToAuthor });
    showFeedback('回复发送成功', 'success');
    
    // Could add the reply to the UI here
    // For now, just show success message
  }

  /**
   * Send flower to a comment
   * @param {HTMLElement} element - The flower button element
   */
  sendFlower(element) {
    const commentItem = element.closest('.comment-item');
    const commentId = this.getCommentId(commentItem);
    
    // Check if user already sent flower
    if (element.classList.contains('flower-sent')) {
      showFeedback('您已经送过花了', 'info');
      return;
    }

    // Add flower animation
    element.classList.add('flower-sent');
    this.updateCount(element, 1);
    
    // Create flower animation
    this.createFlowerAnimation(element);
    
    showFeedback('送花成功！', 'success');
    
    // Update backend
    const newCount = this.getCountFromElement(element);
    updateCommentInteraction(commentId, 'flower', newCount);
  }

  /**
   * Create flower animation effect
   * @param {HTMLElement} element - The flower button element
   */
  createFlowerAnimation(element) {
    const flower = document.createElement('div');
    flower.innerHTML = '🌸';
    flower.style.cssText = `
      position: absolute;
      font-size: 20px;
      pointer-events: none;
      z-index: 1000;
      animation: flowerFloat 2s ease-out forwards;
    `;

    // Add CSS animation
    if (!document.getElementById('flower-animation-style')) {
      const style = document.createElement('style');
      style.id = 'flower-animation-style';
      style.textContent = `
        @keyframes flowerFloat {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-50px) scale(1.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const rect = element.getBoundingClientRect();
    flower.style.left = rect.left + rect.width / 2 + 'px';
    flower.style.top = rect.top + 'px';

    document.body.appendChild(flower);

    // Remove after animation
    setTimeout(() => {
      if (flower.parentNode) {
        flower.parentNode.removeChild(flower);
      }
    }, 2000);
  }

  /**
   * Toggle replies visibility
   * @param {HTMLElement} element - The expand replies button
   */
  toggleReplies(element) {
    const repliesContainer = element.closest('.comment-replies');
    const hiddenReplies = repliesContainer.querySelectorAll('.hidden-reply');
    const expandText = element.querySelector('.expand-text');
    const expandIcon = element.querySelector('.expand-icon');

    if (hiddenReplies.length === 0) return;

    const isExpanded = hiddenReplies[0].style.display !== 'none';

    hiddenReplies.forEach(reply => {
      reply.style.display = isExpanded ? 'none' : 'block';
    });

    if (expandText) {
      expandText.textContent = isExpanded 
        ? `展开${hiddenReplies.length}条回复`
        : `收起${hiddenReplies.length}条回复`;
    }

    if (expandIcon) {
      expandIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  }

  /**
   * Update count in a button element
   * @param {HTMLElement} element - The button element
   * @param {number} delta - The change in count
   */
  updateCount(element, delta) {
    const countSpan = element.querySelector('span');
    if (countSpan && !isNaN(parseInt(countSpan.textContent))) {
      const currentCount = parseInt(countSpan.textContent) || 0;
      const newCount = Math.max(0, currentCount + delta);
      countSpan.textContent = newCount.toString();
    }
  }

  /**
   * Get count from element
   * @param {HTMLElement} element - The button element
   * @returns {number} The current count
   */
  getCountFromElement(element) {
    const countSpan = element.querySelector('span');
    return countSpan ? (parseInt(countSpan.textContent) || 0) : 0;
  }

  /**
   * Get comment ID from comment element
   * @param {HTMLElement} commentElement - The comment element
   * @returns {string} The comment ID
   */
  getCommentId(commentElement) {
    // In a real app, this would be a data attribute
    // For now, use a combination of author and time as ID
    const author = commentElement.querySelector('.comment-author')?.textContent.trim() || '';
    const time = commentElement.querySelector('.comment-time')?.textContent.trim() || '';
    return `${author}-${time}`.replace(/\s+/g, '-');
  }

  /**
   * Find like button in comment
   * @param {HTMLElement} commentElement - The comment element
   * @returns {HTMLElement|null} The like button
   */
  findLikeButton(commentElement) {
    const actions = commentElement.querySelectorAll('.comment-action');
    for (const action of actions) {
      const icon = action.querySelector('img');
      if (icon && icon.alt === '点赞') {
        return action;
      }
    }
    return null;
  }

  /**
   * Find dislike button in comment
   * @param {HTMLElement} commentElement - The comment element
   * @returns {HTMLElement|null} The dislike button
   */
  findDislikeButton(commentElement) {
    const actions = commentElement.querySelectorAll('.comment-action');
    for (const action of actions) {
      const icon = action.querySelector('img');
      if (icon && icon.alt === '点踩') {
        return action;
      }
    }
    return null;
  }

  /**
   * Render comments from data using templates
   * @param {Array} commentsData - Array of comment objects
   */
  async renderComments(commentsData) {
    const container = document.getElementById('comments-list');
    if (!container || !commentsData) return;

    try {
      // Load comment template if not already loaded
      if (!this.commentTemplate) {
        await this.loadCommentTemplate();
      }

      // Clear existing comments
      container.innerHTML = '';

      // Render each comment using template
      commentsData.forEach(comment => {
        const commentElement = this.createCommentFromTemplate(comment);
        container.appendChild(commentElement);
      });

      console.log('Comments rendered using templates');
    } catch (error) {
      console.error('Error rendering comments with templates:', error);
      
      // Fallback to basic rendering
      this.renderCommentsBasic(commentsData);
    }
  }

  /**
   * Load comment template
   */
  async loadCommentTemplate() {
    try {
      const response = await fetch('./components/comments/comment-item.html');
      if (!response.ok) {
        throw new Error(`Failed to load comment template: ${response.status}`);
      }
      this.commentTemplate = await response.text();
    } catch (error) {
      console.error('Error loading comment template:', error);
      // Use fallback template
      this.commentTemplate = this.getFallbackTemplate();
    }
  }

  /**
   * Create comment element from template
   * @param {Object} commentData - Comment data object
   * @returns {HTMLElement} The comment element
   */
  createCommentFromTemplate(commentData) {
    let html = this.commentTemplate;
    
    // Replace template variables
    html = html.replace(/\{\{id\}\}/g, commentData.id || '');
    html = html.replace(/\{\{author\.avatar\}\}/g, commentData.author.avatar || '');
    html = html.replace(/\{\{author\.name\}\}/g, commentData.author.name || '');
    html = html.replace(/\{\{timestamp\}\}/g, commentData.timestamp || '');
    html = html.replace(/\{\{content\}\}/g, this.processContent(commentData.content || ''));
    html = html.replace(/\{\{likes\}\}/g, commentData.likes || 0);
    html = html.replace(/\{\{dislikes\}\}/g, commentData.dislikes > 0 ? commentData.dislikes : '点踩');
    
    // Add type badge
    const typeBadge = this.createTypeBadge(commentData.type);
    html = html.replace(/\{\{typeBadge\}\}/g, typeBadge);
    
    // Add replies section
    const repliesSection = commentData.replies && commentData.replies.length > 0 
      ? this.createRepliesSection(commentData.replies) 
      : '';
    html = html.replace(/\{\{repliesSection\}\}/g, repliesSection);
    
    // Create element from HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    const commentElement = div.firstElementChild;
    
    // Apply special styling for different comment types
    this.applyCommentTypeStyles(commentElement, commentData.type);
    
    return commentElement;
  }

  /**
   * Process comment content (handle mentions, etc.)
   * @param {string} content - Raw content
   * @returns {string} Processed content
   */
  processContent(content) {
    // Handle mentioned users (this would be more sophisticated in a real app)
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  }

  /**
   * Create type badge HTML
   * @param {string} type - Comment type
   * @returns {string} Badge HTML
   */
  createTypeBadge(type) {
    const badges = {
      'hot': '<span style="background: #FF6B35; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 8px;">🔥 热门</span>',
      'quality': '<span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 8px;">💡 优质</span>',
      'controversial': '<span style="background: #F59E0B; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 8px;">⚡ 争议</span>'
    };
    return badges[type] || '';
  }

  /**
   * Apply comment type styles
   * @param {HTMLElement} element - Comment element
   * @param {string} type - Comment type
   */
  applyCommentTypeStyles(element, type) {
    if (type === 'hot') {
      element.style.borderLeft = '3px solid #FF6B35';
      element.style.background = 'linear-gradient(135deg, #FFF5F0 0%, #FFFFFF 100%)';
    } else if (type === 'quality') {
      element.style.borderLeft = '3px solid #10B981';
      element.style.background = 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)';
    } else if (type === 'controversial') {
      element.style.borderLeft = '3px solid #F59E0B';
      element.style.background = 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)';
    }
  }

  /**
   * Create replies section HTML
   * @param {Array} replies - Replies data
   * @returns {string} Replies HTML
   */
  createRepliesSection(replies) {
    let repliesHtml = '<div class="comment-replies">';
    
    replies.forEach((reply, index) => {
      const isHidden = index > 0 ? 'style="display: none;"' : '';
      const replyContent = reply.mentionedUser ? 
        `回复<span class="mention">@${reply.mentionedUser}</span> ${reply.content}` : 
        reply.content;
      
      repliesHtml += `
        <div class="comment-item ${index > 0 ? 'hidden-reply' : ''}" style="margin-bottom: 0;" ${isHidden}>
          <div class="comment-content">
            <div class="comment-header">
              <img src="${reply.author.avatar}" class="comment-avatar" style="width: 28px; height: 28px;" alt="头像">
              <span class="comment-author">${reply.author.name}</span>
              <span class="comment-time">${reply.timestamp}</span>
            </div>
            <div class="comment-text">${replyContent}</div>
            <div class="comment-actions">
              <span class="comment-action" onclick="CommentsController.toggleLike(this)">
                <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon" alt="点赞">
                <span>${reply.likes}</span>
              </span>
              <span class="comment-action" onclick="CommentsController.toggleDislike(this)">
                <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon-rotated" alt="点踩">
                <span>${reply.dislikes > 0 ? reply.dislikes : '点踩'}</span>
              </span>
              <span class="comment-action" onclick="CommentsController.replyComment(this)">
                <img src="assets/lficon/chat-24-outline.svg" class="comment-action-icon" alt="回复">
                <span>回复</span>
              </span>
            </div>
          </div>
        </div>
      `;
    });
    
    // Add expand button if there are hidden replies
    if (replies.length > 1) {
      const hiddenCount = replies.length - 1;
      repliesHtml += `
        <div class="expand-replies-btn" onclick="CommentsController.toggleReplies(this)">
          <span class="expand-text">展开${hiddenCount}条回复</span>
          <img src="assets/lficon/triangle-down.svg" class="expand-icon" style="width: 12px; height: 12px; margin-left: 4px;" alt="展开">
        </div>
      `;
    }
    
    repliesHtml += '</div>';
    return repliesHtml;
  }

  /**
   * Get fallback template when loading fails
   * @returns {string} Fallback template HTML
   */
  getFallbackTemplate() {
    return `
      <div class="comment-item" data-comment-id="{{id}}">
        <div class="comment-content">
          <div class="comment-header">
            <img src="{{author.avatar}}" class="comment-avatar" alt="头像">
            <span class="comment-author">{{author.name}}</span>
            <span class="comment-time">{{timestamp}}</span>
            {{typeBadge}}
          </div>
          <div class="comment-text">{{content}}</div>
          <div class="comment-actions">
            <span class="comment-action" onclick="CommentsController.toggleLike(this)">
              <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon" alt="点赞">
              <span>{{likes}}</span>
            </span>
            <span class="comment-action" onclick="CommentsController.toggleDislike(this)">
              <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon-rotated" alt="点踩">
              <span>{{dislikes}}</span>
            </span>
            <span class="comment-action" onclick="CommentsController.replyComment(this)">
              <img src="assets/lficon/chat-24-outline.svg" class="comment-action-icon" alt="回复">
              <span>回复</span>
            </span>
            <span class="comment-action" onclick="CommentsController.sendFlower(this)">
              <img src="assets/lficon/flower.svg" class="comment-action-icon" alt="送花">
              <span>送花</span>
            </span>
          </div>
          {{repliesSection}}
        </div>
      </div>
    `;
  }

  /**
   * Fallback basic rendering without templates
   * @param {Array} commentsData - Array of comment objects
   */
  renderCommentsBasic(commentsData) {
    const container = document.getElementById('comments-list');
    if (!container || !commentsData) return;

    // Clear existing comments
    container.innerHTML = '';

    // Render each comment
    commentsData.forEach(comment => {
      const commentElement = this.createCommentElement(comment);
      container.appendChild(commentElement);
    });
  }

  /**
   * Create comment element from data
   * @param {Object} commentData - Comment data object
   * @returns {HTMLElement} The comment element
   */
  createCommentElement(commentData) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `
      <div class="comment-content">
        <div class="comment-header">
          <img src="${commentData.author.avatar}" class="comment-avatar" alt="头像">
          <span class="comment-author">${commentData.author.name}</span>
          <span class="comment-time">${commentData.timestamp}</span>
        </div>
        <div class="comment-text">${commentData.content}</div>
        <div class="comment-actions">
          <span class="comment-action">
            <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon" alt="点赞">
            <span>${commentData.likes || 0}</span>
          </span>
          <span class="comment-action">
            <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon-rotated" alt="点踩">
            <span>${commentData.dislikes || 0}</span>
          </span>
          <span class="comment-action">
            <img src="assets/lficon/chat-24-outline.svg" class="comment-action-icon" alt="回复">
            <span>回复</span>
          </span>
          <span class="comment-action">
            <img src="assets/lficon/flower.svg" class="comment-action-icon" alt="送花">
            <span>送花</span>
          </span>
        </div>
      </div>
    `;
    return div;
  }

  /**
   * Destroy the controller and clean up
   */
  destroy() {
    this.userVotes.clear();
    this.isInitialized = false;
    console.log('Comments controller destroyed');
  }
}

/**
 * Load comments component HTML
 * @param {string} containerId - ID of the container element
 * @returns {Promise<boolean>} Success status
 */
export async function loadCommentsComponent(containerId = 'comments-container') {
  try {
    const response = await fetch('./components/comments/comment-list.html');
    if (!response.ok) {
      throw new Error(`Failed to load comments component: ${response.status}`);
    }
    
    const html = await response.text();
    const container = document.getElementById(containerId);
    
    if (!container) {
      throw new Error(`Container element with ID '${containerId}' not found`);
    }
    
    container.innerHTML = html;
    
    // Initialize the comments controller after loading HTML
    const controller = new CommentsController();
    
    // Make CommentsController methods available globally for HTML onclick handlers
    window.CommentsController = {
      toggleLike: (element) => controller.toggleLike(element),
      toggleDislike: (element) => controller.toggleDislike(element),
      replyComment: (element) => controller.replyComment(element),
      sendFlower: (element) => controller.sendFlower(element),
      toggleReplies: (element) => controller.toggleReplies(element),
      renderComments: (data) => controller.renderComments(data)
    };
    
    console.log('Comments component loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading comments component:', error);
    
    // Fallback: create basic comments structure
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div id="comments-list">
          <div class="loading-placeholder">
            <p>正在加载评论...</p>
          </div>
        </div>
      `;
      
      // Initialize controller with fallback HTML
      const controller = new CommentsController();
      
      // Make methods available globally even in fallback mode
      window.CommentsController = {
        toggleLike: (element) => controller.toggleLike(element),
        toggleDislike: (element) => controller.toggleDislike(element),
        replyComment: (element) => controller.replyComment(element),
        sendFlower: (element) => controller.sendFlower(element),
        toggleReplies: (element) => controller.toggleReplies(element),
        renderComments: (data) => controller.renderComments(data)
      };
    }
    
    return false;
  }
}

// Export the controller class and create a singleton instance
export { CommentsController };

// Create and export a singleton instance for backward compatibility
export const commentsController = new CommentsController();

// Export individual functions for backward compatibility
export const toggleLike = (element) => commentsController.toggleLike(element);
export const toggleDislike = (element) => commentsController.toggleDislike(element);
export const replyComment = (element) => commentsController.replyComment(element);
export const sendFlower = (element) => commentsController.sendFlower(element);
export const toggleReplies = (element) => commentsController.toggleReplies(element);
export const renderComments = (data) => commentsController.renderComments(data);