import React, { useState, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  isEditing: boolean;
  fieldId: string;
  onChange: (fieldId: string, newValue: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export default function EditableText({
  value,
  isEditing,
  fieldId,
  onChange,
  className = '',
  placeholder = '',
  multiline = false
}: EditableTextProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync with upstream changes if any occur while not editing locally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    onChange(fieldId, e.target.value);
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-yellow-50 border border-yellow-300 outline-none p-0.5 resize-none ${className}`}
          rows={3}
        />
      );
    }
    return (
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-yellow-50 border border-yellow-300 outline-none p-0.5 ${className}`}
      />
    );
  }

  // View Mode
  if (multiline) {
    return <div className={`whitespace-pre-wrap ${className}`}>{value}</div>;
  }
  return <span className={className}>{value}</span>;
}
