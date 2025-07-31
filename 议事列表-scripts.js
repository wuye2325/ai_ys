// 议事数据
const topicsData = [
  {
    id: 1,
    topicId: '1001',
    title: '小区停车位管理优化方案',
    summary: '针对小区停车位紧张、访客停车管理混乱的问题，提出系统性的停车位管理优化方案，包括访客停车区域规划、智能停车系统引入等措施。',
    status: 'ongoing',
    category: 'parking',
    author: '李小明',
    createTime: '2024-06-01 09:00',
    participants: 28,
    comments: 15,
    tags: ['停车管理', '访客停车', '智能化']
  },
  {
    id: 2,
    topicId: '1002',
    title: '小区安防系统升级改造',
    summary: '为提升小区安全防范能力，建议对现有安防系统进行全面升级，包括增设高清监控、人脸识别门禁、智能报警系统等。',
    status: 'voting',
    category: 'security',
    author: '王大华',
    createTime: '2024-05-28 14:30',
    participants: 45,
    comments: 23,
    tags: ['安防升级', '监控系统', '门禁改造']
  },
  {
    id: 5,
    topicId: '1005',
    title: '小区电梯维护费用分摊',
    summary: '针对小区电梯老化需要大修的情况，讨论维护费用的合理分摊方案，确保电梯安全运行。',
    status: 'seconding',
    category: 'maintenance',
    author: '陈工程师',
    createTime: '2024-05-30 11:45',
    participants: 32,
    comments: 18,
    tags: ['电梯维护', '费用分摊', '安全保障']
  },
  {
    id: 3,
    topicId: '1003',
    title: '小区绿化环境改善计划',
    summary: '针对小区绿化老化、景观单调的问题，制定绿化环境改善计划，包括补种花草树木、增设休闲座椅、改造儿童游乐区等。',
    status: 'completed',
    category: 'environment',
    author: '张美丽',
    createTime: '2024-05-20 10:15',
    participants: 67,
    comments: 31,
    tags: ['绿化改造', '环境美化', '休闲设施']
  },
  {
    id: 4,
    topicId: '1004',
    title: '物业费调整方案讨论',
    summary: '根据物价上涨和服务成本增加的实际情况，讨论物业费适度调整方案，确保物业服务质量的持续提升。',
    status: 'ongoing',
    category: 'management',
    author: '刘管家',
    createTime: '2024-05-25 16:20',
    participants: 89,
    comments: 42,
    tags: ['物业费', '服务质量', '成本调整']
  },
  {
    id: 5,
    topicId: '1005',
    title: '小区健身设施增设建议',
    summary: '为满足业主健身需求，建议在小区空地增设户外健身器材，包括跑步机、单杠双杠、乒乓球台等设施。',
    status: 'voting',
    category: 'facilities',
    author: '陈健身',
    createTime: '2024-05-22 08:45',
    participants: 34,
    comments: 18,
    tags: ['健身设施', '户外器材', '运动空间']
  },
  {
    id: 6,
    topicId: '1006',
    title: '小区垃圾分类管理优化',
    summary: '完善垃圾分类设施配置，加强分类宣传教育，建立垃圾分类监督机制，提升小区环境卫生水平。',
    status: 'archived',
    category: 'environment',
    author: '环保小卫士',
    createTime: '2024-04-15 11:30',
    participants: 52,
    comments: 26,
    tags: ['垃圾分类', '环保管理', '卫生改善']
  }
];

// 当前筛选条件
let currentFilter = 'all';
let currentSort = 'createTime-desc';
let currentPage = 1;
const pageSize = 10;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
  renderTopicList();
  initializeFilters();
  initializeSearch();
});

// 渲染议事列表
function renderTopicList(filter = 'all', searchKeyword = '', sort = currentSort) {
  const container = document.getElementById('topic-list');
  let filteredTopics = [...topicsData];
  
  // 应用筛选
  if (filter !== 'all') {
    filteredTopics = filteredTopics.filter(topic => topic.status === filter);
  }
  
  // 应用搜索
  if (searchKeyword) {
    filteredTopics = filteredTopics.filter(topic => 
      topic.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      topic.summary.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()))
    );
  }
  
  // 应用排序
  filteredTopics = sortTopics(filteredTopics, sort);
  
  container.innerHTML = '';
  
  filteredTopics.forEach(topic => {
    const topicCard = createTopicCard(topic);
    container.appendChild(topicCard);
  });
  
  // 如果没有结果，显示空状态
  if (filteredTopics.length === 0) {
    container.innerHTML = `
      <div class="bleed-card bg-white p-8 text-center">
        <div class="text-gray-400 mb-2">
          <img src="assets/lficon/search-24-outline.svg" alt="搜索" class="w-12 h-12 mx-auto opacity-40">
        </div>
        <div class="text-gray-500">暂无相关议事</div>
      </div>
    `;
  }
}

// 创建议事卡片
function createTopicCard(topic) {
  const card = document.createElement('div');
  card.className = 'topic-card bleed-card';
  card.onclick = () => openTopicDetail(topic.id);
  
  // 生成标签HTML
  const tagsHtml = topic.tags ? topic.tags.map(tag => 
    `<span class="topic-tag">#${tag}</span>`
  ).join('') : '';
  
  // 生成活跃度火焰
  const activityLevel = Math.floor(Math.random() * 5) + 1; // 1-5级活跃度
  const fireIcons = Array.from({length: 5}, (_, i) => {
    const color = i < activityLevel ? '#FF6B35' : '#E2E8F0';
    return `<i class="fas fa-fire" style="color: ${color}; font-size: 11px;"></i>`;
  }).join('');
  
  card.innerHTML = `
    <div class="topic-title" style="display: flex; align-items: center; gap: 8px;">
      <span style="flex: 1;">${topic.title}</span>
      <div style="display: flex; gap: 2px; align-items: center;">
        ${fireIcons}
      </div>
    </div>
    <div class="topic-summary">${topic.summary}</div>
    ${tagsHtml ? `<div class="topic-tags">${tagsHtml}</div>` : ''}
    <div class="topic-meta">
      <div class="topic-meta-left">
        <div class="topic-meta-item">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="头像" style="width: 16px; height: 16px; border-radius: 50%; object-fit: cover;">
          <span>${topic.author}</span>
        </div>
        <div class="topic-meta-item">
          <img src="assets/lficon/clock.svg" class="w-4 h-4" alt="时间">
          <span>${formatTime(topic.createTime)}</span>
        </div>

      </div>
      ${getActionButton(topic.status)}
    </div>
  `;
  
  return card;
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'ongoing': '进行中',
    'voting': '投票中',
    'completed': '已完成',
    'archived': '已归档'
  };
  return statusMap[status] || status;
}

// 获取操作按钮
function getActionButton(status) {
  switch(status) {
    case 'ongoing':
      return `<button class="action-btn btn-discuss" onclick="handleDiscuss(event)">
        <i class="fas fa-comments"></i>
        参与讨论
      </button>`;
    case 'voting':
      return `<button class="action-btn btn-vote" onclick="handleVote(event)">
        <i class="fas fa-vote-yea"></i>
        去投票
      </button>`;
    case 'seconding':
      return `<div class="status-completed">
        <i class="fas fa-check-circle"></i>
        已完成
      </div>`;
    case 'completed':
      return `<div class="status-completed">
        <i class="fas fa-check-circle"></i>
        已完成
      </div>`;
    default:
      return `<div class="status-completed">
        <i class="fas fa-check-circle"></i>
        已完成
      </div>`;
  }
}

// 按钮点击事件处理
function handleDiscuss(event) {
  event.stopPropagation();
  // 这里可以添加跳转到讨论页面的逻辑
  console.log('参与讨论');
  // window.location.href = 'topic-detail.html';
}

function handleVote(event) {
  event.stopPropagation();
  // 这里可以添加跳转到投票页面的逻辑
  console.log('去投票');
  // window.location.href = 'voting.html';
}

// 附议功能已移除

// 格式化时间
function formatTime(timeStr) {
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else {
    return `${days}天前`;
  }
}

// 排序函数
function sortTopics(topics, sortType) {
  const [field, order] = sortType.split('-');
  
  return topics.sort((a, b) => {
    let valueA, valueB;
    
    switch (field) {
      case 'createTime':
        valueA = new Date(a.createTime);
        valueB = new Date(b.createTime);
        break;
      case 'participants':
        valueA = a.participants;
        valueB = b.participants;
        break;
      case 'comments':
        valueA = a.comments;
        valueB = b.comments;
        break;
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (order === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
}

// 初始化筛选功能
function initializeFilters() {
  const filterTags = document.querySelectorAll('.filter-tag');
  
  filterTags.forEach(tag => {
    tag.addEventListener('click', function() {
      // 移除所有active类
      filterTags.forEach(t => t.classList.remove('active'));
      // 添加active类到当前标签
      this.classList.add('active');
      
      // 获取筛选条件
      const filter = this.dataset.filter;
      currentFilter = filter;
      
      // 重新渲染列表
      renderTopicList(filter);
    });
  });
}

// 初始化搜索功能
function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  
  searchInput.addEventListener('input', function() {
    const keyword = this.value.trim();
    renderTopicList(currentFilter, keyword);
  });
  
  // 搜索历史标签点击
  const searchTags = document.querySelectorAll('.search-tag');
  searchTags.forEach(tag => {
    tag.addEventListener('click', function() {
      const keyword = this.textContent;
      searchInput.value = keyword;
      renderTopicList(currentFilter, keyword);
      hideSearchModal();
    });
  });
}

// 打开议事详情
function openTopicDetail(topicId) {
  // 这里可以跳转到具体的议事详情页面
  window.location.href = `topic-detail.html?id=${topicId}`;
}

// 创建新议事
function createNewTopic() {
  // 这里可以跳转到创建议事页面
  window.location.href = 'publish.html';
}

// 显示筛选弹窗
function showFilterModal() {
  const modal = document.getElementById('filter-modal');
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// 隐藏筛选弹窗
function hideFilterModal() {
  const modal = document.getElementById('filter-modal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

// 显示搜索弹窗
function showSearchModal() {
  const modal = document.getElementById('search-modal');
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // 自动聚焦搜索输入框
  setTimeout(() => {
    document.getElementById('search-input').focus();
  }, 350);
}

// 隐藏搜索弹窗
function hideSearchModal() {
  const modal = document.getElementById('search-modal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

// 显示排序弹窗
function showSortModal() {
  const modal = document.getElementById('sort-modal');
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// 隐藏排序弹窗
function hideSortModal() {
  const modal = document.getElementById('sort-modal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

// 重置排序
function resetSort() {
  const defaultRadio = document.querySelector('input[name="sort"][value="createTime-desc"]');
  if (defaultRadio) {
    defaultRadio.checked = true;
  }
}

// 应用排序
function applySort() {
  const selectedSort = document.querySelector('input[name="sort"]:checked');
  if (selectedSort) {
    currentSort = selectedSort.value;
    renderTopicList(currentFilter, '', currentSort);
  }
  hideSortModal();
}

// 执行搜索
function performSearch() {
  const keyword = document.getElementById('search-input').value.trim();
  if (keyword) {
    renderTopicList(currentFilter, keyword);
    hideSearchModal();
  }
}

// 重置筛选条件
function resetFilters() {
  const checkboxes = document.querySelectorAll('#filter-modal input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
}

// 应用筛选条件
function applyFilters() {
  const statusFilters = [];
  const categoryFilters = [];
  
  // 获取选中的状态筛选
  const statusCheckboxes = document.querySelectorAll('#filter-modal input[value="ongoing"], #filter-modal input[value="voting"], #filter-modal input[value="completed"]');
  statusCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      statusFilters.push(checkbox.value);
    }
  });
  
  // 获取选中的分类筛选
  const categoryCheckboxes = document.querySelectorAll('#filter-modal input[value="parking"], #filter-modal input[value="security"], #filter-modal input[value="environment"]');
  categoryCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      categoryFilters.push(checkbox.value);
    }
  });
  
  // 应用复合筛选（这里简化处理，实际项目中可以更复杂）
  let filteredTopics = topicsData;
  
  if (statusFilters.length > 0) {
    filteredTopics = filteredTopics.filter(topic => statusFilters.includes(topic.status));
  }
  
  if (categoryFilters.length > 0) {
    filteredTopics = filteredTopics.filter(topic => categoryFilters.includes(topic.category));
  }
  
  // 重新渲染列表
  const container = document.getElementById('topic-list');
  container.innerHTML = '';
  
  filteredTopics.forEach(topic => {
    const topicCard = createTopicCard(topic);
    container.appendChild(topicCard);
  });
  
  hideFilterModal();
}

// 加载更多
document.getElementById('load-more-btn').addEventListener('click', function() {
  const button = this;
  const originalText = button.innerHTML;
  
  // 显示加载状态
  button.innerHTML = '<div class="loading"></div> 加载中...';
  button.disabled = true;
  
  // 模拟加载延迟
  setTimeout(() => {
    // 这里可以加载更多数据
    button.innerHTML = originalText;
    button.disabled = false;
    
    // 显示提示
    showToast('暂无更多数据');
  }, 1500);
});

// 显示提示消息
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.top = '50%';
  toast.style.left = '50%';
  toast.style.transform = 'translate(-50%, -50%)';
  toast.style.background = 'rgba(0, 0, 0, 0.8)';
  toast.style.color = 'white';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '14px';
  toast.style.zIndex = '9999';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // 显示动画
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // 隐藏动画
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}

// 点击弹窗背景关闭弹窗
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    if (e.target.id === 'filter-modal') {
      hideFilterModal();
    } else if (e.target.id === 'search-modal') {
      hideSearchModal();
    } else if (e.target.id === 'sort-modal') {
      hideSortModal();
    }
  }
});

// 搜索输入框回车搜索
document.getElementById('search-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    performSearch();
  }
});