# Design Document

## Overview

This design document outlines the systematic refactoring of a monolithic HTML file into a modular, maintainable web application. The refactoring will be conducted in phases to minimize risk and ensure functionality is preserved throughout the process.

## Architecture

### Target Architecture
```
project-root/
├── index.html (main entry point)
├── components/
│   ├── navbar/
│   │   ├── navbar.html
│   │   ├── navbar.css
│   │   └── navbar.js
│   ├── discussion/
│   │   ├── discussion-section.html
│   │   ├── discussion-section.css
│   │   └── discussion-section.js
│   ├── comments/
│   │   ├── comment-item.html
│   │   ├── comment-list.html
│   │   ├── comments.css
│   │   └── comments.js
│   └── ai-assistant/
│       ├── ai-panel.html
│       ├── ai-panel.css
│       └── ai-panel.js
├── assets/
│   ├── css/
│   │   ├── variables.css
│   │   ├── base.css
│   │   ├── layout.css
│   │   └── utilities.css
│   ├── js/
│   │   ├── main.js
│   │   ├── utils.js
│   │   └── data-manager.js
│   └── data/
│       ├── comments.json
│       ├── attachments.json
│       └── topic-info.json
└── build/
    └── build.js (simple build script)
```

### Component Hierarchy
1. **Main Container** (index.html)
   - **Navbar Component** (navigation, actions)
   - **Topic Info Section** (topic details, metadata)
   - **Discussion Section** (comments, interactions)
   - **AI Assistant Panel** (AI features, analysis)
   - **Comment Input** (user input interface)

## Components and Interfaces

### 1. Navbar Component
**Purpose:** Handle navigation and page actions
**Files:** `components/navbar/`
- `navbar.html` - Navigation structure
- `navbar.css` - Navigation styling
- `navbar.js` - Navigation interactions (back, more options, close)

**Interface:**
```javascript
// navbar.js exports
export const NavbarController = {
  showMoreOptions(),
  closeApp(),
  shareToFriend(),
  addToFavorites(),
  reportContent(),
  openSettings()
}
```

### 2. Discussion Section Component
**Purpose:** Manage the main discussion area and comment sorting
**Files:** `components/discussion/`
- `discussion-section.html` - Discussion container structure
- `discussion-section.css` - Discussion area styling
- `discussion-section.js` - Sorting and filtering logic

**Interface:**
```javascript
// discussion-section.js exports
export const DiscussionController = {
  sortComments(sortType),
  toggleDetailedComments(),
  updateCommentCount()
}
```

### 3. Comments Component
**Purpose:** Handle individual comments and comment interactions
**Files:** `components/comments/`
- `comment-item.html` - Single comment template
- `comment-list.html` - Comments container
- `comments.css` - Comment styling
- `comments.js` - Comment interactions

**Interface:**
```javascript
// comments.js exports
export const CommentsController = {
  toggleLike(element),
  toggleDislike(element),
  replyComment(element),
  sendFlower(button),
  toggleReplies(element),
  renderComments(commentsData)
}
```

### 4. AI Assistant Component
**Purpose:** Manage AI-powered features and analysis
**Files:** `components/ai-assistant/`
- `ai-panel.html` - AI assistant interface
- `ai-panel.css` - AI panel styling
- `ai-panel.js` - AI functionality

**Interface:**
```javascript
// ai-panel.js exports
export const AIController = {
  toggleAIAssistant(),
  updateAIAnalysis(),
  toggleAISummary(),
  refreshAISummary()
}
```

## Data Models

### Comment Data Structure
```javascript
{
  id: string,
  author: {
    name: string,
    avatar: string
  },
  content: string,
  timestamp: string,
  likes: number,
  dislikes: number,
  replies: Comment[],
  type: 'normal' | 'hot' | 'quality' | 'controversial',
  isAI: boolean
}
```

### Topic Data Structure
```javascript
{
  id: string,
  title: string,
  author: {
    name: string,
    avatar: string
  },
  status: 'active' | 'closed' | 'pending',
  timestamp: string,
  description: {
    background: string,
    coreIssue: string,
    controversy: string,
    keyQuestion: string,
    expectedResult: string
  },
  attachments: Attachment[]
}
```

### Attachment Data Structure
```javascript
{
  id: string,
  name: string,
  type: 'figma' | 'image' | 'document',
  url: string,
  thumbnail?: string,
  description?: string
}
```

## Error Handling

### Component Loading Errors
- Implement fallback content for failed component loads
- Log errors to console with component identification
- Graceful degradation when components fail to initialize

### Data Loading Errors
- Provide default/placeholder data when JSON files fail to load
- Display user-friendly error messages for network failures
- Implement retry mechanisms for critical data

### JavaScript Errors
- Wrap component initialization in try-catch blocks
- Prevent single component failures from breaking entire page
- Implement error boundaries for component isolation

## Testing Strategy

### Phase-by-Phase Testing
1. **CSS Extraction Testing**
   - Visual regression testing after each CSS file extraction
   - Cross-browser compatibility verification
   - Mobile responsiveness validation

2. **JavaScript Extraction Testing**
   - Functional testing of each extracted feature
   - Event handling verification
   - User interaction flow testing

3. **Component Integration Testing**
   - Component loading and initialization
   - Inter-component communication
   - Data flow validation

4. **Performance Testing**
   - Page load time comparison
   - JavaScript execution performance
   - Memory usage optimization

### Testing Tools
- Manual testing for visual verification
- Browser developer tools for debugging
- Simple automated tests for critical functionality

## Implementation Phases

### Phase 1: CSS Organization (Low Risk)
- Extract inline styles to separate CSS files
- Organize CSS into logical modules
- Maintain exact visual appearance

### Phase 2: JavaScript Extraction (Medium Risk)
- Move inline JavaScript to external files
- Group functions by functionality
- Preserve all existing behavior

### Phase 3: Content Separation (Medium Risk)
- Extract hardcoded content to JSON files
- Implement dynamic content loading
- Maintain content structure and formatting

### Phase 4: Component Creation (High Risk)
- Break HTML into component templates
- Implement component loading system
- Create component interfaces and controllers

### Phase 5: Build System (Low Risk)
- Create simple build script for development
- Implement file watching for auto-reload
- Add basic optimization for production

## Migration Strategy

### Backward Compatibility
- Keep original file as backup during refactoring
- Implement feature flags for gradual rollout
- Maintain identical user experience throughout process

### Rollback Plan
- Version control at each phase completion
- Quick rollback mechanism if issues arise
- Automated backup of working versions

### Validation Criteria
- Visual appearance must match exactly
- All interactive features must work identically
- Performance must not degrade significantly
- Code must be more maintainable and readable