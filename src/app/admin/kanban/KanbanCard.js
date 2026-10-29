"use client";

import { CheckCircle2, Circle } from "lucide-react";
import styles from "./kanban.module.css";

export default function KanbanCard({ task, updateTaskStatus, toggleAcceptanceCriteria }) {
  const statuses = ["To Do", "In Progress", "On Hold", "Done"];

  const getTypeStyle = (type) => {
    switch(type) {
      case 'bug': return { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.2)', text: '#fb7185' };
      case 'feature': return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' };
      case 'chore': return { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.2)', text: '#d1d5db' };
      default: return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' };
    }
  };

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'high': return '#f43f5e';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#f59e0b';
    }
  };

  const tStyle = getTypeStyle(task.type);

  return (
    <div className={styles.taskCard}>
      
      <div className={styles.cardMeta}>
        <span className={styles.labelBadge} style={{ background: tStyle.bg, borderColor: tStyle.border, borderWidth: '1px', borderStyle: 'solid', color: tStyle.text }}>
          {task.type || 'Feature'}
        </span>
        <div className={styles.priorityIndicator} style={{ color: getPriorityStyle(task.priority) }}>
          <span className={styles.priorityDot} style={{ backgroundColor: getPriorityStyle(task.priority) }}></span>
          {(task.priority || 'Medium').toUpperCase()}
        </div>
      </div>

      <h3 className={styles.cardTitle}>{task.title}</h3>
      <p className={styles.cardDesc}>{task.description}</p>
      
      {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
        <div className={styles.checklist}>
          {task.acceptanceCriteria.map((ac) => (
            <label key={ac.id} className={styles.checklistItem}>
              <button aria-label={ac.text} aria-pressed={ac.completed}
                onClick={(e) => {
                  e.preventDefault();
                  toggleAcceptanceCriteria(task.id, ac.id);
                }}
              >
                {ac.completed ? <CheckCircle2 size={14} color="#10b981" /> : <Circle size={14} />}
              </button>
              <span className={`${styles.checkText} ${ac.completed ? styles.checkTextCompleted : ''}`}>
                {ac.text}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className={styles.cardFooter}>
        <select aria-label={`Status: ${task.title}`}
          value={task.status === "Backlog" ? "To Do" : task.status}
          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
          className={styles.statusSelect}
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
