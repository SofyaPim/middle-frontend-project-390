import { useEffect, useState } from 'react';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Ошибка запроса к моку:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Робот Хекслета и наш тест будут искать этот h1 по data-testid */}
      <h1 data-testid="page-title">Фронтенд Flight Booking ✈️</h1>
      {loading ? <p>Загрузка...</p> : <p>Окружение готово к работе!</p>}
    </div>
  );
}

export default App;
