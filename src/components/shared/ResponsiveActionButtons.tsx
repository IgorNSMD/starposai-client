import React from 'react';
import { Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface Props {
  onAdd?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  addLabel?: string;
}

const ResponsiveActionButtons: React.FC<Props> = ({
  onAdd,
  onSearch,
  onExport,
  addLabel = 'New',
}) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      justifyContent="flex-start"
      alignItems={{ xs: 'stretch', sm: 'center' }}
      sx={{ mt: 2 }}
    >
      {onAdd && (
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onAdd}>
          {addLabel}
        </Button>
      )}
      {onExport && (
        <Button variant="contained" color="success" startIcon={<FileDownloadIcon />} onClick={onExport}>
          Export to Excel
        </Button>
      )}
      {onSearch && (
        <Button variant="contained" color="secondary" startIcon={<SearchIcon />} onClick={onSearch}>
          Search
        </Button>
      )}
    </Stack>
  );
};

export default ResponsiveActionButtons;
