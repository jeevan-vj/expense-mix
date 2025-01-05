import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddExpenseDialogProps {
  onAddExpense: (expense: {
    title: string;
    amount: number;
    paidBy: string;
    participants: string[];
  }) => void;
}

export const AddExpenseDialog = ({ onAddExpense }: AddExpenseDialogProps) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount || !paidBy || !participants) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const participantsList = participants.split(",").map(p => p.trim());
    
    onAddExpense({
      title,
      amount: parseFloat(amount),
      paidBy,
      participants: participantsList,
    });

    setTitle("");
    setAmount("");
    setPaidBy("");
    setParticipants("");

    toast({
      title: "Success",
      description: "Expense added successfully",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Dinner at Joe's"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid By</Label>
            <Input
              id="paidBy"
              placeholder="John"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="participants">Participants (comma-separated)</Label>
            <Input
              id="participants"
              placeholder="John, Jane, Bob"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Add Expense</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};