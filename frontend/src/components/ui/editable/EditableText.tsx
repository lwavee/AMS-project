import React from 'react';

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(fieldId, e.target.value);
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={value}
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
        value={value}
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
