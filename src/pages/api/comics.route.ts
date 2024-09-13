import type { NextApiRequest, NextApiResponse } from 'next';
import md5 from 'md5';

const MARVEL_API_URL = process.env.NEXT_PUBLIC_MARVEL_API_URL;
const MARVEL_API_PUBLIC_KEY = process.env.NEXT_PUBLIC_MARVEL_API_PUBLIC_KEY;
const MARVEL_API_PRIVATE_KEY = process.env.MARVEL_API_PRIVATE_KEY;

const generateAuthenticationString = () => {
  const ts = new Date().getTime();
  const hash = md5(`${ts}${MARVEL_API_PRIVATE_KEY}${MARVEL_API_PUBLIC_KEY}`);

  console.log('Timestamp (ts):', ts);
  console.log('Private Key:', MARVEL_API_PRIVATE_KEY);
  console.log('Public Key:', MARVEL_API_PUBLIC_KEY);

  return `ts=${ts}&apikey=${MARVEL_API_PUBLIC_KEY}&hash=${hash}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authString = generateAuthenticationString();
    const limit = req.query.limit || 12;  
    const offset = req.query.offset || 0; 

  
    const response = await fetch(`${MARVEL_API_URL}/comics?${authString}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      res.status(response.status).json({ error: 'Error al obtener los cómics desde la API de Marvel.' });
      return;
    }
    
    const data = await response.json();
    res.status(200).json(data); 
  } catch (error) {
    console.error('Error en la API de Next.js:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
