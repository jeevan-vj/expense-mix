import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface ExpenseFormHeaderProps {
  register: any;
  splitEvenly: boolean;
  onSplitEvenlyChange: (checked: boolean) => void;
  onAddParticipant: () => void;
}

export const ExpenseFormHeader = ({
  register,
  splitEvenly,
  onSplitEvenlyChange,
  onAddParticipant,
}: ExpenseFormHeaderProps) => {
  return (
    <>
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
                onCheckedChange={onSplitEvenlyChange}
              />
              <Label>Split Evenly</Label>
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onAddParticipant}
          >
            Add Participant
          </Button>
        </div>
      </div>
    </>
  );
};