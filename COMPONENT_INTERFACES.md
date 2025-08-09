# Component Interfaces and Usage Guide

This document provides detailed information about component interfaces, usage patterns, and integration guidelines for the HTML Refactoring Project.

## Component Interface Standards

### Component File Structure
Each component must follow this structure:
```
component-name/
├── component-name.html    # Template file
├── component-name.css     # Styles file
└── component-name.js      # Logic file
```

### Component Configuration
Components are configured in `assets/js/main.js`:

```javascript
const COMPONENTS = {
  componentName: {
    containerId: 'component-container',     // Required: DOM container ID
    htmlPath: './components/path/file.html', // Required: HTML template path
    cssPath: './components/path/file.css',   // Optional: CSS file path
    jsPath: './components/path/file.js',     // Optional: JS file path
    required: true                           // Required: Whether component is critical
  }
};
```

## Component Interfaces

### 1. Navbar Component

#### Purpose
Provides navigation controls and app-level actions.

#### Container
```html
<div id="navbar-container"></div>
```

#### Configuration
```javascript
navbar: {
  containerId: 'navbar-container',
  htmlPath: './components/navbar/navbar.html',
  cssPath: './components/navbar/navbar.css',
  jsPath: './components/navbar/navbar.js',
  required: true
}
```

#### Public Methods
- `showMoreOptions()`: Display additional menu options
- `closeApp()`: Handle app closure
- `navigateBack()`: Handle back navigation

#### Events Dispatched
- `navbar:optionsShown`: When options menu is displayed
- `navbar:backPressed`: When back button is pressed

#### CSS Classes
- `.navbar`: Main navbar container
- `.navbar-back`: Back button
- `.navbar-title`: Title text
- `.navbar-actions`: Action buttons container

#### Fallback Behavior
Displays basic navigation with essential functions when component fails to load.

---

### 2. Discussion Component

#### Purpose
Manages discussion section display and comment sorting.

#### Container
```html
<div id="discussion-container"></div>
```

#### Configuration
```javascript
discussion: {
  containerId: 'discussion-container',
  htmlPath: './components/discussion/discussion-section.html',
  cssPath: './components/discussion/discussion-section.css',
  jsPath: './components/discussion/discussion-section.js',
  required: true
}
```

#### Public Methods
- `sortComments(criteria)`: Sort comments by specified criteria
- `toggleView(viewType)`: Switch between different view modes
- `refreshDiscussion()`: Reload discussion content

#### Events Dispatched
- `discussion:sorted`: When comments are sorted
- `discussion:viewChanged`: When view mode changes

#### CSS Classes
- `.discussion-section`: Main discussion container
- `.discussion-header`: Header section
- `.discussion-actions`: Action buttons
- `.sort-controls`: Sorting controls

#### Data Dependencies
- Requires comment data from `assets/data/comments.json`
- Integrates with Comments component for display

#### Fallback Behavior
Shows simple comment list with basic functionality when component fails.

---

### 3. Comments Component

#### Purpose
Displays and manages individual comments and interactions.

#### Container
```html
<div id="comments-container"></div>
```

#### Configuration
```javascript
comments: {
  containerId: 'comments-container',
  htmlPath: './components/comments/comment-list.html',
  cssPath: './components/comments/comments.css',
  jsPath: './components/comments/comments.js',
  required: true
}
```

#### Public Methods
- `toggleLike(commentId)`: Toggle like status for comment
- `toggleDislike(commentId)`: Toggle dislike status for comment
- `replyComment(commentId)`: Open reply interface
- `toggleReplies(commentId)`: Show/hide comment replies
- `sendFlower(commentId)`: Send flower reaction

#### Events Dispatched
- `comment:liked`: When comment is liked
- `comment:disliked`: When comment is disliked
- `comment:replied`: When reply is submitted
- `comment:flowerSent`: When flower is sent

#### CSS Classes
- `.comment-item`: Individual comment container
- `.comment-content`: Comment text content
- `.comment-actions`: Action buttons
- `.comment-replies`: Replies container
- `.comment-author`: Author information

#### Data Structure
```javascript
{
  id: "string",
  author: {
    name: "string",
    avatar: "string"
  },
  content: "string",
  timestamp: "string",
  likes: number,
  dislikes: number,
  replies: Array,
  tags: Array
}
```

#### Fallback Behavior
Displays read-only comment list when component fails to load.

---

### 4. AI Assistant Component

#### Purpose
Provides AI-powered content analysis and suggestions.

#### Container
```html
<div id="ai-assistant-container"></div>
```

#### Configuration
```javascript
aiAssistant: {
  containerId: 'ai-assistant-container',
  htmlPath: './components/ai-assistant/ai-panel.html',
  cssPath: './components/ai-assistant/ai-panel.css',
  jsPath: './components/ai-assistant/ai-panel.js',
  required: false
}
```

#### Public Methods
- `toggleAIAssistant()`: Show/hide AI panel
- `updateAIAnalysis()`: Refresh AI analysis
- `generateSummary()`: Create content summary
- `provideSuggestions()`: Get AI suggestions

#### Events Dispatched
- `ai:panelToggled`: When AI panel visibility changes
- `ai:analysisUpdated`: When analysis is refreshed
- `ai:summaryGenerated`: When summary is created

#### CSS Classes
- `.ai-assistant`: Main AI panel container
- `.ai-content`: AI-generated content
- `.ai-controls`: Control buttons
- `.ai-summary`: Summary section

#### Fallback Behavior
Hidden when component fails to load (non-critical component).

## Component Loading Lifecycle

### 1. Initialization Phase
```javascript
// Component loader initialization
const componentLoader = new ComponentLoader();
await componentLoader.init();
```

### 2. Loading Sequence
1. **Validation**: Check container existence
2. **CSS Loading**: Load stylesheets (non-blocking)
3. **HTML Loading**: Fetch and inject templates
4. **JS Loading**: Load and execute component logic
5. **Registration**: Register component in system
6. **Event Dispatch**: Notify system of completion

### 3. Error Handling
```javascript
// Automatic error handling with fallbacks
try {
  await componentLoader.loadComponent('navbar', config);
} catch (error) {
  // Fallback content is automatically provided
  console.error('Component failed:', error);
}
```

## Integration Patterns

### Component Communication

#### Event-Based Communication
```javascript
// Dispatch custom events
document.dispatchEvent(new CustomEvent('component:action', {
  detail: { data: 'value' }
}));

// Listen for events
document.addEventListener('component:action', (event) => {
  console.log('Received:', event.detail);
});
```

#### Direct Method Calls
```javascript
// Access component methods via global references
if (window.NavbarController) {
  window.NavbarController.showMoreOptions();
}
```

### Data Management

#### Loading Data
```javascript
// Use data manager for consistent data loading
import { loadAndRenderAllContent } from './assets/js/data-manager.js';

await loadAndRenderAllContent();
```

#### Data Binding
```javascript
// Bind data to component elements
function bindCommentData(comment, element) {
  element.querySelector('.comment-author').textContent = comment.author.name;
  element.querySelector('.comment-content').textContent = comment.content;
}
```

### Error Handling Integration

#### Component-Level Error Handling
```javascript
// Use error handler for consistent error management
window.ErrorHandler?.safeAsync(async () => {
  // Component operation
}, 'ComponentName', fallbackValue);
```

#### Logging Integration
```javascript
// Use logger for debugging and monitoring
window.Logger?.info('ComponentName', 'Operation completed');
window.Logger?.error('ComponentName', 'Operation failed', error);
```

## Best Practices

### Component Development

1. **Separation of Concerns**
   - Keep HTML semantic and accessible
   - Use CSS for styling only
   - Handle logic in JavaScript

2. **Error Resilience**
   - Always include error handling
   - Provide meaningful fallbacks
   - Log errors for debugging

3. **Performance**
   - Lazy load non-critical components
   - Minimize DOM manipulation
   - Use event delegation

4. **Accessibility**
   - Include ARIA attributes
   - Support keyboard navigation
   - Provide screen reader support

### Integration Guidelines

1. **Consistent Interfaces**
   - Follow naming conventions
   - Use standard event patterns
   - Maintain API consistency

2. **Graceful Degradation**
   - Ensure core functionality works without JavaScript
   - Provide fallback content
   - Handle missing dependencies

3. **Testing**
   - Test component isolation
   - Verify integration points
   - Check error scenarios

## Debugging and Troubleshooting

### Component Status Checking
```javascript
// Check component loading status
const stats = window.ComponentLoader.stats();
console.log('Loaded components:', stats);

// Check specific component
const isLoaded = window.ComponentLoader.instance.isComponentLoaded('navbar');
console.log('Navbar loaded:', isLoaded);
```

### Log Analysis
```javascript
// Get component-specific logs
const logs = window.Logger.getComponentLogs('ComponentName');
console.log('Component logs:', logs);

// Export all logs
const allLogs = window.Logger.exportLogs();
console.log('All logs:', allLogs);
```

### Error Recovery
```javascript
// Reload failed component
await window.ComponentLoader.instance.reloadComponent('componentName');

// Reload all components
await window.ComponentLoader.reload();
```

## Migration Guide

### Adding New Components

1. **Create Component Files**
   ```bash
   mkdir components/new-component
   touch components/new-component/new-component.html
   touch components/new-component/new-component.css
   touch components/new-component/new-component.js
   ```

2. **Add Configuration**
   ```javascript
   // In assets/js/main.js
   const COMPONENTS = {
     // ... existing components
     newComponent: {
       containerId: 'new-component-container',
       htmlPath: './components/new-component/new-component.html',
       cssPath: './components/new-component/new-component.css',
       jsPath: './components/new-component/new-component.js',
       required: false
     }
   };
   ```

3. **Add Container to HTML**
   ```html
   <!-- In index.html -->
   <div id="new-component-container"></div>
   ```

### Modifying Existing Components

1. **Update Component Files**: Modify HTML, CSS, or JS as needed
2. **Test Integration**: Ensure changes don't break other components
3. **Update Documentation**: Reflect changes in this document
4. **Test Error Scenarios**: Verify fallback behavior still works

---

This document serves as the definitive guide for component interfaces and integration patterns. Keep it updated as components evolve.