"use client";

import { useState, useEffect } from "react";
import KanbanColumn from "./KanbanColumn";
import { Bug, Sparkles, CheckCircle } from "lucide-react";
import styles from "./kanban.module.css";

const INITIAL_TASKS = [
  {
    id: "task-1",
    title: "Integrate Ohio Fish Stocking Data",
    status: "To Do",
    description: "Fetch and visualize ODNR fish stocking data on the map.",
    type: "feature",
    priority: "high",
    acceptanceCriteria: [
      { id: "ac-1", text: "App fetches historical/current fish stocking data from ODNR CSV or API", completed: false },
      { id: "ac-2", text: "Data is parsed and converted to map-compatible markers (GeoJSON)", completed: false },
      { id: "ac-3", text: "A map toggle allows users to show/hide the 'Fish Stocking' layer", completed: false },
      { id: "ac-4", text: "Clicking a stocking marker displays details (species, life stage, year, hatchery)", completed: false },
    ],
  },
  {
    id: "task-2",
    title: "Weather Integration",
    status: "To Do",
    description: "Display real-time and forecasted weather (temp, wind, precip) for selected fishing spots.",
    type: "feature",
    priority: "high",
    acceptanceCriteria: [
      { id: "task2-ac1", text: "Integrate a weather API (e.g., OpenWeather)", completed: false },
      { id: "task2-ac2", text: "Show current conditions on spot details", completed: false },
      { id: "task2-ac3", text: "Show 3-day forecast", completed: false }
    ],
  },
  {
    id: "task-3",
    title: "USGS Water Gauge Data",
    status: "To Do",
    description: "Fetch real-time USGS river gauge data (CFS, water temp, height) for major rivers.",
    type: "feature",
    priority: "high",
    acceptanceCriteria: [
      { id: "task3-ac1", text: "Fetch data from USGS Water Services API", completed: false },
      { id: "task3-ac2", text: "Display flow rate (CFS) on river details", completed: false },
      { id: "task3-ac3", text: "Color code flow levels (Low, Normal, High)", completed: false }
    ],
  },
  {
    id: "task-4",
    title: "User Catch Log/Journal",
    status: "To Do",
    description: "Allow users to log their catches with photos, location, species, fly used, and weather conditions.",
    type: "feature",
    priority: "medium",
    acceptanceCriteria: [
      { id: "task4-ac1", text: "Create Catch Form (species, fly, length, weight, photo)", completed: false },
      { id: "task4-ac2", text: "Save catch data to user profile in Firebase", completed: false },
      { id: "task4-ac3", text: "Display user's catches on their personal map", completed: false }
    ],
  },
  {
    id: "task-5",
    title: "Hatch Chart Integration",
    status: "To Do",
    description: "Show what insects are currently hatching on specific rivers based on the time of year.",
    type: "feature",
    priority: "medium",
    acceptanceCriteria: [
      { id: "task5-ac1", text: "Create database of regional hatch charts", completed: false },
      { id: "task5-ac2", text: "Filter hatches based on current month", completed: false },
      { id: "task5-ac3", text: "Recommend fly patterns based on active hatches", completed: false }
    ],
  },
  {
    id: "task-6",
    title: "Interactive Route Planner",
    status: "To Do",
    description: "Allow users to plan a multi-day trip with stops at different fishing access points and campsites.",
    type: "feature",
    priority: "medium",
    acceptanceCriteria: [
      { id: "task6-ac1", text: "Add 'Add to Trip' button on map points", completed: false },
      { id: "task6-ac2", text: "Display ordered itinerary view", completed: false },
      { id: "task6-ac3", text: "Calculate distance/time between stops", completed: false }
    ],
  },
  {
    id: "task-7",
    title: "Local Fly Shop Directory",
    status: "To Do",
    description: "Map layer showing local fly shops, guides, and outfitters with contact info and ratings.",
    type: "feature",
    priority: "low",
    acceptanceCriteria: [
      { id: "task7-ac1", text: "Import POI data for fly shops and outfitters", completed: false },
      { id: "task7-ac2", text: "Add map toggle for Fly Shops layer", completed: false },
      { id: "task7-ac3", text: "Show business hours, phone number, and website on click", completed: false }
    ],
  },
  {
    id: "task-8",
    title: "Social Feed / Community Reports",
    status: "To Do",
    description: "A community section where users can share recent trip reports and conditions.",
    type: "feature",
    priority: "low",
    acceptanceCriteria: [
      { id: "task8-ac1", text: "Create public feed of shared trip reports", completed: false },
      { id: "task8-ac2", text: "Allow users to comment/like reports", completed: false },
      { id: "task8-ac3", text: "Add profanity/spam filter for public posts", completed: false }
    ],
  },
  {
    id: "task-9",
    title: "Offline Maps Mode",
    status: "To Do",
    description: "Allow users to download map regions and spot data for use in areas without cell service.",
    type: "feature",
    priority: "high",
    acceptanceCriteria: [
      { id: "task9-ac1", text: "Implement service worker for PWA caching", completed: false },
      { id: "task9-ac2", text: "Allow caching of map tiles for selected bounding box", completed: false },
      { id: "task9-ac3", text: "Store JSON spot data in IndexedDB for offline access", completed: false }
    ],
  },
  {
    id: "task-10",
    title: "Fishing Regulations Layer",
    status: "To Do",
    description: "Display local fishing regulations, catch limits, and restricted areas directly on the map.",
    type: "feature",
    priority: "medium",
    acceptanceCriteria: [
      { id: "task10-ac1", text: "Add map polygons representing special regulation zones", completed: false },
      { id: "task10-ac2", text: "Clicking zone shows specific rules (e.g., 'Fly Fishing Only', 'Catch and Release')", completed: false }
    ],
  },
  {
    id: "task-11",
    title: "Gear Checklist Builder",
    status: "To Do",
    description: "A customizable checklist for packing gear, flies, and equipment based on trip length and target species.",
    type: "feature",
    priority: "low",
    acceptanceCriteria: [
      { id: "task11-ac1", text: "Create default templates (e.g., Trout Day Trip, Steelhead Multi-day)", completed: false },
      { id: "task11-ac2", text: "Allow users to add/remove custom items", completed: false },
      { id: "task11-ac3", text: "Save checklists to user profile", completed: false }
    ],
  }
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("admin_kanban_tasks");
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      const existingIds = new Set(parsedTasks.map(t => t.id));
      const newTasksToAdd = INITIAL_TASKS.filter(t => !existingIds.has(t.id));
      
      if (newTasksToAdd.length > 0) {
        const combined = [...parsedTasks, ...newTasksToAdd];
        setTasks(combined);
        localStorage.setItem("admin_kanban_tasks", JSON.stringify(combined));
      } else {
        setTasks(parsedTasks);
      }
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem("admin_kanban_tasks", JSON.stringify(INITIAL_TASKS));
    }
  }, []);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem("admin_kanban_tasks", JSON.stringify(newTasks));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const newTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    saveTasks(newTasks);
  };

  const toggleAcceptanceCriteria = (taskId, criteriaId) => {
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          acceptanceCriteria: task.acceptanceCriteria.map((ac) =>
            ac.id === criteriaId ? { ...ac, completed: !ac.completed } : ac
          ),
        };
      }
      return task;
    });
    saveTasks(newTasks);
  };

  const columns = [
    { title: "To Do", id: "todo", color: "#3b82f6" },
    { title: "In Progress", id: "inprogress", color: "#f59e0b" },
    { title: "On Hold", id: "onhold", color: "#f43f5e" },
    { title: "Done", id: "done", color: "#10b981" },
  ];

  const numBugs = tasks.filter(t => t.type === 'bug').length;
  const numFeatures = tasks.filter(t => t.type === 'feature').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div>
      {/* Stats Bar */}
      <section className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.bugs}`}>
            <Bug size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{numBugs}</div>
            <div className={styles.statLabel}>Bugs Logged</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.features}`}>
            <Sparkles size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{numFeatures}</div>
            <div className={styles.statLabel}>Features Tracked</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.progress}`}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{completionPercentage}%</div>
            <div className={styles.statLabel}>Task Completion</div>
          </div>
        </div>
      </section>

      {/* Kanban Grid */}
      <div className={styles.boardGrid}>
        {columns.map((col) => (
          <KanbanColumn
            key={col.title}
            title={col.title}
            color={col.color}
            tasks={tasks.filter((t) => t.status === col.title || (col.title === 'To Do' && t.status === 'Backlog'))}
            updateTaskStatus={updateTaskStatus}
            toggleAcceptanceCriteria={toggleAcceptanceCriteria}
          />
        ))}
      </div>
    </div>
  );
}
