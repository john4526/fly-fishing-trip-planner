"use client";

import KanbanCard from "./KanbanCard";
import { Circle, Loader2, PauseCircle, CheckCircle2 } from "lucide-react";
import styles from "./kanban.module.css";

export default function KanbanColumn({ title, color, tasks, updateTaskStatus, toggleAcceptanceCriteria }) {
  const getIcon = () => {
    switch (title) {
      case "To Do": return <Circle size={14} />;
      case "In Progress": return <Loader2 size={14} />;
      case "On Hold": return <PauseCircle size={14} />;
      case "Done": return <CheckCircle2 size={14} />;
      default: return <Circle size={14} />;
    }
  };

  return (
    <div className={styles.boardColumn}>
      <div className={styles.columnHeader}>
        <h2 className={styles.columnTitle} style={{ color: color }}>
          {getIcon()} {title}
        </h2>
        <span className={styles.columnBadge}>
          {tasks.length}
        </span>
      </div>
      
      <div className={styles.cardsContainer}>
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            updateTaskStatus={updateTaskStatus}
            toggleAcceptanceCriteria={toggleAcceptanceCriteria}
          />
        ))}
      </div>
    </div>
  );
}
