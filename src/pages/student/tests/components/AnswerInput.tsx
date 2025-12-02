import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/Textarea';

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AnswerInput({ value, onChange, placeholder }: AnswerInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Textarea
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="min-h-[150px] text-lg"
      autoFocus
    />
  );
}

