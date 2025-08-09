/**
 * AI Assistant Panel Controller
 * Handles AI assistant functionality and interactions
 */

import { showFeedback, formatTimestamp } from '../../assets/js/utils.js';
import { loadCommentsData } from '../../assets/js/data-manager.js';

/**
 * AI Assistant Controller Class
 */
class AIController {
  constructor() {
    this.isInitialized = false;
    this.isPanelVisible = false;
    this.analysisData = {
      totalComments: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      keyTopics: [],
      lastUpdated: null
    };
    this.init();
  }

  /**
   * Initialize AI assistant functionality
   */
  init() {
    if (this.isInitialized) return;
    
    this.bindEvents();
    this.updateAIAnalysis();
    this.isInitialized = true;
    console.log('AI Assistant controller initialized');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // AI assistant toggle button
    const toggleBtn = document.getElementById('ai-assistant-toggle-btn');
    if (toggleBtn) {
      toggleBtn.removeAttribute('onclick');
      toggleBtn.addEventListener('click', () => this.toggleAIAssistant());
    }

    // AI summary toggle button
    const summaryToggleBtn = document.getElementById('ai-summary-toggle-btn');
    if (summaryToggleBtn) {
      summaryToggleBtn.removeAttribute('onclick');
      summaryToggleBtn.addEventListener('click', () => this.toggleAISummary());
    }

    // AI overview expand button
    const overviewExpandBtn = document.getElementById('ai-overview-expand-btn');
    if (overviewExpandBtn) {
      overviewExpandBtn.removeAttribute('onclick');
      overviewExpandBtn.addEventListener('click', () => this.toggleAIOverview());
    }

    // Refresh AI summary button
    const refreshBtn = document.querySelector('[onclick*="refreshAISummary"]');
    if (refreshBtn) {
      refreshBtn.removeAttribute('onclick');
      refreshBtn.addEventListener('click', () => this.refreshAISummary());
    }

    // Detailed analysis toggle button
    const detailedAnalysisBtn = document.getElementById('detailed-analysis-btn');
    if (detailedAnalysisBtn) {
      detailedAnalysisBtn.removeAttribute('onclick');
      detailedAnalysisBtn.addEventListener('click', () => this.toggleDetailedAIAnalysis());
    }
  }

  /**
   * Toggle AI assistant panel visibility
   */
  toggleAIAssistant() {
    const panel = document.getElementById('ai-assistant-panel');
    const btn = document.getElementById('ai-assistant-toggle-btn');
    
    if (!panel || !btn) return;

    if (!this.isPanelVisible) {
      // Show panel
      panel.style.display = 'block';
      panel.style.transition = 'all 0.3s ease';
      panel.style.transform = 'translateY(0)';
      panel.style.opacity = '1';
      
      btn.classList.add('active');
      this.isPanelVisible = true;
      
      // Update AI analysis data when panel opens
      this.updateAIAnalysis();
      
      showFeedback('AI助手已开启', 'info');
    } else {
      // Hide panel
      panel.style.transition = 'all 0.3s ease';
      panel.style.transform = 'translateY(100%)';
      panel.style.opacity = '0';
      
      setTimeout(() => {
        panel.style.display = 'none';
      }, 300);
      
      btn.classList.remove('active');
      this.isPanelVisible = false;
      
      showFeedback('AI助手已关闭', 'info');
    }
  }

  /**
   * Update AI analysis data
   */
  async updateAIAnalysis() {
    try {
      // Get current comment data
      const comments = document.querySelectorAll('.comment-item:not(#ai-assistant-comment)');
      
      // Analyze comments
      const analysis = this.analyzeComments(comments);
      
      // Update analysis data
      this.analysisData = {
        ...analysis,
        lastUpdated: Date.now()
      };

      // Update UI elements
      this.updateAnalysisDisplay();
      
      console.log('AI analysis updated:', this.analysisData);
    } catch (error) {
      console.error('Error updating AI analysis:', error);
    }
  }

  /**
   * Analyze comments and extract insights
   * @param {NodeList} comments - Comment elements
   * @returns {Object} Analysis results
   */
  analyzeComments(comments) {
    const analysis = {
      totalComments: comments.length,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      keyTopics: [],
      hotComments: 0,
      qualityComments: 0,
      controversialComments: 0
    };

    // Keywords for sentiment analysis (simplified)
    const positiveKeywords = ['好', '赞成', '支持', '同意', '不错', '很好', '棒', '优秀', '正确'];
    const negativeKeywords = ['不好', '反对', '不同意', '错误', '问题', '担心', '反感', '不行'];
    
    // Topic keywords
    const topicKeywords = {
      '津贴制度': ['津贴', '补贴', '工资', '报酬', '费用'],
      '业委会': ['业委会', '委员会', '业主委员会'],
      '监督机制': ['监督', '透明', '公开', '监管'],
      '法律问题': ['法律', '法规', '合规', '依据'],
      '试点实施': ['试点', '试行', '实施', '推广']
    };

    const topicCounts = {};
    Object.keys(topicKeywords).forEach(topic => {
      topicCounts[topic] = 0;
    });

    comments.forEach(comment => {
      const text = comment.querySelector('.comment-text')?.textContent || '';
      
      // Sentiment analysis
      const positiveCount = positiveKeywords.filter(word => text.includes(word)).length;
      const negativeCount = negativeKeywords.filter(word => text.includes(word)).length;
      
      if (positiveCount > negativeCount) {
        analysis.sentiment.positive++;
      } else if (negativeCount > positiveCount) {
        analysis.sentiment.negative++;
      } else {
        analysis.sentiment.neutral++;
      }

      // Topic analysis
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        const matches = keywords.filter(keyword => text.includes(keyword)).length;
        topicCounts[topic] += matches;
      });

      // Special comment types
      if (comment.classList.contains('hot-comment') || comment.querySelector('[style*="🔥 热门"]')) {
        analysis.hotComments++;
      }
      if (comment.querySelector('[style*="💡 优质"]')) {
        analysis.qualityComments++;
      }
      if (comment.querySelector('[style*="⚡ 争议"]')) {
        analysis.controversialComments++;
      }
    });

    // Extract top topics
    analysis.keyTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, count }));

    return analysis;
  }

  /**
   * Update analysis display in UI
   */
  updateAnalysisDisplay() {
    // Update comment count
    const countElements = document.querySelectorAll('.ai-comment-count');
    countElements.forEach(el => {
      el.textContent = this.analysisData.totalComments;
    });

    // Update sentiment display
    const sentimentElements = {
      positive: document.querySelector('.ai-sentiment-positive'),
      neutral: document.querySelector('.ai-sentiment-neutral'),
      negative: document.querySelector('.ai-sentiment-negative')
    };

    Object.entries(sentimentElements).forEach(([type, element]) => {
      if (element) {
        element.textContent = this.analysisData.sentiment[type];
      }
    });

    // Update key topics
    const topicsContainer = document.querySelector('.ai-key-topics');
    if (topicsContainer && this.analysisData.keyTopics.length > 0) {
      topicsContainer.innerHTML = this.analysisData.keyTopics
        .map(({ topic, count }) => `<span class="topic-tag">${topic} (${count})</span>`)
        .join('');
    }

    // Update last updated time
    const lastUpdatedElement = document.querySelector('.ai-last-updated');
    if (lastUpdatedElement && this.analysisData.lastUpdated) {
      lastUpdatedElement.textContent = formatTimestamp(this.analysisData.lastUpdated);
    }
  }

  /**
   * Toggle AI summary visibility
   */
  toggleAISummary() {
    const aiComment = document.getElementById('ai-assistant-comment');
    const toggleBtn = document.getElementById('ai-summary-toggle-btn');
    
    if (!aiComment || !toggleBtn) return;

    const isVisible = aiComment.style.display !== 'none';
    
    if (isVisible) {
      aiComment.style.display = 'none';
      toggleBtn.textContent = '显示AI速览';
      showFeedback('AI速览已隐藏', 'info');
    } else {
      aiComment.style.display = 'block';
      toggleBtn.textContent = '隐藏AI速览';
      showFeedback('AI速览已显示', 'info');
    }
  }

  /**
   * Toggle AI overview details
   */
  toggleAIOverview() {
    const detailsSection = document.getElementById('ai-overview-details');
    const expandBtn = document.getElementById('ai-overview-expand-btn');
    
    if (!detailsSection || !expandBtn) return;

    const isExpanded = detailsSection.style.display !== 'none';
    const expandIcon = expandBtn.querySelector('.expand-icon, .fas');

    if (isExpanded) {
      // Collapse
      detailsSection.style.display = 'none';
      if (expandIcon) {
        expandIcon.style.transform = 'rotate(0deg)';
      }
    } else {
      // Expand
      detailsSection.style.display = 'block';
      if (expandIcon) {
        expandIcon.style.transform = 'rotate(180deg)';
      }
    }
  }

  /**
   * Refresh AI summary with updated timestamp
   */
  refreshAISummary() {
    const refreshStatus = document.getElementById('refresh-status');
    
    if (refreshStatus) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Show loading state
      refreshStatus.textContent = '更新中...';
      
      // Simulate AI processing delay
      setTimeout(() => {
        refreshStatus.textContent = `${timeString} 更新`;
        this.updateAIAnalysis();
        showFeedback('AI分析已更新', 'success');
      }, 1000);
    }
  }

  /**
   * Toggle detailed AI analysis view
   */
  toggleDetailedAIAnalysis() {
    const bulletCommentsSection = document.getElementById('bullet-comments-section');
    const btn = document.getElementById('detailed-analysis-btn');
    
    if (!bulletCommentsSection || !btn) return;

    const isDetailedView = btn.textContent.includes('返回');

    if (isDetailedView) {
      // Switch back to bullet comments
      this.showBulletComments();
      btn.textContent = '查看详细分析';
    } else {
      // Switch to detailed analysis
      this.showDetailedAnalysis();
      btn.textContent = '返回讨论概况';
    }
  }

  /**
   * Show bullet comments view
   */
  showBulletComments() {
    const bulletCommentsSection = document.getElementById('bullet-comments-section');
    if (bulletCommentsSection) {
      // Restore original bullet comments content
      bulletCommentsSection.innerHTML = this.getBulletCommentsHTML();
    }
  }

  /**
   * Show detailed analysis view
   */
  showDetailedAnalysis() {
    const bulletCommentsSection = document.getElementById('bullet-comments-section');
    if (bulletCommentsSection) {
      bulletCommentsSection.innerHTML = this.getDetailedAnalysisHTML();
    }
  }

  /**
   * Get bullet comments HTML
   * @returns {string} HTML for bullet comments
   */
  getBulletCommentsHTML() {
    return `
      <div class="bullet-comments-header">
        <span class="bullet-comments-title">实时讨论</span>
        <div class="bullet-comments-count">
          <span class="count-number">${this.analysisData.totalComments}</span>
          <span class="count-label">条评论</span>
        </div>
      </div>
      <div class="bullet-comments-list">
        <!-- Bullet comments would be dynamically generated here -->
        <div class="bullet-comment">津贴制度需要透明化管理</div>
        <div class="bullet-comment">支持试点实施</div>
        <div class="bullet-comment">需要法律依据支持</div>
      </div>
    `;
  }

  /**
   * Get detailed analysis HTML
   * @returns {string} HTML for detailed analysis
   */
  getDetailedAnalysisHTML() {
    const { sentiment, keyTopics, hotComments, qualityComments, controversialComments } = this.analysisData;
    
    return `
      <div class="detailed-analysis-container">
        <div class="analysis-card sentiment-card">
          <h4>情感分析</h4>
          <div class="sentiment-stats">
            <div class="sentiment-item positive">
              <span class="label">支持</span>
              <span class="value">${sentiment.positive}</span>
            </div>
            <div class="sentiment-item neutral">
              <span class="label">中性</span>
              <span class="value">${sentiment.neutral}</span>
            </div>
            <div class="sentiment-item negative">
              <span class="label">反对</span>
              <span class="value">${sentiment.negative}</span>
            </div>
          </div>
        </div>
        
        <div class="analysis-card topics-card">
          <h4>热门话题</h4>
          <div class="topics-list">
            ${keyTopics.map(({ topic, count }) => 
              `<div class="topic-item">
                <span class="topic-name">${topic}</span>
                <span class="topic-count">${count}次提及</span>
              </div>`
            ).join('')}
          </div>
        </div>
        
        <div class="analysis-card comments-card">
          <h4>评论质量</h4>
          <div class="quality-stats">
            <div class="quality-item">
              <span class="label">热门评论</span>
              <span class="value">${hotComments}</span>
            </div>
            <div class="quality-item">
              <span class="label">优质评论</span>
              <span class="value">${qualityComments}</span>
            </div>
            <div class="quality-item">
              <span class="label">争议评论</span>
              <span class="value">${controversialComments}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Toggle detailed analysis content
   */
  toggleDetailedAnalysis() {
    const detailedAnalysis = document.getElementById('detailed-analysis');
    const expandBtn = document.querySelector('.expand-replies-btn');
    
    if (!detailedAnalysis) return;

    const isExpanded = detailedAnalysis.style.display !== 'none';
    
    if (isExpanded) {
      detailedAnalysis.style.display = 'none';
      if (expandBtn) {
        expandBtn.querySelector('.expand-text').textContent = '展开详细分析';
        expandBtn.querySelector('.expand-icon').style.transform = 'rotate(0deg)';
      }
    } else {
      detailedAnalysis.style.display = 'block';
      if (expandBtn) {
        expandBtn.querySelector('.expand-text').textContent = '收起详细分析';
        expandBtn.querySelector('.expand-icon').style.transform = 'rotate(180deg)';
      }
    }
  }

  /**
   * Get current analysis data
   * @returns {Object} Current analysis data
   */
  getAnalysisData() {
    return { ...this.analysisData };
  }

  /**
   * Set analysis data
   * @param {Object} data - Analysis data to set
   */
  setAnalysisData(data) {
    this.analysisData = { ...this.analysisData, ...data };
    this.updateAnalysisDisplay();
  }

  /**
   * Destroy the controller and clean up
   */
  destroy() {
    this.isPanelVisible = false;
    this.analysisData = {
      totalComments: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      keyTopics: [],
      lastUpdated: null
    };
    this.isInitialized = false;
    console.log('AI Assistant controller destroyed');
  }
}

/**
 * Load AI assistant component HTML
 * @param {string} containerId - ID of the container element
 * @returns {Promise<boolean>} Success status
 */
export async function loadAIAssistantComponent(containerId = 'ai-assistant-container') {
  try {
    const response = await fetch('./components/ai-assistant/ai-panel.html');
    if (!response.ok) {
      throw new Error(`Failed to load AI assistant component: ${response.status}`);
    }
    
    const html = await response.text();
    const container = document.getElementById(containerId);
    
    if (!container) {
      throw new Error(`Container element with ID '${containerId}' not found`);
    }
    
    container.innerHTML = html;
    
    // Initialize the AI controller after loading HTML
    const controller = new AIController();
    
    // Make AIController methods available globally for HTML onclick handlers
    window.AIController = {
      toggleAIAssistant: () => controller.toggleAIAssistant(),
      updateAIAnalysis: () => controller.updateAIAnalysis(),
      toggleAISummary: () => controller.toggleAISummary(),
      toggleAIOverview: () => controller.toggleAIOverview(),
      refreshAISummary: () => controller.refreshAISummary(),
      toggleDetailedAIAnalysis: () => controller.toggleDetailedAIAnalysis(),
      toggleDetailedAnalysis: () => controller.toggleDetailedAnalysis(),
      getAnalysisData: () => controller.getAnalysisData(),
      setAnalysisData: (data) => controller.setAnalysisData(data)
    };
    
    console.log('AI Assistant component loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading AI assistant component:', error);
    
    // Fallback: create basic AI assistant structure
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div id="ai-assistant-panel" class="ai-assistant-panel" style="display: none;">
          <div class="ai-panel-header">
            <div class="ai-panel-title">
              <i class="fas fa-robot ai-icon"></i>
              <span>AI助手</span>
            </div>
            <button class="ai-panel-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="ai-panel-content">
            <p>AI助手功能加载中...</p>
          </div>
        </div>
        <div class="ai-assistant-toggle">
          <button id="ai-assistant-toggle-btn" class="ai-toggle-btn">
            <i class="fas fa-robot"></i>
            <span>AI助手</span>
          </button>
        </div>
      `;
      
      // Initialize controller with fallback HTML
      const controller = new AIController();
      
      // Make methods available globally even in fallback mode
      window.AIController = {
        toggleAIAssistant: () => controller.toggleAIAssistant(),
        updateAIAnalysis: () => controller.updateAIAnalysis(),
        toggleAISummary: () => controller.toggleAISummary(),
        toggleAIOverview: () => controller.toggleAIOverview(),
        refreshAISummary: () => controller.refreshAISummary(),
        toggleDetailedAIAnalysis: () => controller.toggleDetailedAIAnalysis(),
        toggleDetailedAnalysis: () => controller.toggleDetailedAnalysis(),
        getAnalysisData: () => controller.getAnalysisData(),
        setAnalysisData: (data) => controller.setAnalysisData(data)
      };
    }
    
    return false;
  }
}

// Export the controller class and create a singleton instance
export { AIController };

// Create and export a singleton instance for backward compatibility
export const aiController = new AIController();

// Export individual functions for backward compatibility
export const toggleAIAssistant = () => aiController.toggleAIAssistant();
export const updateAIAnalysis = () => aiController.updateAIAnalysis();
export const toggleAISummary = () => aiController.toggleAISummary();
export const toggleAIOverview = () => aiController.toggleAIOverview();
export const refreshAISummary = () => aiController.refreshAISummary();
export const toggleDetailedAIAnalysis = () => aiController.toggleDetailedAIAnalysis();
export const toggleDetailedAnalysis = () => aiController.toggleDetailedAnalysis();