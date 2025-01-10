import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, MinusCircle, Equal, Variable } from "lucide-react";
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
  const [totalAmount, setTotalAmount] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([{ name: "", amount: "" }]);
  const [isEqualSplit, setIsEqualSplit] = useState(true);
  const { toast } = useToast();

  const addParticipant = () => {
    setParticipants([...participants, { name: "", amount: "" }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      const newParticipants = [...participants];
      newParticipants.splice(index, 1);
      setParticipants(newParticipants);
      if (isEqualSplit) {
        updateEqualAmounts(newParticipants);
      }
    }
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);

    if (field === "name" && isEqualSplit) {
      updateEqualAmounts(newParticipants);
    }

    // Validate total when updating amounts in varying mode
    if (field === "amount" && !isEqualSplit) {
      validateTotalAmount(newParticipants);
    }
  };

  const updateEqualAmounts = (currentParticipants: Participant[]) => {
    const validParticipants = currentParticipants.filter(p => p.name.trim());
    if (validParticipants.length === 0 || !totalAmount) return;

    const total = parseFloat(totalAmount);
    const equalAmount = (total / validParticipants.length).toFixed(2);

    const updatedParticipants = currentParticipants.map(p => ({
      ...p,
      amount: p.name.trim() ? equalAmount : ""
    }));

    setParticipants(updatedParticipants);
  };

  const validateTotalAmount = (currentParticipants: Participant[]) => {
    const sum = currentParticipants.reduce((total, p) => total + (parseFloat(p.amount) || 0), 0);
    const total = parseFloat(totalAmount);

    if (sum > total) {
      toast({
        title: "Warning",
        description: "Individual contributions exceed the total amount",
        variant: "destructive",
      });
    }
  };

  const handleSplitToggle = (checked: boolean) => {
    setIsEqualSplit(checked);
    if (checked && totalAmount) {
      updateEqualAmounts(participants);
    }
  };

  const handleTotalAmountChange = (value: string) => {
    setTotalAmount(value);
    if (isEqualSplit) {
      updateEqualAmounts(participants);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !paidBy || !totalAmount || participants.some(p => !p.name || !p.amount)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const sum = participants.reduce((total, p) => total + (parseFloat(p.amount) || 0), 0);
    const total = parseFloat(totalAmount);

    if (Math.abs(sum - total) > 0.01) {
      toast({
        title: "Error",
        description: "Individual contributions must equal the total amount",
        variant: "destructive",
      });
      return;
    }
    
    onAddExpense({
      title,
      amount: total,
      paidBy,
      participants: participants.map(p => ({
        participant: p.name,
        amount: parseFloat(p.amount),
      })),
    });

    setTitle("");
    setPaidBy("");
    setTotalAmount("");
    setParticipants([{ name: "", amount: "" }]);
    setIsEqualSplit(true);

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
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              placeholder="100.00"
              value={totalAmount}
              onChange={(e) => handleTotalAmountChange(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="split-mode"
                checked={isEqualSplit}
                onCheckedChange={handleSplitToggle}
              />
              <Label htmlFor="split-mode" className="text-sm">Equal Split</Label>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              {isEqualSplit ? (
                <Equal className="h-4 w-4" />
              ) : (
                <Variable className="h-4 w-4" />
              )}
              <span className="text-sm">
                {isEqualSplit ? "Split equally" : "Varying amounts"}
              </span>
            </div>
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
                    readOnly={isEqualSplit}
                    className={isEqualSplit ? "bg-gray-50" : ""}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Current Total:</span>
              <span className="font-bold text-primary">
                ${participants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
          <Button type="submit" className="w-full">Add Expense</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};