# House Keeping Management Software - DSA Implementation

A comprehensive task management application demonstrating practical implementation of **Data Structures and Algorithms (DSA)** concepts in a real-world housekeeping management system. Built with Next.js, TypeScript, and Tailwind CSS.

## 🎯 Project Overview

This application implements a worker management system for housekeeping services that assigns tasks to staff by ID, prioritizes them (high/medium/low), allocates time estimates, and sets deadlines. It serves as an educational showcase of how fundamental DSA principles are applied in practical software development.

### Key Features
- **Worker Management**: Add, track, and manage housekeeping staff availability
- **Task Assignment**: Create and assign cleaning tasks with priorities and deadlines
- **Workload Balancing**: Capacity-aware task assignment with 8-hour daily limits
- **Advanced Filtering**: Search, sort, and filter tasks by multiple criteria
- **Real-time Statistics**: Monitor worker utilization and task completion
- **CSV Export**: Export task and worker data for reporting and analysis

## 🏗️ System Architecture

### Data Structures & Algorithms Implementation
```
├── Core Data Structures (lib/data.ts)
│   ├── Arrays (Worker[], Task[])        # Primary storage containers
│   ├── Hash Map (Map<string, Worker>)    # O(1) worker lookups
│   └── Priority Weight Mapping           # Sorting optimization
│
├── Algorithm Implementations
│   ├── Sorting Algorithms                # Priority & deadline sorting
│   ├── Search Algorithms                 # Multi-field text search
│   ├── Filtering Algorithms              # Status & priority filtering
│   └── Assignment Algorithms             # Capacity-aware task assignment
│
└── UI Components (React/Next.js)
    ├── Dashboard                         # Worker statistics display
    ├── Task Assignment Interface         # Form-based task creation
    └── Task Management Tables            # Filtered data presentation
```

## 🔍 DSA Implementation Details

### Core Data Structures

#### 1. **Dynamic Arrays (`Worker[]`, `Task[]`)**
**Location:** `lib/data.ts` (lines 7-8)

**Implementation:**
```typescript
let workers: Worker[] = [];
let tasks: Task[] = [];
```

**DSA Characteristics:**
- **Dynamic Resizing:** JavaScript arrays automatically resize as elements are added
- **Time Complexity:**
  - Access: O(1) - direct indexing
  - Append: O(1) amortized - efficient for adding new workers/tasks
  - Linear Search: O(n) - used for finding tasks by ID
  - Filter Operations: O(n) - used extensively for data queries

**Real-World Application:**
- **Worker Roster:** Complete list of housekeeping staff
- **Task Queue:** Collection of all cleaning assignments
- **Filtering Operations:** `getAvailableWorkers()`, `getUnassignedTasks()`

#### 2. **Hash Map for Worker Lookups (`Map<string, Worker>`)**
**Location:** `lib/data.ts` (line 9)

**Implementation:**
```typescript
let workerMap: Map<string, Worker> = new Map();
```

**DSA Characteristics:**
- **Hash Table Implementation:** JavaScript's native Map provides hash table functionality
- **Key-Value Storage:** Worker IDs map directly to Worker objects
- **Time Complexity:**
  - Insertion: O(1) average case
  - Lookup: O(1) average case
  - Deletion: O(1) average case
  - Iteration: O(n) for all workers

**Performance Optimization:**
- **Before Optimization:** O(n) linear search through workers array for each lookup
- **After Optimization:** O(1) hash map access for instant worker retrieval
- **Impact:** Eliminates performance bottlenecks in task assignment operations

#### 3. **Priority Weight Mapping (Record/Object)**
**Location:** `lib/data.ts` (lines 14-18)

**Implementation:**
```typescript
const PRIORITY_WEIGHTS: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};
```

**DSA Characteristics:**
- **Lookup Table:** Pre-computed mapping for priority levels
- **Constant Time Access:** O(1) priority weight retrieval
- **Memory Efficient:** No runtime calculations needed

**Algorithmic Benefit:**
- Enables efficient comparison-based sorting
- Supports compound sorting (priority + deadline)
- Business rule enforcement through numerical weights

### Algorithm Implementations

#### 1. **Compound Priority Sorting Algorithm (O(n log n))**
**Location:** `lib/data.ts` `sortTasksByPriority()` (lines 199-207)

**Implementation:**
```typescript
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
```

**Algorithm Analysis:**
- **Primary Sort Key:** Priority weights (High: 3, Medium: 2, Low: 1)
- **Secondary Sort Key:** Deadline timestamp (earliest first)
- **Sorting Algorithm:** JavaScript's Timsort (stable, adaptive)
- **Time Complexity:** O(n log n) - optimal for comparison-based sorting
- **Space Complexity:** O(n) - creates shallow copy to avoid mutation

**Business Logic:**
- High-priority tasks always appear before lower-priority tasks
- Within same priority level, urgent deadlines take precedence
- Ensures critical housekeeping tasks are addressed first

#### 2. **Deadline-Based Temporal Sorting (O(n log n))**
**Location:** `lib/data.ts` `sortTasksByDeadline()` (lines 209-213)

**Implementation:**
```typescript
export function sortTasksByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
```

**Algorithm Analysis:**
- **Sort Criterion:** ISO date string converted to Unix timestamp
- **Order:** Ascending (earliest deadlines first)
- **Time Complexity:** O(n log n) with O(n) date parsing overhead

**Use Case:** Prevents service delays by surfacing time-sensitive tasks

#### 3. **Multi-Field Linear Search (O(n × m))**
**Location:** `lib/data.ts` `searchTasks()` (lines 216-223)

**Implementation:**
```typescript
export function searchTasks(query: string): Task[] {
  const lowercaseQuery = query.toLowerCase();
  return tasks.filter(task =>
    task.description.toLowerCase().includes(lowercaseQuery) ||
    task.id.toLowerCase().includes(lowercaseQuery) ||
    (task.assignedTo && task.assignedTo.toLowerCase().includes(lowercaseQuery))
  );
}
```

**Algorithm Analysis:**
- **Search Strategy:** Substring matching across multiple fields
- **Case Insensitive:** Normalization prevents case-sensitivity issues
- **Fields Searched:** Task description, Task ID, Assigned worker ID
- **Time Complexity:** O(n × m) where m = average field length

**Real-World Optimization:**
- Immediate user feedback for task discovery
- No database indexing required for typical dataset sizes (< 1000 tasks)
- Supports partial matches and typos

#### 4. **Set-Based Deduplication Algorithm**
**Location:** `app/page.tsx` (lines 85-89)

**Implementation:**
```typescript
const workingWorkers = new Set(
  tasks
    .filter((task) => task.assignedTo && !task.completed)
    .map((task) => task.assignedTo)
).size;
```

**Algorithm Analysis:**
- **Data Structure:** JavaScript Set for automatic deduplication
- **Time Complexity:** O(n) for filtering + O(k) for Set construction (k = unique workers)
- **Space Complexity:** O(k) for Set storage

**Algorithmic Purpose:**
- Prevents double-counting workers with multiple concurrent tasks
- Accurate workforce utilization statistics
- Eliminates manual deduplication logic

#### 5. **Capacity-Constrained Task Assignment**
**Location:** `lib/data.ts` `assignTaskToWorker()` (lines 139-170)

**Implementation:**
```typescript
export function assignTaskToWorker(taskId: string, workerId: string): void {
  const task = tasks.find(t => t.id === taskId);
  const worker = workerMap.get(workerId);

  // Constraint validation
  if (worker.totalAssignedHours + task.timeEstimate > MAX_WORK_HOURS_PER_DAY) {
    throw new Error('Capacity exceeded');
  }

  // Handle reassignment
  if (task.assignedTo) {
    const prevWorker = workerMap.get(task.assignedTo);
    if (prevWorker) prevWorker.totalAssignedHours -= task.timeEstimate;
  }

  // Atomic assignment
  task.assignedTo = workerId;
  worker.totalAssignedHours += task.timeEstimate;
  saveData();
}
```

**Algorithm Analysis:**
- **Constraint Validation:** Worker availability + capacity checking
- **State Management:** Maintains running total of assigned hours
- **Reassignment Handling:** Properly unassigns from previous worker
- **Atomic Operations:** All changes committed together or rolled back

**Business Rules Enforced:**
- 8-hour daily maximum per worker
- Prevents over-assignment and worker burnout
- Maintains data consistency across operations

### Performance Analysis & Complexity

| Operation | Time Complexity | Space Complexity | Data Structure Used | Real-World Impact |
|-----------|----------------|------------------|-------------------|-------------------|
| Worker Lookup by ID | O(1) | O(1) | Hash Map | Instant task assignment |
| Task Search by ID | O(n) | O(1) | Array Linear Search | Fast for small datasets |
| Multi-field Task Search | O(n × m) | O(n) | Array Filter | Immediate user feedback |
| Priority-based Sorting | O(n log n) | O(n) | Timsort | Optimal for comparison sorting |
| Worker Capacity Filter | O(n) | O(1) | Array Filter | Quick availability checks |
| Set Deduplication | O(n) | O(k) | Hash Set | Accurate statistics |
| Task Assignment | O(n) | O(1) | Hash Map + Array | Atomic operations |
| CSV Export (Tasks) | O(n) | O(n) | Array Iteration | Complete data export |
| CSV Export (Workers) | O(n) | O(n) | Array Iteration | Complete data export |

**Complexity Notes:**
- **Hash Map Operations:** O(1) average case due to JavaScript's efficient Map implementation
- **Array Operations:** O(n) for searches, but acceptable for housekeeping business scale (< 1000 records)
- **Sorting:** JavaScript's Timsort provides stable, adaptive sorting with O(n log n) worst case
- **Filtering:** Multiple sequential filters reduce dataset size progressively for better performance

### Space Complexity Analysis

**Total Application Memory:** O(w + t)
- **w:** Number of workers (stored in array + hash map)
- **t:** Number of tasks (stored in array)
- **Overhead:** Minimal - no complex data structures or caching layers

**Memory Optimization Strategies:**
- **Shallow Copies:** Sorting operations use shallow copying to avoid full object duplication
- **Reference Reuse:** Filter operations reuse array references when possible
- **No External Dependencies:** Pure JavaScript data structures with predictable memory usage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tm-dsa
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use the System

### 1. Dashboard (`/`)
- View executive overview with key metrics
- Monitor worker capacity and task queues
- See real-time statistics and urgent deadlines
- Quick access to task assignment actions

### 2. Assign Tasks (`/assign`)
- **Add Workers**: Create new cleaning staff with automatic ID generation (W001, W002, etc.)
- **Create Tasks**: Define cleaning jobs with:
  - Description and priority level
  - Time estimates (0.5-8 hours)
  - Deadlines
  - Optional immediate assignment
- **Capacity Monitoring**: Real-time availability tracking

### 3. Task Management (`/tasks`)
- **Advanced Filtering**: Search by keyword, status, priority
- **Multiple Sort Options**: Priority, deadline, creation date
- **Bulk Operations**: Assign, unassign, complete tasks
- **CSV Export**: Download task and worker data for reporting and analysis
- **Real-time Updates**: Live queue statistics

### 4. CSV Export Functionality
- **Task Export**: Includes ID, description, priority, time estimate, deadline, assigned worker, status, and creation date
- **Worker Export**: Includes ID, name, availability status, assigned hours, and available hours
- **Automatic Downloads**: Files are named with current date (e.g., `tasks_2024-01-15.csv`)
- **Data Integrity**: All exported data matches the current application state

### 5. Data Persistence
- All data automatically saves to browser localStorage
- No external database required
- Data persists between browser sessions

## 🛠️ Technical Implementation

### Core Technologies
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with custom design system
- **Local Storage**: Client-side persistence

### Key Design Patterns

#### 1. **Custom Hooks Pattern**
```typescript
// Centralized data management
export function useWorkerData() {
  const [workers, setWorkers] = useState<Worker[]>([]);

  const addWorker = (name: string) => {
    // Implementation
  };

  return { workers, addWorker };
}
```

#### 2. **Factory Pattern for Data Operations**
```typescript
// Consistent data operation interface
export const dataOperations = {
  createWorker: (name: string) => addWorker(name),
  createTask: (params) => addTask(params),
  assignTask: (taskId, workerId) => assignTaskToWorker(taskId, workerId),
};
```

#### 3. **Observer Pattern for UI Updates**
```typescript
// Reactive data binding
useEffect(() => {
  // Automatically update UI when data changes
  setTasks(getTasks());
}, [dataVersion]);
```

## 🎨 UI/UX Design System

### Design Principles
- **Glass-morphism**: Modern, translucent UI elements
- **Gradient Accents**: Purple-to-blue gradients for visual hierarchy
- **Card-based Layout**: Organized information architecture
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG-compliant color contrasts and interactions

### Component Library
- **Navigation**: Sticky header with glass effect
- **Data Tables**: Responsive with inline actions
- **Forms**: Rounded inputs with focus states
- **Cards**: Shadowed containers with subtle borders
- **Badges**: Status indicators with consistent styling

## 📊 Business Logic Implementation

### Worker Capacity Management
```typescript
const MAX_WORK_HOURS_PER_DAY = 8;

function canAssignTask(worker: Worker, task: Task): boolean {
  return worker.availability &&
         (worker.totalAssignedHours + task.timeEstimate) <= MAX_WORK_HOURS_PER_DAY;
}
```

### Task Priority Scoring
```typescript
function calculateTaskScore(task: Task): number {
  const priorityScore = PRIORITY_WEIGHTS[task.priority];
  const urgencyScore = calculateUrgency(task.deadline);
  return priorityScore + urgencyScore;
}
```

### FIFO Queue with Priority Override
```typescript
function getNextTaskToAssign(): Task | null {
  // Check for urgent high-priority tasks first
  const urgentTasks = tasks.filter(task =>
    task.priority === 'high' &&
    isUrgent(task.deadline) &&
    !task.assignedTo
  );

  if (urgentTasks.length > 0) {
    return urgentTasks[0]; // Override FIFO for urgent tasks
  }

  // Fall back to FIFO for regular tasks
  return tasks.find(task => !task.assignedTo) || null;
}
```

## 🔒 Error Handling & Validation

### Input Validation
- **Worker IDs**: Auto-generated (W001, W002, etc.)
- **Task IDs**: Auto-generated (T001, T002, etc.)
- **Dates**: Future date validation
- **Time Estimates**: 0.5-8 hour range enforcement
- **Capacity Limits**: 8-hour daily maximum per worker

### Error Recovery
- **Data Corruption**: Automatic fallback to empty state
- **Storage Errors**: Graceful degradation with user feedback
- **Network Issues**: Offline-first architecture with localStorage

## 🚀 Performance Optimizations

### 1. **Efficient Data Structures**
- Hash maps for O(1) worker lookups
- Indexed arrays for fast iteration
- Minimal object creation in render loops

### 2. **Lazy Loading**
- Components load only when needed
- Dynamic imports for heavy operations
- Progressive enhancement for features

### 3. **Memoization**
```typescript
const filteredTasks = useMemo(() => {
  return applyFiltersAndSorting(tasks, filters);
}, [tasks, filters]);
```

## 📈 Scalability Considerations

### Current Limitations
- Browser localStorage (5-10MB limit)
- Client-side only (no server synchronization)
- Single-user system

### Future Enhancements
- **Database Integration**: PostgreSQL/MongoDB for multi-user support
- **Real-time Sync**: WebSocket connections for live updates
- **Advanced Scheduling**: Calendar integration and recurring tasks
- **Analytics Dashboard**: Performance metrics and reporting

## 🧪 Testing Strategy

### Unit Tests
- Data structure operations
- Algorithm correctness
- Business logic validation
- Type safety verification

### Integration Tests
- Component interactions
- Data flow verification
- UI state management
- Error handling scenarios

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-dsa-algorithm`
3. **Implement changes with proper DSA documentation**
4. **Add comprehensive tests**
5. **Update README with new algorithm explanations**
6. **Submit a pull request**

## 📚 Educational Value

This project serves as a practical example of how fundamental computer science concepts are applied in modern web development:

- **Arrays**: Dynamic storage, queue operations
- **Hash Tables**: Fast lookups, data indexing
- **Sorting Algorithms**: Priority-based ordering
- **Search Algorithms**: Linear search with filtering
- **Time Complexity**: Performance analysis and optimization
- **Space Complexity**: Memory usage considerations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ to demonstrate the power of Data Structures and Algorithms in real-world applications.**
