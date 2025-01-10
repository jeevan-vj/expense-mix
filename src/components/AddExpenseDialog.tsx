import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  name: string;
  amount: string;
}

interface AddExpenseDialogProps {
  onAddExpense: (expense: {
    title: string;
    amount: number;
    paidBy: string;
    participants: { participant: string; amount: number }[];
  }) => void;
}

export const AddExpenseDialog = ({ onAddExpense }: AddExpenseDialogProps) => {
  const [title, setTitle] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([{ name: "", amount: "" }]);
  const { toast } = useToast();

  const addParticipant = () => {
    setParticipants([...participants, { name: "", amount: "" }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      const newParticipants = [...participants];
      newParticipants.splice(index, 1);
      setParticipants(newParticipants);
    }
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  const calculateTotal = () => {
    return participants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !paidBy || participants.some(p => !p.name || !p.amount)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = calculateTotal();
    
    onAddExpense({
      title,
      amount: totalAmount,
      paidBy,
      participants: participants.map(p => ({
        participant: p.name,
        amount: parseFloat(p.amount),
      })),
    });

    setTitle("");
    setPaidBy("");
    setParticipants([{ name: "", amount: "" }]);

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
            <Label htmlFor="paidBy">Paid By</Label>
            <Input
              id="paidBy"
              placeholder="John"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Participants</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addParticipant}
                className="gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add
              </Button>
            </div>
            {participants.map((participant, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>Participant {index + 1}</Label>
                  {participants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(index)}
                      className="h-8 w-8 p-0"
                    >
                      <MinusCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Name"
                  value={participant.name}
                  onChange={(e) => updateParticipant(index, "name", e.target.value)}
                  className="mb-2"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={participant.amount}
                    onChange={(e) => updateParticipant(index, "amount", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold text-primary">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          <Button type="submit" className="w-full">Add Expense</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};