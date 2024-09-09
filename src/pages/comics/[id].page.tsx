import { GetServerSideProps, NextPage } from 'next';
import LayoutGeneral from 'dh-marvel/components/layouts/layout-general';
import { Box, Button, Typography, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import { getComic } from '../../services/marvel/marvel.service';

interface ComicDetailProps {
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
  characters: { name: string; resourceURI: string }[];
}

const ComicDetail: NextPage<ComicDetailProps> = ({ comic, error }) => {
  if (!comic) {
    return (
      <LayoutGeneral>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          {error ? (
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          ) : (
            <CircularProgress size={60} thickness={4.5} />
          )}
        </Box>
      </LayoutGeneral>
    );
  }

  return (
    <LayoutGeneral>
      <Box
        display="flex"
        flexDirection="column"
        minHeight="calc(100vh - 64px)"
        justifyContent="center" // Centra el contenido verticalmente
        alignItems="center" // Centra el contenido horizontalmente
        padding={4}
      >
        <Grid container spacing={4} justifyContent="center" alignItems="center" maxWidth="lg">
          {/* Columna de la imagen del cómic */}
          <Grid item xs={12} md={5}> {/* Se ajusta a más espacio en pantallas medianas */}
            <Card elevation={3}>
              <img
                src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
                alt={comic.title}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }} // Aumenta la imagen al 100% de ancho
              />
            </Card>
          </Grid>

          {/* Columna de los detalles del cómic */}
          <Grid item xs={12} md={6}> {/* Se ajusta a más espacio en pantallas medianas */}
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {comic.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {comic.description || 'Descripción no disponible'}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Precio: ${comic.price}
              </Typography>
              {comic.oldPrice && (
                <Typography variant="body2" gutterBottom>
                  Precio anterior: ${comic.oldPrice}
                </Typography>
              )}

              <Button
                variant="contained"
                color={comic.stock > 0 ? 'primary' : 'secondary'}
                disabled={comic.stock === 0}
                style={{ marginTop: '16px' }}
              >
                {comic.stock > 0 ? 'Comprar' : 'Sin stock disponible'}
              </Button>

              {/* Lista de personajes asociados */}
              <Typography variant="h5" gutterBottom marginTop={4}>
                Personajes asociados:
              </Typography>
              {Array.isArray(comic.characters) ? (
                <ul>
                  {comic.characters.map((character) => (
                    <li key={character.resourceURI}>
                      <a href={`/characters/${character.resourceURI.split('/').pop()}`}>{character.name}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2">No hay personajes asociados a este cómic.</Typography>
              )}
            </CardContent>
          </Grid>
        </Grid>
      </Box>
    </LayoutGeneral>
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
    return { props: { comic: null, error: 'Error al cargar el cómic.' } };
  }
};

export default ComicDetail;
