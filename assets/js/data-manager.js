/**
 * Data Management Module
 * Handles data loading, caching, and management operations
 */

// Data cache
let dataCache = {
  comments: null,
  topicInfo: null,
  attachments: null
};

/**
 * Load JSON data from a file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object>} The loaded data
 */
async function loadJsonData(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

/**
 * Load comments data
 * @returns {Promise<Array>} Array of comment objects
 */
export async function loadCommentsData() {
  if (dataCache.comments) {
    return dataCache.comments;
  }
  
  const data = await loadJsonData('assets/data/comments.json');
  if (data) {
    dataCache.comments = data;
  }
  return data || [];
}

/**
 * Load topic information
 * @returns {Promise<Object>} Topic information object
 */
export async function loadTopicInfo() {
  if (dataCache.topicInfo) {
    return dataCache.topicInfo;
  }
  
  const data = await loadJsonData('assets/data/topic-info.json');
  if (data) {
    dataCache.topicInfo = data;
  }
  return data || {};
}

/**
 * Load attachments data
 * @returns {Promise<Array>} Array of attachment objects
 */
export async function loadAttachmentsData() {
  if (dataCache.attachments) {
    return dataCache.attachments;
  }
  
  const data = await loadJsonData('assets/data/attachments.json');
  if (data) {
    dataCache.attachments = data;
  }
  return data || [];
}

/**
 * Save comment data (for future use with backend)
 * @param {Object} commentData - The comment data to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveComment(commentData) {
  try {
    // In a real application, this would send data to a backend
    console.log('Saving comment:', commentData);
    
    // For now, just add to local cache
    if (dataCache.comments) {
      dataCache.comments.push(commentData);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving comment:', error);
    return false;
  }
}

/**
 * Update comment interaction (like, dislike, etc.)
 * @param {string} commentId - The comment ID
 * @param {string} action - The action type ('like', 'dislike', 'reply')
 * @param {any} value - The new value
 * @returns {Promise<boolean>} Success status
 */
export async function updateCommentInteraction(commentId, action, value) {
  try {
    // In a real application, this would update the backend
    console.log('Updating comment interaction:', { commentId, action, value });
    
    // Update local cache
    if (dataCache.comments) {
      const comment = dataCache.comments.find(c => c.id === commentId);
      if (comment) {
        switch (action) {
          case 'like':
            comment.likes = value;
            break;
          case 'dislike':
            comment.dislikes = value;
            break;
          case 'reply':
            if (!comment.replies) comment.replies = [];
            comment.replies.push(value);
            break;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating comment interaction:', error);
    return false;
  }
}

/**
 * Clear data cache
 */
export function clearCache() {
  dataCache = {
    comments: null,
    topicInfo: null,
    attachments: null
  };
}

/**
 * Get cached data
 * @param {string} type - The type of data to get ('comments', 'topicInfo', 'attachments')
 * @returns {any} The cached data or null
 */
export function getCachedData(type) {
  return dataCache[type] || null;
}

/**
 * Set cached data
 * @param {string} type - The type of data to cache
 * @param {any} data - The data to cache
 */
export function setCachedData(type, data) {
  dataCache[type] = data;
}

/**
 * Render topic information to the page
 * @param {Object} topicData - The topic data to render
 */
export function renderTopicInfo(topicData) {
  try {
    // Update topic title and status
    const titleElement = document.getElementById('topic-title-text');
    const statusElement = document.getElementById('topic-status');
    
    if (titleElement) titleElement.textContent = topicData.title || '加载失败';
    if (statusElement) {
      statusElement.textContent = topicData.status === 'active' ? '进行中' : '已结束';
      statusElement.className = `topic-status topic-status-badge ${topicData.status === 'active' ? 'status-active' : 'status-closed'}`;
    }
    
    // Update author info
    const authorAvatar = document.getElementById('topic-author-avatar');
    const authorName = document.getElementById('topic-author-name');
    const timestamp = document.getElementById('topic-timestamp');
    
    if (authorAvatar) authorAvatar.src = topicData.author?.avatar || '';
    if (authorName) authorName.textContent = topicData.author?.name || '未知用户';
    if (timestamp) timestamp.textContent = topicData.timestamp || '';
    
    // Update topic details
    const backgroundElement = document.getElementById('topic-background');
    const coreIssueElement = document.getElementById('topic-core-issue');
    const controversyElement = document.getElementById('topic-controversy');
    const keyQuestionElement = document.getElementById('topic-key-question');
    const expectedResultElement = document.getElementById('topic-expected-result');
    
    if (backgroundElement) backgroundElement.textContent = topicData.description?.background || '';
    if (coreIssueElement) coreIssueElement.textContent = topicData.description?.coreIssue || '';
    if (controversyElement) controversyElement.textContent = topicData.description?.controversy || '';
    if (keyQuestionElement) keyQuestionElement.textContent = topicData.description?.keyQuestion || '';
    if (expectedResultElement) expectedResultElement.textContent = topicData.description?.expectedResult || '';
    
    // Show/hide AI polish card
    const aiPolishCard = document.getElementById('ai-polish-card');
    if (aiPolishCard && topicData.aiPolish?.enabled) {
      aiPolishCard.style.display = 'flex';
      const aiPolishMessage = document.getElementById('ai-polish-message');
      if (aiPolishMessage) {
        aiPolishMessage.textContent = topicData.aiPolish.message || '该文本由AI润色，';
      }
    }
    
    console.log('Topic info rendered successfully');
  } catch (error) {
    console.error('Error rendering topic info:', error);
  }
}

/**
 * Render attachments to the page
 * @param {Array} attachmentsData - The attachments data to render
 */
export function renderAttachments(attachmentsData) {
  try {
    const attachmentsList = document.getElementById('figma-attachment-list');
    if (!attachmentsList) return;
    
    attachmentsList.innerHTML = '';
    
    if (!attachmentsData.attachments || attachmentsData.attachments.length === 0) {
      attachmentsList.innerHTML = '<p style="color: #666; font-size: 12px;">暂无附件</p>';
      return;
    }
    
    attachmentsData.attachments.forEach((file) => {
      const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
      let iconMap = {
        'pdf': 'assets/lficon/pdf-24.svg',
        'doc': 'assets/lficon/doc-24.svg',
        'docx': 'assets/lficon/docx-24.svg',
        'xls': 'assets/lficon/xls-24.svg',
        'xlsx': 'assets/lficon/xlsx-24.svg',
        'ppt': 'assets/lficon/ppt-24.svg',
        'pptx': 'assets/lficon/pptx-24.svg'
      };
      
      const iconSrc = iconMap[ext] || 'assets/lficon/file-24-outline.svg';
      
      // Format file size
      const size = file.size ? (file.size / 1024).toFixed(0) + 'KB' : '未知大小';
      
      const card = document.createElement('div');
      card.className = 'attachment-item';
      card.innerHTML = `
        <img src='${iconSrc}' alt='icon' class='attachment-icon'>
        <div class='attachment-info'>
          <div class='attachment-name' title='${file.name}'>${file.name}</div>
          <div class='attachment-size'>${size}</div>
        </div>
      `;
      card.style.cursor = 'pointer';
      card.onclick = function(e) {
        showAttachmentPreview(file);
      };
      attachmentsList.appendChild(card);
    });
    
    console.log('Attachments rendered successfully');
  } catch (error) {
    console.error('Error rendering attachments:', error);
  }
}

/**
 * Render comments to the page
 * @param {Array} commentsData - The comments data to render
 */
export function renderComments(commentsData) {
  try {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    if (!commentsData.comments || commentsData.comments.length === 0) {
      commentsList.innerHTML = '<div class="loading-placeholder"><p>暂无评论</p></div>';
      return;
    }
    
    commentsData.comments.forEach((comment) => {
      const commentElement = createCommentElement(comment);
      commentsList.appendChild(commentElement);
    });
    
    console.log('Comments rendered successfully');
  } catch (error) {
    console.error('Error rendering comments:', error);
  }
}

/**
 * Create a comment element
 * @param {Object} comment - The comment data
 * @returns {HTMLElement} The comment element
 */
function createCommentElement(comment) {
  const commentDiv = document.createElement('div');
  commentDiv.className = 'comment-item';
  commentDiv.setAttribute('data-comment-id', comment.id);
  
  // Add special styling for different comment types
  if (comment.type === 'hot') {
    commentDiv.style.borderLeft = '3px solid #FF6B35';
    commentDiv.style.background = 'linear-gradient(135deg, #FFF5F0 0%, #FFFFFF 100%)';
  } else if (comment.type === 'quality') {
    commentDiv.style.borderLeft = '3px solid #10B981';
    commentDiv.style.background = 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)';
  } else if (comment.type === 'controversial') {
    commentDiv.style.borderLeft = '3px solid #F59E0B';
    commentDiv.style.background = 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)';
  }
  
  // Create type badge
  let typeBadge = '';
  if (comment.type === 'hot') {
    typeBadge = '<span style="background: #FF6B35; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 8px;">🔥 热门</span>';
  } else if (comment.type === 'quality') {
    typeBadge = '<span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 8px;">💡 优质</span>';
  } else if (comment.type === 'controversial') {
    typeBadge = '<span style="background: #F59E0B; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 8px;">⚡ 争议</span>';
  }
  
  // Handle mentioned user in content
  let content = comment.content;
  if (comment.mentionedUser) {
    content = `回复<span class="mention">@${comment.mentionedUser}</span> ${content}`;
  }
  
  commentDiv.innerHTML = `
    <div class="comment-content">
      <div class="comment-header">
        <img src="${comment.author.avatar}" class="comment-avatar" alt="头像">
        <span class="comment-author">${comment.author.name}</span>
        <span class="comment-time">${comment.timestamp}</span>
        ${typeBadge}
      </div>
      <div class="comment-text">${content}</div>
      <div class="comment-actions">
        <span class="comment-action" onclick="toggleLike(this)">
          <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon" alt="点赞">
          <span ${comment.type === 'hot' || comment.type === 'quality' ? 'style="color: ' + (comment.type === 'hot' ? '#FF6B35' : '#10B981') + '; font-weight: 600;"' : ''}>${comment.likes}</span>
        </span>
        <span class="comment-action" onclick="toggleDislike(this)">
          <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon-rotated" alt="点踩">
          <span ${comment.type === 'controversial' && comment.dislikes > comment.likes ? 'style="color: #F59E0B; font-weight: 600;"' : ''}>${comment.dislikes > 0 ? comment.dislikes : '点踩'}</span>
        </span>
        <span class="comment-action" onclick="replyComment(this)">
          <img src="assets/lficon/chat-24-outline.svg" class="comment-action-icon" alt="回复">
          <span>回复</span>
        </span>
        <span class="comment-action" onclick="sendFlower(this)">
          <img src="assets/lficon/flower.svg" class="comment-action-icon" alt="送花">
          <span>送花</span>
        </span>
      </div>
      ${comment.replies && comment.replies.length > 0 ? createRepliesSection(comment.replies) : ''}
    </div>
  `;
  
  return commentDiv;
}

/**
 * Create replies section for a comment
 * @param {Array} replies - The replies data
 * @returns {string} The replies HTML
 */
function createRepliesSection(replies) {
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
            <span class="comment-action" onclick="toggleLike(this)">
              <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon" alt="点赞">
              <span>${reply.likes}</span>
            </span>
            <span class="comment-action" onclick="toggleDislike(this)">
              <img src="assets/lficon/thumbs-up-outline.svg" class="comment-action-icon-rotated" alt="点踩">
              <span>${reply.dislikes > 0 ? reply.dislikes : '点踩'}</span>
            </span>
            <span class="comment-action" onclick="replyComment(this)">
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
      <div class="expand-replies-btn" onclick="toggleReplies(this)">
        <span class="expand-text">展开${hiddenCount}条回复</span>
        <img src="assets/lficon/triangle-down.svg" class="expand-icon" style="width: 12px; height: 12px; margin-left: 4px;" alt="展开">
      </div>
    `;
  }
  
  repliesHtml += '</div>';
  return repliesHtml;
}

/**
 * Load and render all content
 */
export async function loadAndRenderAllContent() {
  try {
    console.log('Loading all content...');
    
    // Load all data in parallel
    const [topicData, attachmentsData, commentsData] = await Promise.all([
      loadTopicInfo(),
      loadAttachmentsData(),
      loadCommentsData()
    ]);
    
    // Render all content
    if (topicData) renderTopicInfo(topicData);
    if (attachmentsData) renderAttachments(attachmentsData);
    if (commentsData) renderComments(commentsData);
    
    console.log('All content loaded and rendered successfully');
  } catch (error) {
    console.error('Error loading and rendering content:', error);
    
    // Show error message to user
    const commentsList = document.getElementById('comments-list');
    if (commentsList) {
      commentsList.innerHTML = '<div class="loading-placeholder"><p style="color: #e74c3c;">加载内容时出现错误，请刷新页面重试</p></div>';
    }
  }
}

/**
 * Initialize data manager
 */
export function initializeDataManager() {
  console.log('Data manager initialized');
  
  // Set up periodic cache cleanup (every 5 minutes)
  setInterval(() => {
    console.log('Performing periodic cache cleanup');
    // In a real app, you might want to refresh certain data periodically
  }, 5 * 60 * 1000);
}