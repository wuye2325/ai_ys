import {
    renderTopicInfo,
    renderAttachments,
    loadTopicInfo,
    loadAttachmentsData
} from '../../assets/js/data-manager.js';

export async function loadTopicInfoComponent(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found for TopicInfo component.`);
        return false;
    }

    try {
        // Load the component's HTML structure
        const response = await fetch('./components/topic-info/topic-info.html');
        if (!response.ok) {
            throw new Error('Failed to load topic-info.html');
        }
        container.innerHTML = await response.text();

        // Fetch and render data
        const [topicData, attachmentsData] = await Promise.all([
            loadTopicInfo(),
            loadAttachmentsData()
        ]);

        if (topicData) {
            renderTopicInfo(topicData);
        } else {
            console.error("Failed to load topic data.");
        }

        if (attachmentsData) {
            renderAttachments(attachmentsData);
        } else {
            console.error("Failed to load attachments data.");
        }

        console.log('TopicInfo component loaded and rendered successfully.');
        return true;
    } catch (error) {
        console.error('Error loading TopicInfo component:', error);
        container.innerHTML = '<p class="error-message">议题信息加载失败。</p>';
        return false;
    }
}