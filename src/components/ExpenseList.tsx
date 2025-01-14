import { ExpenseCard } from "./ExpenseCard";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { Button } from "./ui/button";
import { Edit2 } from "lucide-react";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  paidBy: string;
  participants: Array<{
    participant: string;
    amount: number;
  }>;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, updatedExpense: Omit<Expense, 'id' | 'date'>) => void;
}

export const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expenses yet. Add your first expense!
      </div>
    );
  }

  const handleEdit = (expense: Expense) => {
    const editTrigger = (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Edit2 className="h-4 w-4" />
      </Button>
    );

    return (
      <AddExpenseDialog
        isEditing
        initialData={{
          title: expense.title,
          amount: expense.amount,
          paidBy: expense.paidBy,
          participants: expense.participants,
        }}
        onEditExpense={(updatedExpense) => onEditExpense(expense.id, updatedExpense)}
        trigger={editTrigger}
      />
    );
  };

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <ExpenseCard 
          key={expense.id} 
          {...expense} 
          onDelete={onDeleteExpense}
          editComponent={handleEdit(expense)}
        />
      ))}
    </div>
  );
};