import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Stepper, Step, StepLabel, Snackbar, Box, Typography, Grid, Card, CardContent } from '@mui/material';
import LayoutCheckout from '../../components/layouts/layout-checkout';
import Head from 'next/head';
import { CheckoutInput } from '../../features/checkout/checkout.types';
import { GetServerSideProps, NextPage } from 'next';
import { getComic } from '../../services/marvel/marvel.service';
import router from 'next/router';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';

interface CheckoutPageProps {
  comic: Comic | null;
  error?: string;
}

interface Comic {
  id: number;
  title: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  };
  price: number;
  oldPrice: number;
  stock: number;
}

const CheckoutPage: NextPage<CheckoutPageProps> = ({ comic, error }) => {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<CheckoutInput>({
    mode: 'onChange', // Activar la validación en tiempo real
  });
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [cardDetails, setCardDetails] = useState({
    cvc: '',
    expiry: '',
    name: '',
    number: '',
  });

  if (!comic) {
    return (
      <LayoutCheckout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          {error ? (
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          ) : (
            <Typography variant="h6">Cómic no encontrado.</Typography>
          )}
        </Box>
      </LayoutCheckout>
    );
  }

  const steps = ['Datos Personales', 'Dirección de Entrega', 'Datos del Pago'];

  const onSubmit = async (data: CheckoutInput) => {
    try {
      const sanitizedData = {
        ...data,
        card: {
          ...data.card,
          number: data.card.number.replace(" ", ""),
          cvc: data.card.cvc,
        },
        customer: {
          ...data.customer,
          address: {
            ...data.customer.address,
            state: data.customer.address.state,
            zipCode: data.customer.address.zipCode,
          },
        },
        order: {
          name: comic.title,
          image: `${comic.thumbnail.path}.${comic.thumbnail.extension}`,
          price: comic.price,
        },
      };

      console.log('Datos sanitizados enviados a la API:', sanitizedData);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        localStorage.setItem('orderData', JSON.stringify(sanitizedData));
        router.push('/confirmacion-compra');
      } else {
        const errorData = await response.json();
        console.error('Error en la respuesta de la API:', errorData);
        handleApiError(errorData);
      }
    } catch (error) {
      console.error('Error al procesar el checkout:', error);
      handleApiError({ error: 'ERROR_SERVER' });
    }
  };

  const handleApiError = (errorData: any) => {
    let message = '';
    switch (errorData.error) {
      case 'ERROR_CARD_WITHOUT_FUNDS':
        message = 'Tarjeta sin fondos disponibles';
        break;
      case 'ERROR_CARD_WITHOUT_AUTHORIZATION':
        message = 'Tarjeta sin autorización. Comuníquese con su banco e intente nuevamente.';
        break;
      case 'ERROR_CARD_DATA_INCORRECT':
        message = 'Datos de tarjeta incorrecta';
        break;
      case 'ERROR_INCORRECT_ADDRESS':
        message = 'Dirección de entrega incorrecta';
        break;
      case 'ERROR_SERVER':
        message = 'Error de servidor. Intente nuevamente';
        break;
      default:
        message = 'Error desconocido. Intente nuevamente';
    }
    setSnackbar({ open: true, message });
  };

  const handleNext = () => {
    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value.replace(/\s+/g, ''),
    });
  };

  return (
    <LayoutCheckout>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <Box sx={{ flexGrow: 1, minHeight: 'calc(100vh - 100px)', padding: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center">Compra de Cómic</Typography>

        <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
          {/* Columna de la izquierda: Detalles del cómic */}
          <Grid item xs={12} md={5}>
            <Card>
              <img
                src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
                alt={comic.title}
                style={{ width: '100%', height: 'auto' }}
              />
              <CardContent>
                <Typography variant="h5" gutterBottom>{comic.title}</Typography>
                <Typography variant="h6">Precio: ${comic.price}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Columna de la derecha: Formulario de checkout */}
          <Grid item xs={12} md={7}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ marginBottom: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <form onSubmit={handleSubmit(onSubmit)}>
              {activeStep === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="customer.name"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Nombre es requerido' }}
                      render={({ field }) => <TextField {...field} label="Nombre" fullWidth error={!!errors.customer?.name} helperText={errors.customer?.name?.message} />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="customer.lastname"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Apellido es requerido' }}
                      render={({ field }) => <TextField {...field} label="Apellido" fullWidth error={!!errors.customer?.lastname} helperText={errors.customer?.lastname?.message} />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="customer.email"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Email es requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } }}
                      render={({ field }) => <TextField {...field} label="Email" fullWidth error={!!errors.customer?.email} helperText={errors.customer?.email?.message} />}
                    />
                  </Grid>
                </Grid>
              )}
              {activeStep === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="customer.address.address1"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Dirección es requerida' }}
                      render={({ field }) => <TextField {...field} label="Dirección" fullWidth error={!!errors.customer?.address?.address1} helperText={errors.customer?.address?.address1?.message} />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="customer.address.address2"
                      control={control}
                      defaultValue=""
                      render={({ field }) => <TextField {...field} label="Departamento, piso, etc." fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="customer.address.city"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Ciudad es requerida' }}
                      render={({ field }) => <TextField {...field} label="Ciudad" fullWidth error={!!errors.customer?.address?.city} helperText={errors.customer?.address?.city?.message} />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="customer.address.state"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Provincia es requerida' }}
                      render={({ field }) => <TextField {...field} label="Provincia" fullWidth error={!!errors.customer?.address?.state} helperText={errors.customer?.address?.state?.message} />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="customer.address.zipCode"
                      control={control}
                      defaultValue=""
                      rules={{ required: 'Código postal es requerido' }}
                      render={({ field }) => <TextField {...field} label="Código postal" fullWidth error={!!errors.customer?.address?.zipCode} helperText={errors.customer?.address?.zipCode?.message} />}
                    />
                  </Grid>
                </Grid>
              )}
              {activeStep === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <Cards
                      cvc={cardDetails.cvc}
                      expiry={cardDetails.expiry}
                      name={cardDetails.name}
                      number={cardDetails.number}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Controller
                        name="card.number"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'Número de tarjeta es requerido' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            name="number"
                            label="Número de Tarjeta"
                            fullWidth
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e);
                              handleInputChange(e);
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="card.nameOnCard"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'Nombre en la tarjeta es requerido' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            name="name"
                            label="Nombre en la Tarjeta"
                            fullWidth
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e);
                              handleInputChange(e);
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="card.expDate"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'Fecha de expiración es requerida' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            name="expiry"
                            label="Fecha de Expiración"
                            fullWidth
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e);
                              handleInputChange(e);
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="card.cvc"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'Código de seguridad es requerido' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            name="cvc"
                            label="Código de Seguridad"
                            fullWidth
                            type="password"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              field.onChange(e);
                              handleInputChange(e);
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              <Box mt={4} display="flex" justifyContent="space-between">
                <Button disabled={activeStep === 0} onClick={handleBack}>Volver</Button>
                {activeStep === steps.length - 1 ? (
                  <Button type="submit" variant="contained" color="primary">Comprar</Button>
                ) : (
                  <Button onClick={handleNext} variant="contained" color="primary" disabled={!isValid}>
                    Siguiente
                  </Button>
                )}
              </Box>
            </form>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </LayoutCheckout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  try {
    const comic = await getComic(Number(id));

    if (!comic) {
      return { props: { comic: null, error: 'Cómic no encontrado.' } };
    }

    return { props: { comic } };
  } catch (error) {
    console.error('Error al obtener el cómic:', error);
    return { props: { comic: null, error: 'Error al cargar el cómic.' } };
  }
};

export default CheckoutPage;
