import { GetServerSideProps, NextPage } from 'next';
import LayoutGeneral from 'dh-marvel/components/layouts/layout-general';
import { Box, Typography, CircularProgress, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import { getCharacter } from '../../services/marvel/marvel.service';
import Link from 'next/link';
import { generateAuthenticationString } from "dh-marvel/services/marvel/marvel-auth.service";

interface CharacterDetailProps {
  character: Character | null;
  comics: Comic[]; //comics asociados
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
}

const getRandomColor = () => {
  const colors = ['#FFCDD2', '#E1BEE7', '#BBDEFB', '#C8E6C9', '#FFECB3', '#FFAB91', '#B2EBF2', '#D1C4E9', '#F0F4C3'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const CharacterDetail: NextPage<CharacterDetailProps> = ({ character, comics, error }) => {
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
          {/* imagen del personaje */}
          <Grid item xs={12} md={5}>
            <Card elevation={3}>
              <img
                src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                alt={character.name}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </Card>
          </Grid>

          {/* detalles del personaje */}
          <Grid item xs={12} md={6}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {character.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {character.description || 'Descripción no disponible'}
              </Typography>
            </CardContent>
          </Grid>
        </Grid>

        {/* comics relacionados */}
        <Box marginTop={8} width="100%">
          <Typography variant="h5" gutterBottom>
            Otros cómics de {character.name}:
          </Typography>
          <Grid container spacing={3} padding={3} justifyContent="center" sx={{ minHeight: '70vh' }}>
            {comics.length > 0 ? (
              comics.map((comic) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={comic.id}>
                  <Card
                    sx={{
                      width: 250,
                      height: 350,
                      position: 'relative',
                      margin: 'auto',
                      overflow: 'hidden',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                      borderRadius: 2,
                      backgroundColor: getRandomColor(),
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
                      },
                      '&:hover .hover-overlay': { opacity: 1 },
                    }}
                  >
                    <Box sx={{ width: '100%', height: '80%', position: 'relative', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        image={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
                        alt={comic.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <Box
                        className="hover-overlay"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'flex-end',
                          borderRadius: 'inherit',
                          paddingBottom: 1,
                        }}
                      >
                        <Typography variant="h6" color="white" align="center" sx={{ padding: 1 }}>
                          {comic.title}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ textAlign: 'center', padding: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {/* detalle del cómic */}
                        <Link href={`/comics/${comic.id}`} passHref>
                          <Button variant="outlined" color="secondary" size="small">
                            Ver Detalle
                          </Button>
                        </Link>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="body2">No hay otros cómics disponibles para este personaje.</Typography>
            )}
          </Grid>
        </Box>
      </Box>
    </LayoutGeneral>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  try {
    const character = await getCharacter(Number(id));
    if (!character) {
      return { props: { character: null, comics: [], error: 'Personaje no encontrado.' } };
    }

   
    const authString = generateAuthenticationString();
    const response = await fetch(`${process.env.NEXT_PUBLIC_MARVEL_API_URL}/characters/${id}/comics?${authString}&limit=6`);
    const data = await response.json();
    const comics = data.data.results.map((comic: any) => ({
      id: comic.id,
      title: comic.title,
      description: comic.description,
      thumbnail: comic.thumbnail,
      price: comic.prices[0]?.price || 0, 
    }));

    return { props: { character, comics } };
  } catch (error) {
    return { props: { character: null, comics: [], error: 'Error al cargar el personaje.' } };
  }
};

export default CharacterDetail;
