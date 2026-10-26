import { useState } from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/search?q=${query}`);
      setAlbums(res.data.albums.items);
    } catch (err) {
      console.error('Erro na busca:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#fff', minHeight: '100vh' }}>
      <h1>SIDE B 🎧</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Busque por álbum ou single..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '0.6rem', width: '300px', borderRadius: '4px', border: 'none', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer' }}>
          Buscar
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {albums.map((album) => (
          <div key={album.id} style={{ backgroundColor: '#1e1e1e', padding: '0.8rem', borderRadius: '8px' }}>
            <img src={album.images[0]?.url} alt={album.name} style={{ width: '100%', borderRadius: '4px' }} />
            <h3 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {album.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>
              {album.artists.map((a) => a.name).join(', ')} • {album.album_type.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;