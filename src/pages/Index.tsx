import { useState } from "react";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpenseList } from "@/components/ExpenseList";

interface Expense {
  id: number;
  title: string;
  amount: number;
  date: Date;
  paidBy: string;
  participants: string[];
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleAddExpense = (newExpense: Omit<Expense, "id" | "date">) => {
    setExpenses((prev) => [
      {
        ...newExpense,
        id: Date.now(),
        date: new Date(),
      },
      ...prev,
    ]);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Expense Splitter</h1>
          <p className="text-muted-foreground">Track and split expenses with friends</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Recent Expenses</h2>
              <AddExpenseDialog onAddExpense={handleAddExpense} />
            </div>
            <ExpenseList expenses={expenses} />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Expenses</span>
                  <span className="font-bold text-primary">${totalExpenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Number of Expenses</span>
                  <span className="font-bold">{expenses.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;