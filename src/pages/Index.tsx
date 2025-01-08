import { useState, useEffect } from "react";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpenseList } from "@/components/ExpenseList";
import { SettlementSummary } from "@/components/SettlementSummary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  paidBy: string;
  participants: string[];
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          title,
          amount,
          paid_by,
          created_at,
          contributions (
            participant,
            amount
          )
        `)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      const formattedExpenses: Expense[] = expensesData.map(expense => ({
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        date: new Date(expense.created_at),
        paidBy: expense.paid_by,
        participants: expense.contributions.map(c => c.participant)
      }));

      setExpenses(formattedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    }
  };

  const handleAddExpense = async (newExpense: Omit<Expense, "id" | "date">) => {
    try {
      // Insert the expense
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          title: newExpense.title,
          amount: newExpense.amount,
          paid_by: newExpense.paidBy
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Calculate amount per person
      const amountPerPerson = newExpense.amount / newExpense.participants.length;

      // Insert contributions
      const contributions = newExpense.participants.map(participant => ({
        expense_id: expenseData.id,
        participant,
        amount: amountPerPerson
      }));

      const { error: contributionsError } = await supabase
        .from('contributions')
        .insert(contributions);

      if (contributionsError) throw contributionsError;

      // Refresh expenses list
      fetchExpenses();

      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Expense Splitter</h1>
          <p className="text-muted-foreground">Track and split expenses with friends</p>
        </div>

        <div className={`grid gap-6 ${isMobile ? '' : 'md:grid-cols-[2fr,1fr]'}`}>
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
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <SettlementSummary expenses={expenses} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
