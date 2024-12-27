import { useState, useEffect } from "react";
import { TaskListProps } from "@/types/task";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { WeekCard } from "./task/WeekCard";
import { getCurrentWeekInQuarter, getQuarterFromGoal } from "@/utils/dateUtils";

export const TaskList = ({ goalId }: TaskListProps) => {
  const {
    tasks,
    editTask,
    deleteTask,
    toggleTaskCompletion,
  } = useTaskManager(goalId);

  const [showAllWeeks, setShowAllWeeks] = useState(true); // Changed to true by default
  const [completedTasksVisibility, setCompletedTasksVisibility] = useState<Record<string, boolean>>({});
  const [goalQuarter, setGoalQuarter] = useState<string>("");

  useEffect(() => {
    const storedGoals = localStorage.getItem('goals');
    if (storedGoals) {
      const goals = JSON.parse(storedGoals);
      const currentGoal = goals.find((goal: any) => goal.id === goalId);
      if (currentGoal?.quarter) {
        setGoalQuarter(currentGoal.quarter);
        console.log("Found goal quarter:", currentGoal.quarter);
      }
    }
  }, [goalId]);

  useEffect(() => {
    console.log("TaskList - All tasks:", tasks);
    console.log("TaskList - goalId:", goalId);
  }, [tasks, goalId]);

  // Group tasks by week
  const groupedTasks = tasks.reduce((acc, task) => {
    if (Object.keys(acc).length === 0) {
      for (let i = 1; i <= 12; i++) {
        acc[`week${i}`] = [];
      }
    }

    if (task.isRecurring) {
      const weeksToShow = task.completed ? [task.week || 1] : Array.from({ length: 12 }, (_, i) => i + 1);
      weeksToShow.forEach(week => {
        const weekKey = `week${week}`;
        acc[weekKey].push({ ...task, week });
      });
    } else {
      const weekKey = `week${task.week}`;
      if (weekKey) {
        acc[weekKey].push(task);
      }
    }
    return acc;
  }, {} as Record<string, any>);

  const currentWeek = getCurrentWeekInQuarter(goalQuarter);
  
  const sortedWeeks = Object.keys(groupedTasks)
    .sort((a, b) => {
      const weekA = parseInt(a.replace('week', ''));
      const weekB = parseInt(b.replace('week', ''));
      
      // Always put current week first
      if (weekA === currentWeek) return -1;
      if (weekB === currentWeek) return 1;
      
      // Then sort by week number
      return weekA - weekB;
    });

  const toggleCompletedForWeek = (weekKey: string) => {
    setCompletedTasksVisibility(prev => ({
      ...prev,
      [weekKey]: !prev[weekKey]
    }));
  };

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-2">
        No active tasks
      </p>
    );
  }

  // Only show weeks that have tasks or if showAllWeeks is true
  const weeksToShow = sortedWeeks.filter(weekKey => {
    const hasTasksInWeek = groupedTasks[weekKey].length > 0;
    const weekNumber = parseInt(weekKey.replace('week', ''));
    return showAllWeeks || hasTasksInWeek || weekNumber === currentWeek;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="show-all-weeks"
          checked={showAllWeeks}
          onCheckedChange={setShowAllWeeks}
        />
        <Label htmlFor="show-all-weeks">Show all weeks</Label>
      </div>

      {weeksToShow.map((weekKey) => {
        const weekNumber = parseInt(weekKey.replace('week', ''));
        const isCurrentWeek = weekNumber === currentWeek;
        
        return (
          <WeekCard
            key={weekKey}
            weekKey={weekKey}
            weekNumber={weekNumber}
            isCurrentWeek={isCurrentWeek}
            quarter={getQuarterFromGoal(goalQuarter)}
            tasksForWeek={groupedTasks[weekKey]}
            showCompletedForWeek={completedTasksVisibility[weekKey]}
            toggleCompletedForWeek={toggleCompletedForWeek}
            toggleTaskCompletion={toggleTaskCompletion}
            editTask={editTask}
            deleteTask={deleteTask}
            goalId={goalId}
          />
        );
      })}
    </div>
  );
};