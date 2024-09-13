import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Typography, Container, Divider } from '@mui/material';
import LayoutCheckout from '../components/layouts/layout-checkout';
import Head from 'next/head';

const ConfirmacionCompra = () => {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const storedOrderData = localStorage.getItem('orderData');
    console.log('Datos almacenados en localStorage (orderData):', storedOrderData);

    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
    } else {
      router.push('/');
    }
  }, []);

  if (!orderData) return null;

  const { customer, order } = orderData;
  const { name, lastname, email, address } = customer;
  const { title, image, price } = order;
  const { address1, address2, city, state, zipCode } = address;

  return (
    <LayoutCheckout>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      <Container sx={{ marginTop: 4, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', maxWidth: '100%', padding: 4 }}>
        
        {/* Información del cómic a la izquierda */}
        <Box sx={{ flex: 1, maxWidth: 400, marginRight: 4 }}>
          <img
            src={image as string}
            alt={title as string}
            style={{ width: '100%', height: 'auto', borderRadius: 8, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}
          />
        </Box>

        {/* Ticket de información del cómic y del cliente a la derecha */}
        <Box
          sx={{
            flex: 1,
            padding: 3,
            border: '2px dashed #ccc',
            borderRadius: 2,
            maxWidth: 400,
            backgroundColor: '#fdfdfd',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Courier, monospace',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Título del cómic */}
          <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold">
            {title}
          </Typography>
          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Precio pagado */}
          <Typography variant="h6" textAlign="center" sx={{ marginBottom: 2 }}>
            Precio Pagado: ${price}
          </Typography>
          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Detalles del cliente */}
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            <strong>Nombre:</strong> {name} {lastname}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            <strong>Email:</strong> {email}
          </Typography>
          <Divider sx={{ my: 2, width: '100%' }} />
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            <strong>Dirección de Entrega:</strong>
            <br />
            {address1} {address2 ? `, ${address2}` : ''}, {city}, {state}, {zipCode}
          </Typography>
          <Divider sx={{ my: 2, width: '100%' }} />

          {/* Simulación de Código de Barras */}
          <Box
            sx={{
              width: '80%',
              height: '60px',
              backgroundImage: 'linear-gradient(to right, black 40%, white 40%, white 60%, black 60%)',
              backgroundSize: '10px 100%',
              marginTop: 3,
              marginBottom: 1,
            }}
          />
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#999' }}>
            0123456789
          </Typography>

          {/* Mensaje de agradecimiento */}
          <Typography variant="body1" sx={{ marginTop: 3, textAlign: 'center' }}>
            <strong>¡Gracias por su compra!</strong>
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#999' }}>
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Container>
    </LayoutCheckout>
  );
};

export default ConfirmacionCompra;
