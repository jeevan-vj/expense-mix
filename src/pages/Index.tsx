import { useState, useEffect } from "react";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpenseList } from "@/components/ExpenseList";
import { SettlementSummary } from "@/components/SettlementSummary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

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
        participants: expense.contributions.map(c => ({
          participant: c.participant,
          amount: c.amount
        }))
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

  const handleDeleteExpense = async (id: string) => {
    try {
      // First delete all contributions
      const { error: contributionsError } = await supabase
        .from('contributions')
        .delete()
        .eq('expense_id', id);

      if (contributionsError) throw contributionsError;

      // Then delete the expense
      const { error: expenseError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (expenseError) throw expenseError;

      // Update local state
      setExpenses(expenses.filter(expense => expense.id !== id));

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const handleEditExpense = async (id: string, updatedExpense: {
    title: string;
    amount: number;
    paidBy: string;
    participants: Array<{
      participant: string;
      amount: number;
    }>;
  }) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      // First, delete all existing contributions for this expense
      const { error: deleteContributionsError } = await supabase
        .from('contributions')
        .delete()
        .eq('expense_id', id);

      if (deleteContributionsError) throw deleteContributionsError;

      // Update the expense details
      const { error: expenseError } = await supabase
        .from('expenses')
        .update({
          title: updatedExpense.title,
          amount: updatedExpense.amount,
          paid_by: updatedExpense.paidBy,
        })
        .eq('id', id);

      if (expenseError) throw expenseError;

      // Create new contributions
      const contributions = updatedExpense.participants.map(p => ({
        expense_id: id,
        participant: p.participant,
        amount: p.amount
      }));

      const { error: contributionsError } = await supabase
        .from('contributions')
        .insert(contributions);

      if (contributionsError) throw contributionsError;

      // Refresh expenses to get the latest data
      await fetchExpenses();

      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  const handleAddExpense = async (newExpense: {
    title: string;
    amount: number;
    paidBy: string;
    participants: Array<{
      participant: string;
      amount: number;
    }>;
  }) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          title: newExpense.title,
          amount: newExpense.amount,
          paid_by: newExpense.paidBy,
          user_id: user.id
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      const contributions = newExpense.participants.map(p => ({
        expense_id: expenseData.id,
        participant: p.participant,
        amount: p.amount
      }));

      const { error: contributionsError } = await supabase
        .from('contributions')
        .insert(contributions);

      if (contributionsError) throw contributionsError;

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 px-4 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Expense Splitter</h1>
            <p className="text-muted-foreground">Track and split expenses with friends</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className={`grid gap-6 ${isMobile ? '' : 'md:grid-cols-[2fr,1fr]'}`}>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Recent Expenses</h2>
              <AddExpenseDialog onAddExpense={handleAddExpense} />
            </div>
            <ExpenseList 
              expenses={expenses} 
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
            />
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