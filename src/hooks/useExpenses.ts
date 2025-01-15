import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Expense {
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

export interface ExpenseFormData {
  title: string;
  amount: number;
  paidBy: string;
  participants: Array<{
    participant: string;
    amount: number;
  }>;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { toast } = useToast();

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
      const { error: contributionsError } = await supabase
        .from('contributions')
        .delete()
        .eq('expense_id', id);

      if (contributionsError) throw contributionsError;

      const { error: expenseError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (expenseError) throw expenseError;

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

  const handleEditExpense = async (id: string, updatedExpense: ExpenseFormData) => {
    try {
      const { error: deleteContributionsError } = await supabase
        .from('contributions')
        .delete()
        .eq('expense_id', id);

      if (deleteContributionsError) throw deleteContributionsError;

      const { error: expenseError } = await supabase
        .from('expenses')
        .update({
          title: updatedExpense.title,
          amount: updatedExpense.amount,
          paid_by: updatedExpense.paidBy,
        })
        .eq('id', id);

      if (expenseError) throw expenseError;

      const contributions = updatedExpense.participants.map(p => ({
        expense_id: id,
        participant: p.participant,
        amount: p.amount
      }));

      const { error: contributionsError } = await supabase
        .from('contributions')
        .insert(contributions);

      if (contributionsError) throw contributionsError;

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

  const handleAddExpense = async (newExpense: ExpenseFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          title: newExpense.title,
          amount: newExpense.amount,
          paid_by: newExpense.paidBy,
          user_id: user.id // Add the user_id here
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

      await fetchExpenses();

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

  return {
    expenses,
    fetchExpenses,
    handleDeleteExpense,
    handleEditExpense,
    handleAddExpense,
  };
};