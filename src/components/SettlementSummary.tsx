import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface Settlement {
  person: string;
  owes: { [key: string]: number };
}

interface SettlementSummaryProps {
  expenses: Array<{
    id: string;
    title: string;
    amount: number;
    paidBy: string;
    participants: Array<{
      participant: string;
      amount: number;
    }>;
  }>;
}

export const SettlementSummary = ({ expenses }: SettlementSummaryProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const calculateSettlements = () => {
    const balances: { [key: string]: { [key: string]: number } } = {};

    expenses.forEach((expense) => {
      expense.participants.forEach((participant) => {
        if (!balances[participant.participant]) {
          balances[participant.participant] = {};
        }

        if (participant.participant !== expense.paidBy) {
          // Participant owes money to paidBy
          balances[participant.participant][expense.paidBy] = 
            (balances[participant.participant][expense.paidBy] || 0) + participant.amount;
        }
      });
    });

    return balances;
  };

  const handleShare = (person: string, owedTo: string, amount: number) => {
    const relevantExpense = expenses.find(
      (expense) => 
        expense.paidBy === owedTo && 
        expense.participants.some(p => p.participant === person)
    );

    if (!relevantExpense) {
      toast({
        title: "Error",
        description: "Could not find relevant expense details.",
        variant: "destructive",
      });
      return;
    }

    const shareUrl = `${window.location.origin}/share?id=${relevantExpense.id}&participant=${person}`;

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
  const people = Array.from(new Set(expenses.flatMap(e => [e.paidBy, ...e.participants.map(p => p.participant)])));

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No settlements to display yet.
      </div>
    );
  }

  const MobileView = () => (
    <div className="space-y-4">
      {people.map((person) => {
        const owes = settlements[person] || {};
        return Object.entries(owes).map(([owedTo, amount]) => (
          <Card key={`${person}-${owedTo}`} className="bg-white">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">From</div>
                  <div className="font-medium">{person}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">To</div>
                  <div className="font-medium">{owedTo}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium text-primary">${amount.toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(person, owedTo, amount)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ));
      })}
    </div>
  );

  const DesktopView = () => (
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
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Settlement Summary</h3>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
};