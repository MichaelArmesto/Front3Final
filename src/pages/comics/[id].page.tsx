import { GetServerSideProps, NextPage } from 'next';
import LayoutGeneral from 'dh-marvel/components/layouts/layout-general';
import { Box, Button, Typography, CircularProgress, Grid, Card, CardContent, Avatar, IconButton } from '@mui/material';
import { getComic } from '../../services/marvel/marvel.service';
import Link from 'next/link';
import { useRef } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { generateAuthenticationString } from 'dh-marvel/services/marvel/marvel-auth.service';

interface ComicDetailProps {
  comic: Comic | null;
  characters: Character[];
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

interface Character {
  name: string;
  resourceURI: string;
  thumbnail: {
    path: string;
    extension: string;
  } | null;
}

const ComicDetail: NextPage<ComicDetailProps> = ({ comic, characters, error }) => {
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300; 
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
          <Grid item xs={12} md={5}>
            <Card elevation={3}>
              <img
                src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
                alt={comic.title}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
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

              {comic.stock > 0 ? (
                <Link href={`/checkout/${comic.id}`} passHref>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '16px' }}
                  >
                    Comprar
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  disabled
                  style={{ marginTop: '16px' }}
                >
                  Sin stock disponible
                </Button>
              )}

              <Typography variant="h5" gutterBottom marginTop={4}>
                Personajes asociados:
              </Typography>
              {characters.length > 0 ? (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 650, overflow: 'hidden', margin: '0 auto', padding: '5rem' }}>

                  <IconButton
                    onClick={() => scrollCarousel('left')}
                    sx={{
                      position: 'absolute',
                      left: 0, 
                      top: '35%', 
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }, 
                      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', 
                    }}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>

                  {/* carrusel */}
                  <Box
                    ref={carouselRef}
                    sx={{
                      display: 'flex',
                      overflowX: 'scroll',
                      scrollBehavior: 'smooth',
                      gap: 3,
                      padding: 2,
                      '::-webkit-scrollbar': { display: 'none' }, 
                    }}
                  >
                    {characters.map((character) => {
                      const characterId = character.resourceURI.split('/').pop(); // Extraer el ID del personaje
                      return (
                        <Box key={character.resourceURI} sx={{ textAlign: 'center', minWidth: '120px' }}>
                          <Avatar
                            alt={character.name}
                            src={
                              character.thumbnail
                                ? `${character.thumbnail.path}.${character.thumbnail.extension}`
                                : '/default-avatar.png' 
                            }
                            sx={{ width: 56, height: 56, margin: '0 auto' }}
                          />
                          <Typography variant="body2">{character.name}</Typography>
                          <Link href={`/personajes/${characterId}`} passHref>
                            Ver detalles
                          </Link>
                        </Box>
                      );
                    })}
                  </Box>

                  <IconButton
                    onClick={() => scrollCarousel('right')}
                    sx={{
                      position: 'absolute',
                      right: 0, 
                      top: '35%', 
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }, 
                      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Box>
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
      return { props: { comic: null, characters: [], error: 'Cómic no encontrado.' } };
    }

    // personajes asociados del cómic
    const characterPromises = comic.characters?.items.map(async (item: any) => {
      const characterResponse = await fetch(`${item.resourceURI}?${generateAuthenticationString()}`);
      const characterData = await characterResponse.json();
      const character = characterData.data.results[0];
      return {
        name: character.name,
        resourceURI: item.resourceURI,
        thumbnail: character.thumbnail || null,
      };
    }) || [];

    const characters = await Promise.all(characterPromises);

    return { props: { comic, characters } };
  } catch (error) {
    return { props: { comic: null, characters: [], error: 'Error al cargar el cómic.' } };
  }
};

export default ComicDetail;
