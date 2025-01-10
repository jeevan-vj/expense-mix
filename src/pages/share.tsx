import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
        <div className="container max-w-2xl py-8">
          <Card>
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

  const totalParticipants = expense.contributions.length;
  const averageAmount = expense.amount / totalParticipants;
  const isEqualSplit = expense.contributions.every(
    p => Math.abs(p.amount - averageAmount) < 0.01
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{expense.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(expense.created_at), { addSuffix: true })}
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              ${expense.amount.toFixed(2)}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Your Share Section */}
            <Card className="border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Your Share</div>
                    <div className="text-2xl font-bold text-primary">
                      ${participantContribution.amount.toFixed(2)}
                    </div>
                  </div>
                  <User className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Paid By Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium text-foreground">Paid by:</span>
                <span>{expense.paid_by}</span>
              </div>
            </div>

            {/* All Contributions Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  All Contributions ({isEqualSplit ? "Equal Split" : "Custom Split"})
                </span>
              </div>

              <div className="grid gap-2">
                {expense.contributions.map((p, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded-lg p-2 ${
                      p.participant === participant
                        ? "bg-primary/10 border border-primary"
                        : "bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{p.participant}</span>
                      {p.participant === participant && (
                        <span className="text-xs text-primary">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">${p.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharePage;