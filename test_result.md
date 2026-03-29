#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Build UCC Connect - a comprehensive student companion app for the UCC Department of Information Technology. The app should include: Splash Screen, Home Dashboard, Faculty Directory with search/filter, Courses Catalog, Admissions, Social Media WebView, Resources, Announcements, Favorites, Consultation Request, Emergency Contacts, FAQ, Deadline Tracker, Personal Notes, and About Screen. Design should use UCC Navy (#0D2340) and Gold (#D4A017). Must include accessibility features like font scaling and high contrast mode."

backend:
  - task: "API - Faculty endpoints"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/faculty and GET /api/faculty/{id} endpoints working with seeded data"

  - task: "API - Courses endpoints"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/courses and GET /api/courses/{id} endpoints working with 10 IT courses"

  - task: "API - Announcements endpoint"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api/announcements returning seeded announcements"

  - task: "API - FAQs endpoint"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "API - Resources endpoint"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "API - Emergency Contacts endpoint"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "API - Deadlines endpoint"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "API - Notes CRUD endpoints"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "POST, GET, PUT, DELETE /api/notes endpoints implemented"

  - task: "Database seeding"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Auto-seeds 8 faculty, 10 courses, announcements, FAQs, resources, emergency contacts, deadlines"

frontend:
  - task: "Splash Screen"
    implemented: true
    working: true
    file: "frontend/app/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Animated splash with UCC branding, auto-redirects to tabs after 2.5s"

  - task: "Home Dashboard"
    implemented: true
    working: true
    file: "frontend/app/(tabs)/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Welcome banner, quick access cards, student tools, developer credits, FAB for email"

  - task: "Faculty Directory with search/filter"
    implemented: true
    working: true
    file: "frontend/app/(tabs)/faculty.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Search by name/specialization, filter by role, Call/Email/Consult actions, favorites"

  - task: "Faculty Detail Page"
    implemented: true
    working: true
    file: "frontend/app/faculty/[id].tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false

  - task: "Courses Catalog"
    implemented: true
    working: true
    file: "frontend/app/(tabs)/courses.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "10 courses displayed with code, title, credits, lecturer, favorites"

  - task: "Course Detail Page"
    implemented: true
    working: true
    file: "frontend/app/course/[id].tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Full course details with prerequisites, learning outcomes, assessment methods"

  - task: "More Screen with all sections"
    implemented: true
    working: true
    file: "frontend/app/(tabs)/more.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Grid with Announcements, Admissions, Social, Resources, Emergency, Deadlines, Notes, FAQ, Favorites, About"

  - task: "WebView for Social Media"
    implemented: true
    working: true
    file: "frontend/app/webview.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "In-app browser with navigation controls, error handling, external open option"

  - task: "Consultation Request"
    implemented: true
    working: true
    file: "frontend/app/consultation.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Form with student info, preferred time, message - opens email composer"

  - task: "Accessibility Settings"
    implemented: true
    working: true
    file: "frontend/app/settings.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Font size 100-170%, high contrast mode, reduced motion - persisted in AsyncStorage"

  - task: "Personal Notes"
    implemented: true
    working: true
    file: "frontend/app/note-editor.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "CRUD operations for notes with title/content, stored in backend database"

  - task: "Tab Navigation"
    implemented: true
    working: true
    file: "frontend/app/(tabs)/_layout.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Home, Faculty, Courses, More tabs with UCC styling"

  - task: "Settings Context Provider"
    implemented: true
    working: true
    file: "frontend/src/context/SettingsContext.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Font scale, high contrast, reduced motion, favorites management with AsyncStorage"

  - task: "Reusable Components"
    implemented: true
    working: true
    file: "frontend/src/components/"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Card, Button, ThemedText, LoadingScreen, ErrorScreen, EmptyState components"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "All API endpoints"
    - "Core screens rendering"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Initial MVP implementation complete. All screens implemented with UCC branding. Backend seeded with realistic data. Accessibility features working (font scale, high contrast). Ready for testing."
