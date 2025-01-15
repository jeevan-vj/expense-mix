import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface ExpensesHeaderProps {
  onSignOut: () => void;
}

export const ExpensesHeader = ({ onSignOut }: ExpensesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Expense Splitter</h1>
        <p className="text-muted-foreground">Track and split expenses with friends</p>
      </div>
      <Button variant="outline" onClick={onSignOut} className="gap-2">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};