import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { formPageStyles } from '../../styles/formPageStyles';

interface FormPageTemplateProps {
  title: string;
  children?: React.ReactNode;
  form?: React.ReactNode;
  table?: React.ReactNode;
  actions?: React.ReactNode;
}

const FormPageTemplate: React.FC<FormPageTemplateProps> = ({
  title,
  children,
  form,
  table,
  actions,
}) => {
  return (
    <Box sx={formPageStyles.container}>
      <Paper sx={formPageStyles.sectionCard}>
        <Typography sx={formPageStyles.title}>{title}</Typography>
        {form && <Box sx={formPageStyles.form}>{form}</Box>}
        {actions && <Box>{actions}</Box>}
        {children}
      </Paper>

      {table && (
        <Paper sx={Object.assign({}, formPageStyles.sectionCard, formPageStyles.datagridBox)}>
            {table}
         </Paper>
      )}
    </Box>
  );
};

export default FormPageTemplate;
