import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Settlement {
  person: string;
  owes: { [key: string]: number };
}

interface SettlementSummaryProps {
  expenses: Array<{
    id: string;  // Changed from number to string to match Supabase UUID
    title: string;
    amount: number;
    paidBy: string;
    participants: string[];
  }>;
}

export const SettlementSummary = ({ expenses }: SettlementSummaryProps) => {
  const { toast } = useToast();

  const calculateSettlements = () => {
    const balances: { [key: string]: { [key: string]: number } } = {};

    expenses.forEach((expense) => {
      const amountPerPerson = expense.amount / expense.participants.length;

      expense.participants.forEach((participant) => {
        if (!balances[participant]) {
          balances[participant] = {};
        }

        if (participant !== expense.paidBy) {
          // Participant owes money to paidBy
          balances[participant][expense.paidBy] = (balances[participant][expense.paidBy] || 0) + amountPerPerson;
        }
      });
    });

    return balances;
  };

  const handleShare = (person: string, owedTo: string, amount: number) => {
    // Find relevant expenses where this person owes money to owedTo
    const relevantExpenses = expenses.filter(
      (expense) => 
        expense.paidBy === owedTo && 
        expense.participants.includes(person)
    );

    // Create the share URL with expense details
    const shareData = {
      expenses: relevantExpenses.map(expense => ({
        title: expense.title,
        amount: (expense.amount / expense.participants.length).toFixed(2),
        paidBy: expense.paidBy,
        totalAmount: expense.amount,
      })),
      person,
      owedTo,
      totalOwed: amount,
    };

    // Create a shareable URL with the data encoded
    const shareUrl = `${window.location.origin}/share?data=${encodeURIComponent(JSON.stringify(shareData))}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Share link copied!",
        description: "The expense details link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy link",
        description: "Please try again or share the link manually.",
        variant: "destructive",
      });
    });
  };

  const settlements = calculateSettlements();
  const people = Array.from(new Set(expenses.flatMap(e => [e.paidBy, ...e.participants])));

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No settlements to display yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Settlement Summary</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Person</TableHead>
            <TableHead>Owes To</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[100px]">Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => {
            const owes = settlements[person] || {};
            return Object.entries(owes).map(([owedTo, amount]) => (
              <TableRow key={`${person}-${owedTo}`}>
                <TableCell className="font-medium">{person}</TableCell>
                <TableCell>{owedTo}</TableCell>
                <TableCell className="text-right">${amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(person, owedTo, amount)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </div>
  );
};