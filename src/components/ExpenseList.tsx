import { ExpenseCard } from "./ExpenseCard";

interface Expense {
  id: number;
  title: string;
  amount: number;
  date: Date;
  paidBy: string;
  participants: string[];
}

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
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
        <ExpenseCard key={expense.id} {...expense} />
      ))}
    </div>
  );
};