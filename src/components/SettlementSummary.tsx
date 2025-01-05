import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Settlement {
  person: string;
  owes: { [key: string]: number };
}

interface SettlementSummaryProps {
  expenses: Array<{
    amount: number;
    paidBy: string;
    participants: string[];
  }>;
}

export const SettlementSummary = ({ expenses }: SettlementSummaryProps) => {
  // Calculate settlements
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
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </div>
  );
};