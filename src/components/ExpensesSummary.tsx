import { Card } from "@/components/ui/card";
import { SettlementSummary } from "@/components/SettlementSummary";
import { Expense } from "@/hooks/useExpenses";

interface ExpensesSummaryProps {
  expenses: Expense[];
}

export const ExpensesSummary = ({ expenses }: ExpensesSummaryProps) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
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
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <SettlementSummary expenses={expenses} />
      </div>
    </div>
  );
};