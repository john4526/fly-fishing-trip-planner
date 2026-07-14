"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import KanbanBoard from "./KanbanBoard";
import { ListTodo } from "lucide-react";
import styles from "./kanban.module.css";

export default function AdminKanbanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || !user.isAdmin) {
    return <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Admin Portal...</div>;
  }

  return (
    <div className={styles.container}>
      {/* App Header */}
      <header className={styles.appHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.logoBadge}>
            <ListTodo size={20} color="white" />
          </div>
          <div className={styles.titleGroup}>
            <h1>Project Kanban Board</h1>
            <p>Fly Fishing Trip Planner • Feature tracking & issue diagnostics</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => router.push("/")} className={styles.btnSecondary}>
            ← Back to Map
          </button>
        </div>
      </header>

      <main className={styles.dashboardContainer}>
        <KanbanBoard />
      </main>
    </div>
  );
}
