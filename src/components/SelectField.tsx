import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { inputField } from '../styles/AdminStyles'; //'../../styles/AdminStyles';

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: { key: string; value: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, options, onChange }) => {
  return (
    <TextField
      label={label}
      name={name}
      select
      fullWidth
      value={options.some(option => option.key === value) ? value : ""}
      onChange={onChange}
      sx={inputField}
      slotProps={{
        inputLabel: {
          shrink: true,
          sx: {
            color: '#444444',
            '&.Mui-focused': {
              color: '#47b2e4',
            },
          },
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.key} value={option.key}>
          {option.value}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectField;