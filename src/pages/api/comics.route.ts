// pages/api/comics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import md5 from 'md5';

// Obtén las variables de entorno
const MARVEL_API_URL = process.env.NEXT_PUBLIC_MARVEL_API_URL;
const MARVEL_API_PUBLIC_KEY = process.env.NEXT_PUBLIC_MARVEL_API_PUBLIC_KEY;
const MARVEL_API_PRIVATE_KEY = process.env.MARVEL_API_PRIVATE_KEY;

const generateAuthenticationString = () => {
  const ts = new Date().getTime();
  const hash = md5(`${ts}${MARVEL_API_PRIVATE_KEY}${MARVEL_API_PUBLIC_KEY}`);

  // Verifica los valores que se están utilizando
  console.log('Timestamp (ts):', ts);
  console.log('Private Key:', MARVEL_API_PRIVATE_KEY);
  console.log('Public Key:', MARVEL_API_PUBLIC_KEY);

  return `ts=${ts}&apikey=${MARVEL_API_PUBLIC_KEY}&hash=${hash}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authString = generateAuthenticationString();
    const limit = req.query.limit || 12;  // Usa parámetros de consulta
    const offset = req.query.offset || 0; // Agrega el parámetro de desplazamiento

    // Incluye el parámetro offset en la solicitud
    const response = await fetch(`${MARVEL_API_URL}/comics?${authString}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      res.status(response.status).json({ error: 'Error al obtener los cómics desde la API de Marvel.' });
      return;
    }
    
    const data = await response.json();
    res.status(200).json(data);  // Responder con los datos de la API
  } catch (error) {
    console.error('Error en la API de Next.js:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
