import React, { useState, useEffect } from 'react';

interface EditableCheckboxProps {
  checked: boolean;
  isEditing: boolean;
  fieldId: string;
  onChange: (fieldId: string, newValue: boolean) => void;
  className?: string;
}

export default function EditableCheckbox({
  checked,
  isEditing,
  fieldId,
  onChange,
  className = ''
}: EditableCheckboxProps) {
  const [localChecked, setLocalChecked] = useState(checked);

  useEffect(() => {
    setLocalChecked(checked);
  }, [checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalChecked(e.target.checked);
    onChange(fieldId, e.target.checked);
  };

  if (isEditing) {
    return (
      <input
        type="checkbox"
        checked={localChecked}
        onChange={handleChange}
        className={`accent-yellow-600 ${className}`}
      />
    );
  }

  // View Mode matches ACORD form typical checked box
  if (localChecked) {
    return <span className={`w-3 h-3 border border-black flex items-center justify-center font-bold inline-flex ${className}`}>X</span>;
  }
  return <span className={`w-3 h-3 border border-black inline-flex ${className}`}></span>;
}
