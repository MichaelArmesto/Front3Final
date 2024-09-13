// pages/personajes/[id].tsx

import { GetServerSideProps, NextPage } from 'next';
import LayoutGeneral from 'dh-marvel/components/layouts/layout-general';
import { Box, Typography, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import { getCharacter } from '../../services/marvel/marvel.service'; // Asegúrate de tener un servicio que obtenga los detalles del personaje.

interface CharacterDetailProps {
  character: Character | null;
  error?: string;
}

interface Character {
  id: number;
  name: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  };
  comics: { name: string; resourceURI: string }[]; // Comics asociados opcionales
}

const CharacterDetail: NextPage<CharacterDetailProps> = ({ character, error }) => {
  if (!character) {
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
        justifyContent="center"
        alignItems="center"
        padding={4}
      >
        <Grid container spacing={4} justifyContent="center" alignItems="center" maxWidth="lg">
          {/* Columna de la imagen del personaje */}
          <Grid item xs={12} md={5}>
            <Card elevation={3}>
              <img
                src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                alt={character.name}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </Card>
          </Grid>

          {/* Columna de los detalles del personaje */}
          <Grid item xs={12} md={6}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {character.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {character.description || 'Descripción no disponible'}
              </Typography>
              
              {/* Comics asociados al personaje */}
              <Typography variant="h5" gutterBottom marginTop={4}>
                Comics asociados:
              </Typography>
              {Array.isArray(character.comics) && character.comics.length > 0 ? (
                <ul>
                  {character.comics.map((comic) => (
                    <li key={comic.resourceURI}>
                      <a href={`/comics/${comic.resourceURI.split('/').pop()}`}>{comic.name}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2">No hay comics asociados a este personaje.</Typography>
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
    const character = await getCharacter(Number(id)); // Llama a la función que obtiene el personaje

    if (!character) {
      return { props: { character: null, error: 'Personaje no encontrado.' } };
    }

    return { props: { character } };
  } catch (error) {
    return { props: { character: null, error: 'Error al cargar el personaje.' } };
  }
};

export default CharacterDetail;
