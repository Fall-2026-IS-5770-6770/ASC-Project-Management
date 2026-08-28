# ASC Project Management Platform

A centralized project management and collaboration platform for the **Analytics Solutions Center (ASC)** at Utah State University.

The ASC provides students with hands-on experience working on real-world data and technology projects with corporate, government, and nonprofit partners. Projects are supported by faculty mentors and may involve data analytics, data engineering, business intelligence, machine learning, software development, dashboards, and other technical solutions.

This application is designed to bring the ASC's project management workflow into a single platform rather than requiring teams to coordinate across multiple disconnected tools.

---

## Purpose

The ASC manages multiple projects simultaneously, each involving some combination of:

* Project managers
* Faculty mentors
* Student team members
* Project sponsors
* Technical contributors
* Project tasks and deliverables
* Meetings and communication
* Documentation
* Project timelines
* Status updates

The goal of this application is to provide a **single source of truth for ASC projects**.

Instead of managing projects across separate project boards, chat applications, documents, and spreadsheets, the platform connects the major pieces of project management together.

---

## Core Concept

The application has two primary levels of project management:

### 1. Master Project Board

The **Master Board** provides an organization-wide view of every ASC project.

Projects can move through a workflow such as:

```text
Backlog
   ↓
Planning
   ↓
In Progress
   ↓
On Hold
   ↓
Completed
```

The Master Board allows ASC leadership and project managers to see the state of the entire project portfolio at a glance.

### 2. Individual Project Workspaces

When a project moves into **In Progress**, the system automatically creates a dedicated project workspace.

Each project workspace contains:

* A project-specific task board
* Project-specific channels
* Team members
* Project information
* Project activity
* Project files and documentation
* Project milestones
* Project status

The project workspace becomes the team's central location for completing the project.

---

# Project Lifecycle

The central workflow of the application is the transition from a project in the Master Board to an active project workspace.

```text
                    MASTER BOARD
                         │
                         ▼
                  ┌──────────────┐
                  │    Backlog   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   Planning   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  In Progress │
                  └──────┬───────┘
                         │
                         │ Automatically creates
                         ▼
              ┌────────────────────────┐
              │    PROJECT WORKSPACE   │
              ├────────────────────────┤
              │                        │
              │  Task Board             │
              │  Channels               │
              │  Team Members           │
              │  Milestones             │
              │  Documentation         │
              │  Activity               │
              │                        │
              └───────────┬────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  Completed   │
                  └──────────────┘
```

The Master Board should remain focused on **portfolio-level management**, while individual project boards handle the details of actually completing the work.

---

# Features

## Master Project Board

The Master Board provides an organization-wide overview of ASC projects.

Each project card may contain:

* Project name
* Project sponsor
* Project manager
* Faculty mentor
* Project type
* Assigned team
* Current status
* Priority
* Start date
* Target completion date
* Progress
* Description

Example:

```text
┌─────────────────────────────────────┐
│ ACME Sales Dashboard                │
│                                     │
│ Sponsor: ACME Corp                  │
│ Mentor: Jane Smith                  │
│ Team: 4 Students                    │
│                                     │
│ Status: IN PROGRESS                 │
│ Priority: High                      │
│                                     │
│ ███████████░░░░ 70%                 │
└─────────────────────────────────────┘
```

---

## Automatic Project Creation

Moving a project into **In Progress** triggers project initialization.

The system creates:

1. A project workspace
2. A project task board
3. A default project channel
4. Project membership
5. Default workflow columns
6. Project activity tracking

For example:

```text
Master Board
     │
     │ Move "ACME Dashboard"
     │ to In Progress
     ▼
Project Creation Event
     │
     ├── Create Project
     ├── Create Task Board
     ├── Create #general Channel
     ├── Add Project Members
     └── Initialize Default Columns
```

The project should only be initialized once. Moving a project between statuses should not accidentally create duplicate workspaces.

---

# Project Boards

Project boards provide a Trello-style interface for managing tasks.

A default board might contain:

```text
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│   Backlog  │ │  To Do     │ │ In Progress│ │  Complete  │
├────────────┤ ├────────────┤ ├────────────┤ ├────────────┤
│ Task       │ │ Task       │ │ Task       │ │ Task       │
│ Task       │ │ Task       │ │ Task       │ │ Task       │
│ Task       │ │            │ │ Task       │ │ Task       │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

Tasks should support:

* Title
* Description
* Assignee
* Due date
* Priority
* Labels
* Status
* Comments
* Attachments
* Checklist/subtasks
* Activity history

Tasks can be moved between columns using drag and drop.

---

# Project Channels

Each project has Slack-like channels for team communication.

For example:

```text
ACME Dashboard
│
├── #general
├── #development
├── #data
├── #meetings
└── #random
```

Channels provide a place for project-specific conversations without mixing project communication with conversations from other projects.

Messages should support:

* Text
* Replies/threads
* Mentions
* Reactions
* File attachments
* Links to tasks
* Links to project resources

A major goal is to connect communication to project work.

For example, a message could reference a task:

```text
@Alex finished the API endpoint.

[Task #142: Create Customer API Endpoint]
```

---

# Project Dashboard

Every project should have a dashboard providing a high-level view of the project's health.

Example:

```text
ACME Dashboard

Status       In Progress
Progress     72%
Team         5 members
Mentor       Jane Smith
PM           John Doe

Upcoming
────────────────────────────
API Integration       Sep 2
Client Demo           Sep 6
Final Dashboard       Sep 15

Task Progress
────────────────────────────
Completed             34
In Progress            8
To Do                  12
Blocked                3

Recent Activity
────────────────────────────
Alex completed API task
Maria created dashboard ticket
John posted meeting notes
```

---

# Project Members

Projects should support different roles.

Possible roles include:

### ASC Administrator

Organization-wide access.

Can:

* Create and manage projects
* Manage users
* Manage project statuses
* View all projects
* Manage project memberships
* Configure system settings

### Project Manager

Responsible for coordinating an individual project.

Can:

* Manage project members
* Create and assign tasks
* Manage project boards
* Create channels
* Update project status
* View project activity

### Faculty Mentor

Provides project oversight and guidance.

Can:

* View project activity
* Participate in channels
* Review tasks
* Provide feedback
* Monitor project progress

### Student

Works on project tasks.

Can:

* View assigned projects
* Create/update tasks
* Participate in channels
* Comment on tasks
* Upload project resources

### Sponsor

External project stakeholder.

Depending on the final implementation, sponsors may receive limited project access for:

* Reviewing progress
* Communicating with the team
* Reviewing deliverables
* Providing feedback

---

# Portfolio Management

The Master Board should eventually provide more than a Kanban view.

ASC leadership should be able to answer questions such as:

* How many projects are currently active?
* Which projects are blocked?
* Which projects are approaching their deadlines?
* Who is assigned to each project?
* Which students are working on multiple projects?
* Which projects have not had recent activity?
* Which projects are approaching completion?
* Which projects are waiting for a sponsor response?

Potential portfolio views include:

* Kanban
* Table
* Calendar
* Timeline
* Dashboard
* Project workload

---

# Notifications

The application should provide notifications for important events.

Examples:

* Task assigned to you
* Task mentioned you
* New channel message
* Reply to your message
* Task approaching deadline
* Task overdue
* Project status changed
* Project member added
* Project marked blocked
* Project completed

Notifications should be scoped appropriately so users aren't overwhelmed by activity from projects they aren't involved with.

---

# Activity History

Important project actions should be recorded.

Example:

```text
Aug 28, 3:42 PM
Alex moved "Build API" from To Do → In Progress

Aug 28, 2:15 PM
Maria assigned "Dashboard Design" to Alex

Aug 27, 4:02 PM
John changed project status to In Progress

Aug 27, 3:45 PM
Project workspace created
```

This provides an audit trail and makes it easier to understand how a project has progressed.

---

# Proposed Data Model

A simplified relational model could look like:

```text
User
 │
 ├──────────────┐
 │              │
 ▼              ▼
ProjectMember   Message
 │              │
 ▼              ▼
Project ─────── Channel
 │
 ├── Board
 │    │
 │    └── Column
 │         │
 │         └── Task
 │
 ├── Milestone
 ├── ProjectActivity
 └── ProjectFile
```

Potential entities:

```text
User
Project
ProjectMember
ProjectRole
Board
BoardColumn
Task
TaskAssignee
TaskComment
Channel
ChannelMember
Message
MessageReaction
Milestone
ProjectFile
ProjectActivity
Notification
```

---

# Important Design Principle

The **Project** should be the central entity in the system.

A board, channel, task, message, milestone, and activity record should all be associated with a project.

This allows the application to connect project management and communication rather than treating them as completely separate systems.

For example:

```text
Project
│
├── Tasks
│
├── Board
│   └── Columns
│       └── Tasks
│
├── Channels
│   └── Messages
│
├── Members
│
├── Milestones
│
├── Files
│
└── Activity
```

---

# MVP

The first version should focus on the core workflow rather than attempting to recreate every feature of Trello or Slack.

### Phase 1 — Authentication & Users

* User authentication
* User profiles
* Roles
* Basic permissions

### Phase 2 — Master Board

* Create projects
* View projects
* Edit projects
* Move projects between statuses
* Project status tracking

### Phase 3 — Project Initialization

When a project moves to `In Progress`:

* Create project workspace
* Create default board
* Create default columns
* Create `#general` channel
* Add project members

### Phase 4 — Project Boards

* Create tasks
* Assign tasks
* Move tasks
* Edit tasks
* Task comments
* Task due dates

### Phase 5 — Channels

* Create channels
* Send messages
* View message history
* Basic replies
* Mentions

### Phase 6 — Project Dashboard

* Project overview
* Task progress
* Upcoming deadlines
* Recent activity
* Project members

---

# Future Features

Potential future functionality includes:

### Portfolio Management

* Resource allocation
* Student workload management
* Project health indicators
* Cross-project reporting
* Portfolio analytics

### Communication

* Direct messages
* Threads
* Reactions
* Rich text
* File sharing
* Search

### Project Management

* Dependencies
* Gantt/timeline views
* Recurring tasks
* Task templates
* Sprint planning
* Milestones
* Time tracking

### ASC-Specific Features

* Sponsor management
* Project intake
* Project proposals
* Project scoping
* Student staffing
* Mentor assignment
* Sponsor feedback
* Project evaluations
* Deliverable tracking
* Project archival
* Project history

### Integrations

Potential integrations could eventually include:

* GitHub
* Microsoft 365
* Google Workspace
* Calendar
* Email
* Cloud storage
* CI/CD systems

---

# Technical Architecture

The application should be designed as a modular web application.

A potential architecture:

```text
                     ┌───────────────────┐
                     │    Web Client     │
                     │                   │
                     │ Master Board      │
                     │ Project Boards    │
                     │ Channels          │
                     │ Dashboards        │
                     └─────────┬─────────┘
                               │
                               │ HTTP / WebSocket
                               ▼
                     ┌───────────────────┐
                     │    API Server     │
                     │                   │
                     │ Authentication    │
                     │ Projects          │
                     │ Tasks             │
                     │ Channels          │
                     │ Messages          │
                     │ Notifications     │
                     └─────────┬─────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │    Database       │
                     │                   │
                     │ Users             │
                     │ Projects          │
                     │ Tasks             │
                     │ Messages          │
                     │ Memberships       │
                     └───────────────────┘
```

WebSockets should be considered for real-time functionality such as:

* New channel messages
* Task updates
* Notifications
* Board changes
* Presence/activity indicators

---

# Project Initialization Event

One of the most important pieces of business logic is the project initialization process.

Conceptually:

```javascript
if (project.status === "IN_PROGRESS" &&
    previousStatus !== "IN_PROGRESS") {

    createProjectWorkspace(project);
}
```

The initialization process should be **idempotent**.

In other words, this should be safe:

```text
Planning
   ↓
In Progress
   ↓
Planning
   ↓
In Progress
```

The second transition into `In Progress` should not create another board or another `#general` channel.

Instead, the system should recognize that the project already has an initialized workspace.

---

# Security & Permissions

Because ASC projects can involve external organizations and potentially sensitive business data, authorization should be considered a core feature rather than an afterthought.

The application should enforce access at the project level.

For example:

```text
ASC Administrator
       │
       ├─────────────── All Projects
       │
       ▼
Project Manager
       │
       └─────────────── Assigned Projects
                              │
                              ├── Board
                              ├── Tasks
                              ├── Channels
                              └── Files
```

Users should only be able to access projects and project resources for which they have appropriate permissions.

---

# Goals

The platform should ultimately make it possible for an ASC team to manage an entire project lifecycle without needing to piece together information from several unrelated systems.

The ideal workflow is:

```text
Project Intake
      ↓
Master Project Board
      ↓
Planning
      ↓
Staffing
      ↓
In Progress
      ↓
┌──────────────────────────────┐
│      Project Workspace       │
│                              │
│  Tasks ←→ Communication      │
│    ↓              ↓          │
│  Board          Channels     │
│    ↓              ↓          │
│  Milestones ←→ Activity      │
│                              │
└──────────────────────────────┘
      ↓
Completion
      ↓
Archive / Project History
```

The long-term goal is not simply to build another project management application. It is to build an **ASC-specific operating system for managing real-world student consulting projects**.

---

## About the ASC

The Analytics Solutions Center is part of the Jon M. Huntsman School of Business at Utah State University and is associated with the Data Analytics & Information Systems department. The ASC provides students with hands-on, work-integrated experience by assigning qualified students to projects with external partners under faculty mentorship. Its work includes data engineering and visualization, business intelligence and analytics, machine learning and AI, predictive analytics, software development, and web design.

The ASC's project model makes a centralized project-management system particularly valuable: teams need to coordinate students, mentors, sponsors, technical work, and deliverables across multiple concurrent projects.

For more information, see the [Analytics Solutions Center](https://huntsman.usu.edu/asc/?utm_source=chatgpt.com).
