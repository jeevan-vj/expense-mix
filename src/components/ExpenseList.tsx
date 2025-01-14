import { ExpenseCard } from "./ExpenseCard";

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
  onEditExpense: (id: string) => void;
}

export const ExpenseList = ({ expenses, onDeleteExpense, onEditExpense }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expenses yet. Add your first expense!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <ExpenseCard 
          key={expense.id} 
          {...expense} 
          onDelete={onDeleteExpense}
          onEdit={onEditExpense}
        />
      ))}
    </div>
  );
};