import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ExpenseFormData {
  title: string;
  amount: number;
  paidBy: string;
  participants: Array<{
    participant: string;
    amount: number;
  }>;
}

interface AddExpenseDialogProps {
  onAddExpense?: (expense: ExpenseFormData) => void;
  onEditExpense?: (expense: ExpenseFormData) => void;
  isEditing?: boolean;
  initialData?: ExpenseFormData;
  trigger?: React.ReactNode;
}

export const AddExpenseDialog = ({ 
  onAddExpense, 
  onEditExpense,
  isEditing = false,
  initialData,
  trigger 
}: AddExpenseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [splitEvenly, setSplitEvenly] = useState(false);
  const [participantCount, setParticipantCount] = useState(
    initialData?.participants.length || 2
  );

  const { register, handleSubmit, reset, watch, setValue } = useForm<ExpenseFormData>({
    defaultValues: initialData || {
      title: "",
      amount: 0,
      paidBy: "",
      participants: Array(2).fill({ participant: "", amount: 0 }),
    },
  });

  const amount = watch("amount");

  const handleSplitEvenly = () => {
    const totalAmount = Number(amount);
    const splitAmount = totalAmount / participantCount;
    const participants = Array(participantCount).fill(null).map((_, index) => ({
      participant: watch(`participants.${index}.participant`),
      amount: splitAmount,
    }));
    setValue("participants", participants);
  };

  const onSubmit = (data: ExpenseFormData) => {
    if (isEditing && onEditExpense) {
      onEditExpense(data);
    } else if (onAddExpense) {
      onAddExpense(data);
    }
    setOpen(false);
    reset();
  };

  const handleAddParticipant = () => {
    setParticipantCount((prev) => prev + 1);
    const currentParticipants = watch("participants") || [];
    const newParticipant = { participant: "", amount: splitEvenly ? Number(amount) / (participantCount + 1) : 0 };
    
    if (splitEvenly) {
      // If split evenly is enabled, recalculate all amounts
      const splitAmount = Number(amount) / (participantCount + 1);
      const updatedParticipants = [...currentParticipants].map(p => ({
        ...p,
        amount: splitAmount
      }));
      setValue("participants", [...updatedParticipants, newParticipant]);
    } else {
      setValue("participants", [...currentParticipants, newParticipant]);
    }
  };

  const handleSplitEvenlyToggle = (checked: boolean) => {
    setSplitEvenly(checked);
    if (checked) {
      handleSplitEvenly();
    }
  };

  // Watch for amount changes to update split if needed
  const watchedAmount = watch("amount");
  React.useEffect(() => {
    if (splitEvenly && watchedAmount) {
      handleSplitEvenly();
    }
  }, [watchedAmount, splitEvenly]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Expense title"
              {...register("title", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { required: true, valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid By</Label>
            <Input
              id="paidBy"
              placeholder="Who paid?"
              {...register("paidBy", { required: true })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Participants</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={splitEvenly}
                    onCheckedChange={handleSplitEvenlyToggle}
                  />
                  <Label>Split Evenly</Label>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddParticipant}
              >
                Add Participant
              </Button>
            </div>

            <div className="space-y-4">
              {Array(participantCount)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`participant-${index}`}>Name</Label>
                        <Input
                          id={`participant-${index}`}
                          placeholder="Participant name"
                          {...register(`participants.${index}.participant` as const, {
                            required: true,
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`amount-${index}`}>Amount</Label>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          disabled={splitEvenly}
                          {...register(`participants.${index}.amount` as const, {
                            required: true,
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            {isEditing ? "Save Changes" : "Add Expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};