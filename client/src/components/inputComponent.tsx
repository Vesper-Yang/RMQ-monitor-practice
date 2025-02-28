import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InputConponentProps = {
  label: string;
  id: string;
  type: string;
  name: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string | number;
  required?: boolean;
  className?: string;
};

const InputComponent = ({
  label,
  id,
  type,
  name,
  placeholder,
  onChange,
  value,
  required,
  className,
}: InputConponentProps) => {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          required={required}
          className={className}
        />
      </div>
    </div>
  );
};

export default InputComponent;
