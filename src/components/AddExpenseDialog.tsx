import { useState } from "react";
import * as React from "react";
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
import { ExpenseFormHeader } from "./ExpenseFormHeader";
import { ExpenseParticipantForm } from "./ExpenseParticipantForm";

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
    const currentParticipants = watch("participants") || [];
    
    const updatedParticipants = currentParticipants.map(p => ({
      participant: p.participant || "",
      amount: splitAmount,
    }));
    
    setValue("participants", updatedParticipants);
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
    const newCount = participantCount + 1;
    setParticipantCount(newCount);
    
    const currentParticipants = watch("participants") || [];
    const newParticipant = { 
      participant: "", 
      amount: splitEvenly ? Number(amount) / newCount : 0 
    };
    
    if (splitEvenly) {
      const splitAmount = Number(amount) / newCount;
      const updatedParticipants = currentParticipants.map(p => ({
        ...p,
        amount: splitAmount
      }));
      setValue("participants", [...updatedParticipants, newParticipant]);
    } else {
      setValue("participants", [...currentParticipants, newParticipant]);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    const newCount = participantCount - 1;
    if (newCount < 2) return;
    
    setParticipantCount(newCount);
    const currentParticipants = watch("participants") || [];
    const updatedParticipants = currentParticipants.filter((_, i) => i !== index);
    
    if (splitEvenly) {
      const splitAmount = Number(amount) / newCount;
      const recalculatedParticipants = updatedParticipants.map(p => ({
        ...p,
        amount: splitAmount
      }));
      setValue("participants", recalculatedParticipants);
    } else {
      setValue("participants", updatedParticipants);
    }
  };

  const handleSplitEvenlyToggle = (checked: boolean) => {
    setSplitEvenly(checked);
    if (checked) {
      handleSplitEvenly();
    }
  };

  React.useEffect(() => {
    if (splitEvenly && amount) {
      handleSplitEvenly();
    }
  }, [amount, splitEvenly]);

  React.useEffect(() => {
    if (initialData?.participants) {
      const totalAmount = initialData.amount;
      const splitAmount = totalAmount / initialData.participants.length;
      const isEvenSplit = initialData.participants.every(
        p => Math.abs(p.amount - splitAmount) < 0.01
      );
      setSplitEvenly(isEvenSplit);
    }
  }, [initialData]);

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
          <ExpenseFormHeader
            register={register}
            splitEvenly={splitEvenly}
            onSplitEvenlyChange={handleSplitEvenlyToggle}
            onAddParticipant={handleAddParticipant}
          />

          <div className="space-y-4">
            {Array(participantCount)
              .fill(null)
              .map((_, index) => (
                <ExpenseParticipantForm
                  key={index}
                  index={index}
                  participant={watch(`participants.${index}.participant`)}
                  amount={watch(`participants.${index}.amount`)}
                  isDisabled={splitEvenly}
                  onRemove={handleRemoveParticipant}
                  register={register}
                  canDelete={participantCount > 2}
                />
              ))}
          </div>

          <Button type="submit" className="w-full">
            {isEditing ? "Save Changes" : "Add Expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};