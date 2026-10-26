const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

let spotifyToken = '';

async function getSpotifyToken() {
  const authHeader = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    spotifyToken = response.data.access_token;
    console.log('Token do Spotify obtido com sucesso!');
  } catch (error) {
    console.error('Erro ao obter token do Spotify:', error.response?.data || error.message);
  }
}

getSpotifyToken().catch(console.error);

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Termo de busca é obrigatório.' });

  try {
    if (!spotifyToken) await getSpotifyToken();

    // URL LIMPA: Sem o parâmetro limit para evitar o bug maluco da API do Spotify
    const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album`;
    console.log('Testando URL Limpa:', spotifyUrl); 

    const response = await fetch(spotifyUrl, {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        await getSpotifyToken();
        return res.status(401).json({ error: 'Token expirado, tente novamente.' });
      }
      return res.status(response.status).json(data);
    }

    // WORKAROUND: Cortamos os primeiros 12 álbuns manualmente aqui no servidor
    if (data.albums && data.albums.items) {
      data.albums.items = data.albums.items.slice(0, 12);
    }

    res.json(data);
  } catch (error) {
    console.error('Erro interno no backend:', error);
    res.status(500).json({ error: 'Erro na requisição ao Spotify.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));