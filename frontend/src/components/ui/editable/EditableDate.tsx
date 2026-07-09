import React, { useState, useEffect } from 'react';

interface EditableDateProps {
  value: string;
  isEditing: boolean;
  fieldId: string;
  onChange: (fieldId: string, newValue: string) => void;
  className?: string;
}

export default function EditableDate({
  value,
  isEditing,
  fieldId,
  onChange,
  className = ''
}: EditableDateProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange(fieldId, e.target.value);
  };

  if (isEditing) {
    return (
      <input
        type="date"
        value={localValue}
        onChange={handleChange}
        className={`bg-yellow-50 border border-yellow-300 outline-none p-0.5 text-[8px] ${className}`}
      />
    );
  }

  return <span className={className}>{value}</span>;
}
