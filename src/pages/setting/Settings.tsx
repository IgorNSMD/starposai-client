import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 

  IconButton, 
  PaperProps,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions} from '@mui/material';
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import AddIcon from '@mui/icons-material/Add';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';

import { 
  fetchSettingByContext, 
  updateSetting, 
  createSetting, Setting
 } from '../../store/slices/settingSlice'; //'../../store/slices/SettingSlice';

import { fetchCompanyById, selectActiveSubscription  } from '../../store/slices/companySlice'; //'../../store/slices/companySlice';

import {
  fetchVenues,
  deleteVenue,
  Venue,
  updateVenueSetting,
  createVenueWithSetting
} from '../../store/slices/venueSlice';

import { fetchParametersByCategory } from '../../store/slices/parameterSlice';
import { selectActiveCompanyVenue } from '../../store/slices/authSlice';

import { useToastMessages } from '../../hooks/useToastMessage';
import { 
  formContainer, 
  inputField, 
  submitButton, 
  formTitle, 
  datagridStyle,
  modalTitleStyle,
  inputContainer,  } from '../../styles/AdminStyles';
import SelectField from '../../components/SelectField'; // o la ruta correcta
import CustomDialog from '../../components/Dialog'; // 👈 Reutilizamos tu mismo Dialog


const DraggablePaper = (props: PaperProps) => {
  const nodeRef = useRef(null);
  return (
    <Draggable handle="#draggable-dialog-title" nodeRef={nodeRef}>
      <div ref={nodeRef}>
        <Paper {...props} />
      </div>
    </Draggable>
  );
};

interface FormData {
  _id: string | null;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  taxRate: number;
  isTaxIncluded: boolean;
  contactEmail: string;
  contactPhone: string;
  fiscalId: string;
  fiscalAddress: string;
  country: string;
}

interface VenueSettingFormData {
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  taxRate: number;
  isTaxIncluded: boolean;
}

// 🔹 Crea un Venue vacío seguro
const getEmptyVenue = (): Venue => ({
  _id: undefined,
  companyId: '', // 👈 no te preocupes, después lo rellenamos al guardar
  name: '',
  address: '',
  phone: '',
  email: '',
  status: "active",
  createdAt: '',
  updatedAt: '',
});


const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentSetting, errorMessage, successMessage } = useAppSelector((state) => state.settings);
  const activeSubscription = useAppSelector(selectActiveSubscription);
  const globalCompanyVenue = useAppSelector(selectActiveCompanyVenue);
  const activeCompanyId = globalCompanyVenue?.activeCompanyId || "";


  const currencies = useAppSelector((state) => state.parameters.parametersByCategory["Currency"] || []);
  const languages = useAppSelector((state) => state.parameters.parametersByCategory["Language"] || []);
  const countries = useAppSelector((state) => state.parameters.parametersByCategory["Country"] || []);

  const { venues } = useAppSelector(state => state.venues);

  const [openVenueModal, setOpenVenueModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(getEmptyVenue());


  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [venueIdToDelete, setVenueIdToDelete] = useState<string | null>(null);

  const [selectedVenueSetting, setSelectedVenueSetting] = useState<VenueSettingFormData>({
    currency: '',
    language: '',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    taxRate: 0,
    isTaxIncluded: true,
  });
  

  const [formData, setFormData] = useState<FormData>({
    _id: null,
    companyName: '',
    email: '',
    phone: '',
    address: '',
    currency: '',
    timezone: '',
    language: '',
    dateFormat: 'YYYY-MM-DD',
    taxRate: 0,
    isTaxIncluded: false,
    contactEmail: '',
    contactPhone: '', 
    fiscalId: '',
    fiscalAddress: '',
    country: '',
  });


  useToastMessages(successMessage, errorMessage);

  useEffect(() => {
    if (activeCompanyId) {
      dispatch(fetchCompanyById(activeCompanyId));
      dispatch(fetchVenues());
    }
  }, [activeCompanyId, dispatch]);

  useEffect(() => {
    dispatch(fetchSettingByContext());
  }, [dispatch, ]);

  useEffect(() => {
    const parameterCategories = [
      { name: "Currency", list: currencies },
      { name: "Language", list: languages },
      { name: "Country", list: countries },
    ];
  
    parameterCategories.forEach(({ name, list }) => {
      if (list.length === 0) {
        dispatch(fetchParametersByCategory(name));
      }
    });
  }, [currencies, languages, countries, dispatch]);

  useEffect(() => {
    if (currentSetting) {
      setFormData({
        _id: currentSetting._id || null,
        companyName: currentSetting.companyName,
        email: currentSetting.email,
        phone: currentSetting.phone,
        address: currentSetting.address,
        currency: currentSetting.currency,
        language: currentSetting.language,
        timezone: currentSetting.timezone,
        dateFormat: currentSetting.dateFormat,
        taxRate: currentSetting.taxRate,
        isTaxIncluded: currentSetting.isTaxIncluded,
        contactEmail: currentSetting.contactEmail || '',
        contactPhone: currentSetting.contactPhone || '',
        fiscalId: currentSetting.fiscalId || '',
        fiscalAddress: currentSetting.fiscalAddress || '',
        country: currentSetting.country || '',
      });
    }
  }, [currentSetting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {

    const settingData: Partial<Setting> = {
      ...formData,
      _id: formData._id || undefined, // 👈 Aquí corregimos el tipo
    };

    if (currentSetting) {
      dispatch(updateSetting(settingData));
    } else {
      dispatch(createSetting(settingData));
    }
  };

  const handleChangeSetting = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedVenueSetting((prev) => ({
      ...prev,
      [name]: name === 'taxRate' ? Number(value) : value,
    }));
  };
  // 🔹 Funciones de Venue
  const handleAddVenue = () => {
    setSelectedVenue(getEmptyVenue());
    setSelectedVenueSetting({
      currency: formData.currency,
      language: formData.language,
      timezone: formData.timezone,
      dateFormat: formData.dateFormat,
      taxRate: formData.taxRate,
      isTaxIncluded: formData.isTaxIncluded,
    });
    setOpenVenueModal(true);
  };

  const handleEditVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setSelectedVenueSetting({
      currency: formData.currency,
      language: formData.language,
      timezone: formData.timezone,
      dateFormat: formData.dateFormat,
      taxRate: formData.taxRate,
      isTaxIncluded: formData.isTaxIncluded,
    });
    setOpenVenueModal(true);
  };

  const handleDeleteVenue = (id: string) => {
    setVenueIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteVenue = () => {
    if (venueIdToDelete) {
      dispatch(deleteVenue(venueIdToDelete))
        .unwrap()
        .then(() => {
          console.log("Venue deleted successfully");
          dispatch(fetchVenues()); // 🚀 Actualiza lista
        })
        .catch((error) => {
          console.error("Error deleting venue:", error);
        });
    }
    setIsDeleteDialogOpen(false);
    setVenueIdToDelete(null);
  };

  const handleCancelDeleteVenue = () => {
    setIsDeleteDialogOpen(false);
    setVenueIdToDelete(null);
  };

  const handleSubmitVenue = () => {
    if (selectedVenue && selectedVenue._id) {
      dispatch(updateVenueSetting({
        venueId: selectedVenue._id!,
        venueData: {
          name: selectedVenue.name,
          address: selectedVenue.address,
          phone: selectedVenue.phone,
          email: selectedVenue.email,
          status: selectedVenue.status,
        },
        settingData: {
          currency: selectedVenueSetting.currency,
          taxRate: selectedVenueSetting.taxRate,
          isTaxIncluded: selectedVenueSetting.isTaxIncluded,
          language: selectedVenueSetting.language,
          timezone: selectedVenueSetting.timezone,
          dateFormat: selectedVenueSetting.dateFormat,
        }
      }))
      .unwrap()
      .then((response) => {
        const { venue, setting } = response;
  
        // 🔵 Actualiza los datos locales del modal
        setSelectedVenue(venue);
        setSelectedVenueSetting({
          currency: setting.currency,
          language: setting.language,
          timezone: setting.timezone,
          dateFormat: setting.dateFormat,
          taxRate: setting.taxRate,
          isTaxIncluded: setting.isTaxIncluded,
        });
  
        // 🚀 Actualiza la grilla
        dispatch(fetchVenues());
  
        // ⚡ NUEVO: actualiza los settings del contexto
        dispatch(fetchSettingByContext());
  
        // ✅ Cierra el modal
        setOpenVenueModal(false);
        setSelectedVenue(null);
      });
    } else if (selectedVenue) {
      dispatch(createVenueWithSetting({
        name: selectedVenue.name,
        address: selectedVenue.address,
        phone: selectedVenue.phone,
        email: selectedVenue.email,
        status: selectedVenue.status,
      }))
        .unwrap()
        .then(() => dispatch(fetchVenues()));
      setOpenVenueModal(false);
      setSelectedVenue(null);
    }
  };
  
  


  // 🔹 Columns Venue
  const venueColumns: GridColDef[] = [
    { field: 'name', headerName: 'Venue Name', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <IconButton 
            color="primary"
            size="small"
            onClick={() => handleEditVenue(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error"
            size="small"
            onClick={() => handleDeleteVenue(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // const taxIncludedOptions = [
  //   { key: "true", value: "Included" },
  //   { key: "false", value: "Not Included" }
  // ];

  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', width: '100%' }}>
        <Typography variant="h4" sx={formTitle}> Company Settings</Typography>
        <Box>
          <TextField
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            fullWidth
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
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
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
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
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
          />
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
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
          />

          {/* <SelectField
            label="Currency"
            name="currency"
            value={formData.currency}
            options={currencies}
            onChange={handleChange}
          /> */}

          {/* <SelectField
            label="Language"
            name="language"
            value={formData.language}
            options={languages}
            onChange={handleChange}
          /> */}

          {/* <TextField
            label="Date Format"
            name="dateFormat"
            value={formData.dateFormat}
            onChange={handleChange}
            fullWidth
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
          /> */}

          {/* <TextField
            label="Tax Rate"
            name="taxRate"
            type="number"
            value={formData.taxRate}
            onChange={handleChange}
            fullWidth
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
          /> */}
          
          {/* <SelectField
            label="Is Tax Included"
            name="isTaxIncluded"
            value={formData.isTaxIncluded ? "true" : "false"}
            options={taxIncludedOptions}
            onChange={(e) =>
              setFormData({ ...formData, isTaxIncluded: e.target.value === "true" })
            }
          /> */}

          <TextField
            label="Contact Email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            fullWidth
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
          />

          <TextField
            label="Contact Phone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            fullWidth
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
          />

          <TextField
            label="Fiscal ID"
            name="fiscalId"
            value={formData.fiscalId}
            onChange={handleChange}
            fullWidth
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
          />

          <TextField
            label="Fiscal Address"
            name="fiscalAddress"
            value={formData.fiscalAddress}
            onChange={handleChange}
            fullWidth
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
          />

          <SelectField
            label="Country"
            name="country"
            value={formData.country}
            options={countries}
            onChange={handleChange}
          />


        </Box>
        

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={submitButton}
        >
          Save
        </Button>
      </Paper>
      <Paper sx={{ padding: '20px', width: '100%', marginTop: '20px' }}>
        <Typography variant="h4" sx={formTitle}>Current Subscription</Typography>
        {activeSubscription ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">🪪 Plan: {activeSubscription?.plan?.name}</Typography>
            <Typography variant="body1">💳 Método de Pago: {activeSubscription?.paymentMethod}</Typography>
            <Typography variant="body1">
              📅 Último Pago: {activeSubscription?.lastPaymentDate ? new Date(activeSubscription.lastPaymentDate).toLocaleDateString() : "N/A"}
            </Typography>
            <Typography variant="body1">
              🔁 Renovación: {activeSubscription?.renewalDate ? new Date(activeSubscription.renewalDate).toLocaleDateString() : "N/A"}
            </Typography>
            <Typography variant="body1">💼 Estado de Pago: {activeSubscription?.paymentStatus}</Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">No hay suscripción activa</Typography>
        )}
      </Paper>
      <Paper sx={{ padding: '20px', width: '100%', marginTop: '20px' }}>
        <Typography variant="h4" sx={formTitle}>Venues</Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddVenue}
            sx={{ 
              borderRadius: "8px",
              fontWeight: "bold",
              "@media (max-width: 600px)": {
                fontSize: "0.8rem",
                padding: "6px 10px",
                minWidth: "120px",
              },
            }}
          >
            Add Venue
          </Button>          
        </Box>      


        <DataGrid
          rows={venues}
          columns={venueColumns}
          autoHeight
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          getRowId={(row) => row._id} // 🟰 Esta línea es la que soluciona todo
          sx={datagridStyle}
        />
      </Paper>

      {/* Modal de Crear/Editar Venue */}
      {openVenueModal && (
        <Dialog
          open={openVenueModal}
          onClose={() => setOpenVenueModal(false)}
          PaperComponent={DraggablePaper}
        >
          <DialogTitle 
            id="draggable-dialog-title" 
            sx={modalTitleStyle}>
            {selectedVenue && selectedVenue._id ? "Edit Venue" : "New Venue"}
          </DialogTitle>
          <DialogContent>
            <Box sx={inputContainer}>
              <TextField
                label="Name"
                name="name"
                value={selectedVenue?.name || ''}
                onChange={(e) =>
                  setSelectedVenue((prev) => {
                    if (!prev) return prev; // 👈 Si es null, lo retorna sin cambios
                
                    return {
                      ...prev,
                      name: e.target.value,
                    };
                  })
                }
                fullWidth
                sx={{ marginBottom: 2 }}
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
              />
              <TextField
                label="Address"
                name="address"
                value={selectedVenue?.address || ''}
                onChange={(e) =>
                  setSelectedVenue((prev) => {
                    if (!prev) return prev;
                
                    return {
                      ...prev,
                      address: e.target.value,
                    };
                  })
                }
                fullWidth
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
              />
            </Box>
            <Box sx={inputContainer}>
              <TextField
                label="Phone"
                name="phone"
                value={selectedVenue?.phone || ''}
                onChange={(e) =>
                  setSelectedVenue((prev) => {
                    if (!prev) return prev; // 👈 Si es null, lo retorna sin cambios
                
                    return {
                      ...prev,
                      phone: e.target.value,
                    };
                  })
                }
                fullWidth
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
              />
              <TextField
                label="Email"
                name="email"
                value={selectedVenue?.email || ''}
                onChange={(e) =>
                  setSelectedVenue((prev) => {
                    if (!prev) return prev; // 👈 Si es null, lo retorna sin cambios
                
                    return {
                      ...prev,
                      email: e.target.value,
                    };
                  })
                }
                fullWidth
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
              />
            </Box>
            <Box sx={{ mt: 3 }}>
            <Typography 
              variant="h6" 
              sx={modalTitleStyle}>
              Venue Settings
            </Typography>

            <Box sx={inputContainer}>
              <SelectField
                label="Currency"
                name="currency"
                value={selectedVenueSetting.currency}
                options={currencies}
                onChange={handleChangeSetting}
              />

              {/* <SelectField
                label="Language"
                name="language"
                value={selectedVenueSetting.language}
                options={languages}
                onChange={handleChangeSetting}
              /> */}
            </Box>    

            {/* <Box sx={inputContainer}>
              <TextField
                label="Tax Rate (%)"
                name="taxRate"
                type="number"
                value={selectedVenueSetting.taxRate}
                onChange={handleChangeSetting}
                fullWidth
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
              />

              <SelectField
                label="Is Tax Included"
                name="isTaxIncluded"
                value={selectedVenueSetting.isTaxIncluded ? "true" : "false"}
                options={[
                  { key: "true", value: "Included" },
                  { key: "false", value: "Not Included" }
                ]}
                onChange={(e) =>
                  setSelectedVenueSetting((prev) => ({
                    ...prev,
                    isTaxIncluded: e.target.value === "true",
                  }))
                }
              />

            </Box> */}
          </Box>

          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitVenue}
              sx={submitButton}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenVenueModal(false)}
              sx={submitButton}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog Confirmar Delete */}
      <CustomDialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this venue?"
        onClose={handleCancelDeleteVenue}
        onConfirm={handleConfirmDeleteVenue}
      />


    </Box>
  );
};

export default Settings;