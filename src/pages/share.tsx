import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpenseWithContributions {
  id: string;
  title: string;
  amount: number;
  paid_by: string;
  created_at: string;
  contributions: {
    participant: string;
    amount: number;
  }[];
}

const SharePage = () => {
  const [searchParams] = useSearchParams();
  const expenseId = searchParams.get("id");
  const participant = searchParams.get("participant");
  
  const { data: expense, isLoading, error } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      if (!expenseId) throw new Error("No expense ID provided");
      
      const { data, error } = await supabase
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
        .eq('id', expenseId)
        .single();

      if (error) throw error;
      return data as ExpenseWithContributions;
    },
    enabled: !!expenseId,
  });

  if (!expenseId || !participant) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted-foreground">
          Invalid share link. Missing expense ID or participant information.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted-foreground">
          {error ? "Error loading expense details." : "Expense not found."}
        </div>
      </div>
    );
  }

  const participantContribution = expense.contributions.find(
    c => c.participant === participant
  );

  if (!participantContribution) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted-foreground">
          No contribution found for this participant.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Expense Details for {participant}</CardTitle>
            <p className="text-muted-foreground">
              Amount owed to <span className="font-semibold">{expense.paid_by}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-2xl font-bold text-primary">
              Your share: ${participantContribution.amount.toFixed(2)}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Expense Details:</h3>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-lg">{expense.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Paid by {expense.paid_by}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        Your share: ${participantContribution.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total expense: ${expense.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharePage;