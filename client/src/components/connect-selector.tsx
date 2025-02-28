import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import React, { ChangeEvent, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

type ConnectSelector = {
  id: string;
  conditionName: string;
  options: { value: string; label: string }[];
  onOptionsChange: (newOptions: { value: string; label: string }[]) => void;
  value: string;
  onValueChange: (value: string) => void;
};

const ConnectSelector = ({
  id,
  conditionName,
  options,
  onOptionsChange,
  value,
  onValueChange,
}: ConnectSelector) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputtValue] = useState("");

  const handleConnectInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputtValue(e.target.value);
    if (!open) {
      setInputtValue("");
    }
  };

  const handleCreateConnectOption = () => {
    if (
      inputValue !== "" &&
      options.every((options) => options.value !== inputValue)
    )
      onOptionsChange([...options, { label: inputValue, value: inputValue }]);
    setInputtValue("");
    onValueChange(inputValue);
    setOpen(false);
  };

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{conditionName}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <div className="flex flex-1">
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="flex-1 justify-between"
              >
                {value
                  ? options.find((option) => option.value === value)?.label
                  : `Select ${conditionName}...`}
                <ChevronDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent className="p-0">
            <Command>
              <CommandInput
                placeholder={`Type ${conditionName}...`}
                className="h-9"
                createConnectOption={handleCreateConnectOption}
                onChangeCapture={handleConnectInputChange}
              />
              <CommandList>
                <CommandEmpty>No {conditionName} found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        onValueChange(
                          currentValue === value ? "" : currentValue
                        );
                        setOpen(false);
                      }}
                    >
                      {option.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ConnectSelector;
