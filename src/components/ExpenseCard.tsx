import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface ExpenseCardProps {
  title: string;
  amount: number;
  date: Date;
  paidBy: string;
  participants: Array<{
    participant: string;
    amount: number;
  }>;
}

export const ExpenseCard = ({ title, amount, date, paidBy, participants }: ExpenseCardProps) => {
  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="text-2xl font-bold text-primary">
          ${amount.toFixed(2)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(date, { addSuffix: true })}
        </div>
        <div className="mt-2">
          <span className="font-medium">Paid by:</span> {paidBy}
        </div>
        <div className="mt-4">
          <span className="font-medium">Contributions:</span>
          <div className="mt-2 space-y-2">
            {participants.map((p, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{p.participant}</span>
                <span className="font-medium">${p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};