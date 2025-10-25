# Educational Support Prediction System - Features

## Core Functionality

### 1. Performance Prediction Engine

The system uses multiple data points to predict when students need support:

- **Weekly Performance Tracking:** Automatically calculates average grades and completion rates each week
- **Decline Detection:** Flags students with 10% or greater performance decline week-over-week
- **Risk Classification:** Categorizes students as low, medium, or high risk
- **Historical Pattern Matching:** Compares current class performance with historical data from past semesters

### 2. Data Collection

The system collects and analyzes:

- **Grades:** Individual assignment scores and overall averages
- **Assignment Completion:** Tracks completed, late, missing, and pending assignments
- **Teacher Comments:** Stores feedback on individual assignments
- **Upcoming Assignments:** Monitors due dates and workload
- **Historical Trends:** Records which assignments historically caused difficulty

### 3. Student Portal Features

**Dashboard Overview:**
- Performance trend visualization (line chart showing grades and completion rate)
- Current risk level indicator with alerts
- Upcoming assignments list
- Study tips specific to struggling subjects

**Assignments View:**
- Complete assignment history with grades
- Status indicators (completed, pending, late, missing)
- Subject categorization
- Due date tracking

**Study Tips:**
- Subject-specific recommendations
- Triggered when performance declines by 10% or more
- Expandable sections for each subject
- Based on educational best practices

**Messaging:**
- Direct communication with teachers
- Conversation threads
- Unread message indicators
- Send and receive capabilities

### 4. Teacher Portal Features

**At-Risk Students Dashboard:**
- Visual cards for each at-risk student
- Risk level badges (high/medium)
- Performance decline percentage
- Current vs previous week statistics
- List of challenging upcoming assignments
- Quick message button

**Class Management:**
- Overview of all classes
- Student count per class
- Assignment count tracking
- Subject categorization

**Messaging:**
- Communicate with individual students
- View conversation history
- Organize messages by student
- Quick access to at-risk student messaging

### 5. Prediction Algorithm

The system uses a multi-factor approach:

1. **Performance Snapshots:** Weekly calculations of:
   - Average grade across all assignments
   - Completion rate (completed/total assignments)
   - Number of assignments completed vs total

2. **Decline Detection:**
   - Compares current week to previous week
   - Triggers alert at 10% or greater decline
   - Tracks trend direction (improving/declining/stable)

3. **Historical Analysis:**
   - Identifies assignments where >30% of past students struggled
   - Flags these as "at-risk assignments"
   - Provides proactive warnings

4. **Risk Scoring:**
   - **High Risk:** >20% decline OR multiple challenging assignments ahead
   - **Medium Risk:** 10-20% decline OR 1-2 challenging assignments
   - **Low Risk:** <10% decline and no concerning patterns

### 6. Study Tips System

Provides targeted advice based on subject:

- **Math:** Problem-solving strategies, formula review, visual aids
- **Science:** Concept mapping, hands-on learning, lab preparation
- **English:** Active reading, writing practice, vocabulary building
- **History:** Timeline creation, source analysis, connection to modern events
- **General:** Study habits, time management, active recall techniques

### 7. Real-Time Messaging

- Bidirectional communication between students and teachers
- Persistent conversation threads
- Read/unread status tracking
- Searchable message history
- Organized by conversation partner

## Technical Features

- **RESTful API:** Clean, well-documented endpoints
- **SQLAlchemy ORM:** Type-safe database operations
- **React Components:** Modular, reusable UI elements
- **Responsive Design:** Works on desktop and mobile
- **Performance Optimization:** Efficient queries and caching
- **Data Visualization:** Charts for trend analysis
- **Flask-CORS:** Cross-origin resource sharing enabled

## Future Enhancement Possibilities

- Real-time notifications (WebSocket integration)
- Email alerts for high-risk students
- Parent portal access
- Assignment submission through the platform
- AI-powered study tip personalization
- Predictive analytics for semester performance
- Integration with learning management systems (LMS)
- Mobile application
- Advanced analytics dashboard for administrators