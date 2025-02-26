import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface GroupGoal {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  progress: number;
}

export const GroupBingoBoardCard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [groupGoals, setGroupGoals] = useState<GroupGoal[]>([]);
  const [completedLines, setCompletedLines] = useState<number[][]>([]);

  const checkForBingoLines = () => {
    const lines: number[][] = [];
    const gridSize = 3;

    // Check horizontal lines
    for (let row = 0; row < gridSize; row++) {
      if (isLineComplete(row * gridSize, (row + 1) * gridSize)) {
        lines.push(Array.from({ length: gridSize }, (_, i) => row * gridSize + i));
      }
    }

    // Check vertical lines
    for (let col = 0; col < gridSize; col++) {
      if (isLineComplete(col, col + 6, 3)) {
        lines.push(Array.from({ length: gridSize }, (_, i) => col + i * gridSize));
      }
    }

    // Check diagonal (top-left to bottom-right)
    if (isLineComplete(0, 8, 4)) {
      lines.push([0, 4, 8]);
    }

    // Check diagonal (top-right to bottom-left)
    if (isLineComplete(2, 6, 2)) {
      lines.push([2, 4, 6]);
    }

    return lines;
  };

  const isLineComplete = (start: number, end: number, step = 1) => {
    const goals = groupGoals.slice(start, end);
    return goals.every((goal) => goal.progress >= 100);
  };

  useEffect(() => {
    const newLines = checkForBingoLines().filter(
      line => !completedLines.some(existing => 
        existing.length === line.length && 
        existing.every(num => line.includes(num))
      )
    );

    if (newLines.length > 0) {
      setCompletedLines(prev => [...prev, ...newLines]);
      toast({
        title: "BINGO! 🎉",
        description: "A team line of goals has been completed! Great teamwork!",
      });
    }
  }, [groupGoals]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Q1 2024 Bingo Card
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Track your group's Q1 progress together! Each member can set up to three goals for the quarter. Once a goal is marked as complete, it automatically fills the corresponding square on the shared Bingo board. Complete three squares in a row—horizontally, vertically, or diagonally—for a BINGO! Celebrate each milestone and keep the momentum going.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, index) => {
            const goal = groupGoals[index];
            const isEmptyCell = !goal;
            
            return (
              <div
                key={goal?.id || `empty-${index}`}
                className={`
                  aspect-square p-4 border rounded-lg
                  flex flex-col items-center justify-center text-center
                  transition-all duration-200
                  ${goal?.progress === 100 ? 'bg-primary/10 border-primary' : 'bg-card'}
                  ${completedLines.some(line => line.includes(index)) ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${isEmptyCell ? 'bg-gray-50/50 border-dashed border-gray-200' : ''}
                `}
              >
                {!isEmptyCell ? (
                  <>
                    <Target className="h-5 w-5 text-primary mb-2" />
                    <div className="text-sm font-medium mb-1 line-clamp-2">
                      {goal.title}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {goal.memberName}
                    </div>
                    <Progress value={goal.progress} className="h-2 w-full" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {goal.progress}%
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Empty Goal Slot</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};