// AI Assistant component logic
import {
    loadTopicInfo
} from '../../assets/js/data-manager.js';

function renderAiAssistantData(data) {
    if (!data || !data.aiAnalysis) return;

    const aiData = data.aiAnalysis;

    document.getElementById('participant-count').textContent = aiData.stats.participants;
    document.getElementById('comment-count').textContent = aiData.stats.comments;
    document.getElementById('quality-score').textContent = aiData.stats.qualityScore;

    const tagsContainer = document.getElementById('ai-core-tags');
    tagsContainer.innerHTML = '';
    aiData.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'ai-tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });

    document.getElementById('ai-summary-text').textContent = aiData.summary;
}


export async function loadAiAssistantComponent(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found for AiAssistant component.`);
        return false;
    }

    try {
        const response = await fetch('./components/ai-assistant/ai-assistant.html');
        if (!response.ok) {
            throw new Error('Failed to load ai-assistant.html');
        }
        container.innerHTML = await response.text();

        const topicData = await loadTopicInfo();
        renderAiAssistantData(topicData);

        // Add event listeners for interactive elements
        const analysisBtn = document.getElementById('detailed-analysis-btn');
        if (analysisBtn) {
            analysisBtn.addEventListener('click', () => {
                alert('“一键分析评论”功能正在开发中！');
            });
        }

        console.log('AiAssistant component loaded successfully.');
        return true;
    } catch (error) {
        console.error('Error loading AiAssistant component:', error);
        container.innerHTML = '<p class="error-message">AI助手加载失败。</p>';
        return false;
    }
}