/**
 * Utility Functions Module
 * Contains helper functions used throughout the application
 */

/**
 * Escape HTML characters to prevent XSS attacks
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function (c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c];
  });
}

/**
 * Adjust textarea height based on content
 * @param {HTMLTextAreaElement} textarea - The textarea element to adjust
 */
export function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

/**
 * Get likes count from a comment element
 * @param {HTMLElement} commentElement - The comment element
 * @returns {number} The number of likes
 */
export function getLikesCount(commentElement) {
  const likeButton = commentElement.querySelector('.comment-action');
  if (likeButton) {
    const countSpan = likeButton.querySelector('span');
    if (countSpan && !isNaN(parseInt(countSpan.textContent))) {
      return parseInt(countSpan.textContent);
    }
  }
  return 0;
}

/**
 * Get comment timestamp from a comment element
 * @param {HTMLElement} commentElement - The comment element
 * @returns {number} The timestamp
 */
export function getCommentTime(commentElement) {
  const timeElement = commentElement.querySelector('.comment-time');
  if (timeElement) {
    const timeText = timeElement.textContent.trim();
    // Convert time text to timestamp for sorting
    return new Date(timeText).getTime() || 0;
  }
  return 0;
}

/**
 * Show feedback message to user
 * @param {string} message - The message to show
 * @param {string} type - The type of message ('success', 'error', 'info')
 */
export function showFeedback(message, type = 'info') {
  // Create feedback element
  const feedback = document.createElement('div');
  feedback.className = `feedback-message feedback-${type}`;
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  document.body.appendChild(feedback);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
    }
  }, 3000);
}

/**
 * Format timestamp to readable date string
 * @param {number} timestamp - The timestamp to format
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return '刚刚';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }
  
  // Format as date
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}