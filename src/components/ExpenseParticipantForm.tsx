import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExpenseParticipantFormProps {
  index: number;
  participant: string;
  amount: number;
  isDisabled: boolean;
  onRemove: (index: number) => void;
  register: any;
  canDelete: boolean;
}

export const ExpenseParticipantForm = ({
  index,
  isDisabled,
  onRemove,
  register,
  canDelete,
}: ExpenseParticipantFormProps) => {
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
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
            disabled={isDisabled}
            {...register(`participants.${index}.amount` as const, {
              required: true,
              valueAsNumber: true,
            })}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-destructive hover:text-destructive"
            onClick={() => onRemove(index)}
            disabled={!canDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};