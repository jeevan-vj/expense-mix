import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Users, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExpenseCardProps {
  id: string;
  title: string;
  amount: number;
  date: Date;
  paidBy: string;
  participants: Array<{
    participant: string;
    amount: number;
  }>;
  onDelete: (id: string) => void;
  editComponent: React.ReactNode;
}

export const ExpenseCard = ({ 
  id,
  title, 
  amount, 
  date, 
  paidBy, 
  participants,
  onDelete,
  editComponent
}: ExpenseCardProps) => {
  const totalParticipants = participants.length;
  const averageAmount = amount / totalParticipants;
  const isEqualSplit = participants.every(p => Math.abs(p.amount - averageAmount) < 0.01);

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">
            ${amount.toFixed(2)}
          </div>
          <div className="flex gap-2">
            {editComponent}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this expense? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="font-medium text-foreground">Paid by:</span> 
          <span>{paidBy}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-medium text-foreground">
              Split ({isEqualSplit ? "Equal" : "Custom"})
            </span>
          </div>
          
          <div className="grid gap-2">
            {participants.map((p, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between rounded-lg bg-secondary/50 p-2"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{p.participant}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">${p.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};