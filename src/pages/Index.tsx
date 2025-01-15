import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpensesSummary } from "@/components/ExpensesSummary";
import { ExpensesHeader } from "@/components/ExpensesHeader";
import { useExpenses } from "@/hooks/useExpenses";

const Index = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    expenses, 
    fetchExpenses, 
    handleDeleteExpense, 
    handleEditExpense, 
    handleAddExpense 
  } = useExpenses();

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 px-4 md:px-8">
        <ExpensesHeader onSignOut={handleSignOut} />

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

          <ExpensesSummary expenses={expenses} />
        </div>
      </div>
    </div>
  );
};

export default Index;