import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Container } from '@mui/material';
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

      {/* Contenedor Principal */}
      <Container sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%', padding: 4 }}>
        
        {/* Banner Superior */}
        <Box sx={{ backgroundColor: 'green', color: 'white', padding: 4, textAlign: 'center', width: '100%' }}>
          <Typography variant="h4">¡Que disfrutes tu compra!</Typography>
        </Box>

        {/* Contenedor de información del cómic y del cliente */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 4 }}>
          {/* Información del cómic */}
          <Box sx={{ flex: 1, marginRight: 4 }}>
            <Card>
              <img
                src={image as string}
                alt={title as string}
                style={{ width: '100%', height: 'auto' }}
              />
              <CardContent>
                <Typography variant="h3" gutterBottom textAlign="center">
                  {title}
                </Typography>
                <Typography variant="h5" gutterBottom textAlign="center">
                  Precio Pagado: ${price}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Información del cliente y del pedido */}
          <Box sx={{ flex: 1, padding: 3, border: '1px solid #ccc', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>Detalles de la compra</Typography>
            <Typography variant="body1"><strong>Nombre:</strong> {name} {lastname}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {email}</Typography>
            <Typography variant="body1" gutterBottom><strong>Dirección de Entrega:</strong> {address1} {address2 ? `, ${address2}` : ''}, {city}, {state}, {zipCode}</Typography>
          </Box>
        </Box>
      </Container>
    </LayoutCheckout>
  );
};

export default ConfirmacionCompra;
