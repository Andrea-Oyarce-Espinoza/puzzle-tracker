import { useState, useEffect } from 'react'; 
import './App.css'; 

function App() {
  // 1. ESTADOS (Las variables que React vigila en tiempo real) 
  const [tiempo, setTiempo] = useState(0); // Tiempo en segundos 
  const [corriendo, setCorriendo] = useState(false); // ¿El reloj está activo?
  const [piezas, setPiezas] = useState(1000); // Cantidad de piezas seleccionadas

  //El historial se carga desde localStorage si existe, si no, empieza vacío 
  const [historial, setHistorial] = useState(() => {
    const guardados = localStorage.getItem('puzzle_records');
    return guardados ? JSON.parse(guardados) : [];
  });
  
  // 2. EFECTO: Controla el segundero del reloj
  useEffect(() => {
    let intervalo = null; 

    if (corriendo) {
      //Si "corriendo" es true, suma 1 segundo cada 1000 milisegundos
      intervalo = setInterval(() => {
        setTiempo((tiempoAnterior) => tiempoAnterior + 1);
      }, 1000);
    } else{
      // Si se pausa, limpia el intervalo
      clearInterval(intervalo);
    }

    // Limpieza obligatoria en React para no ralentizar la computadora
    return () => clearInterval(intervalo);
  }, [corriendo]);

  // 3. EFECTO: Guarda en LocalStorage automáticamente cada vez que cambia el historial
  useEffect(() => {
    localStorage.setItem('puzzle_records', JSON.stringify(historial));
  }, [historial]); 

  // 4. FUNCIONES AUXILIARES
  // Transforma los segundos totales en formato legible (00:00:00)
  const formatearTiempo = (segundosTotales) => {
    const horas = Math.floor(segundosTotales / 3600); 
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  //Guarda el récord actual en la lista
  const guardarRecord = () => {
    if (tiempo === 0) return; // No guardar si está en cero

    const nuevoRegistro = {
      id: Date.now(), 
      piezas: piezas, 
      tiempoTotal: formatearTiempo(tiempo), 
      fecha: new Date().toLocaleDateString('es-CL'), // Fecha formato Chile 
    };

    // Agrega el nuevo récord al principio de la lista
    setHistorial([nuevoRegistro, ...historial]);

    // Reinicia el reloj para el próximo rompecabezas
    setTiempo(0); 
    setCorriendo(false);   
  };

  const reiniciarReloj = () => {
    setTiempo(0); 
    setCorriendo(false);
  };

  const borrarHistorial = () => {
    if (window.confirm("¿Seguro/a que quieres borrar todos tus récords?")) {
      setHistorial([]);
    }
  };

  // 5. DISEÑO INTERFAZ (JSX)
  return (
    <div className="tracker-container">
      <header className="tracker-header">
        <h1>Puzzle Tracker & Timer</h1>
        <p>Mide tu velocidad y rompe tus propios récords</p>
      </header>

      <main className="tracker-grid">
        {/*Panel de Control Izquierdo*/}
        <section className="control-panel">
          <div className="input-group">
            <label>Número de piezas:</label>
            <select 
             value={piezas} 
             onChange={(e) => setPiezas(Number(e.target.value))}
             disabled={corriendo} // Bloquea el selector si el reloj está corriendo
            > 
              <option value="500">500 piezas</option>
              <option value="1000">1000 piezas</option>
              <option value="1500">1500 piezas</option>
              <option value="2000">2000 piezas</option>
            </select>
          </div>

          <div className="timer-display">
            <h2>{formatearTiempo(tiempo)}</h2>
          </div>

          <div className="button-group">
            <button 
            className={`btn ${corriendo ? 'btn-pause' : 'btn-start'}`}
            onClick={() => setCorriendo(!corriendo)}
            >
              {corriendo ? 'Pausar' : 'Iniciar'}
            </button>

            <button className="btn btn-save" onClick={guardarRecord} disabled={tiempo === 0}>
              Guardar Récord 
            </button>

            <button className="btn btn-reset" onClick={reiniciarReloj}>
              Reiniciar
            </button>
          </div>
        </section>

        {/*Historial Derecho*/}
        <section className="history-panel">
          <div className="history-header">
            <h2>Mis rompecabezas completados</h2>
            {historial.length > 0 && (
              <button className="btn-clear" onClick={borrarHistorial}>Borrar todo</button>

            )}         
          </div>

          {historial.length === 0 ? (
            <p className="empty-message">Aún no tienes registros. ¡A armar!</p>
          ) : (
            <div className="records-list">
              {historial.map((record) => (
                <div key={record.id} className="record-item">
                  <div className="record-info">
                    <span className="record-badge">{record.piezas} piezas</span>
                    <small>{record.fecha}</small>
                  </div>
                  <div className="record-time">
                    ⏱️ {record.tiempoTotal}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App; 