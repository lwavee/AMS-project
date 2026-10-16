import React from 'react';

interface EditableSelectProps {
  value: string;
  options: { label: string; value: string }[];
  isEditing: boolean;
  fieldId: string;
  onChange: (fieldId: string, newValue: string) => void;
  className?: string;
}

export default function EditableSelect({
  value,
  options,
  isEditing,
  fieldId,
  onChange,
  className = ''
}: EditableSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(fieldId, e.target.value);
  };

  if (isEditing) {
    return (
      <select
        value={value}
        onChange={handleChange}
        className={`bg-yellow-50 border border-yellow-300 outline-none p-0.5 ${className}`}
      >
        <option value=""></option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  const selectedOpt = options.find((opt) => opt.value === value);
  return <span className={className}>{selectedOpt ? selectedOpt.label : value}</span>;
}
