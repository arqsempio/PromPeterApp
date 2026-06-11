import { useEffect, useState } from 'react'
import { ref, onValue } from "firebase/database";
import { database } from "./firebaseConfig";
import { termsAndConditions, privacyPolicy } from "./legal";
import './App.css'

function App() {
  const [pairingCode, setPairingCode] = useState('');
  const [history, setHistory] = useState([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setPairingCode(code);

    const sessionRef = ref(database, 'sessions/' + code + '/payload');
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.timestamp) {
        setHistory(prev => {
          if (prev.length > 0 && prev[0].timestamp === data.timestamp) {
            return prev; // Ignorar duplicados
          }
          return [data, ...prev].slice(0, 10); // Mantener max 10
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const copyTextToClipboard = async (text, index) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Error al copiar', err);
    }
  };

  const copyImageToClipboard = async (base64String, index) => {
    try {
      const response = await fetch(base64String);
      const blob = await response.blob();
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Error copiando imagen:', err);
      alert('Error copiando imagen. Usa Click derecho -> Copiar Imagen');
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const renderMarkdown = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="legal-title">{line.replace('# ', '')}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="legal-subtitle">{line.replace('## ', '')}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="legal-section">{line.replace('### ', '')}</h3>;
      } else if (line.startsWith('- **')) {
        const parts = line.substring(2).split('**');
        return (
          <li key={index} className="legal-list-item">
            <strong>{parts[1]}</strong>{parts[2]}
          </li>
        );
      } else if (line.startsWith('- ')) {
        return <li key={index} className="legal-list-item">{line.replace('- ', '')}</li>;
      } else if (line.trim() === '') {
        return <div key={index} className="legal-spacer" />;
      } else {
        let content = line;
        if (content.includes('**')) {
          const parts = content.split('**');
          return (
            <p key={index} className="legal-paragraph">
              {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part)}
            </p>
          );
        }
        return <p key={index} className="legal-paragraph">{content}</p>;
      }
    });
  };

  return (
    <div className="app-layout">
      {/* Columna Izquierda: Presentación y Descarga */}
      <section className="left-panel">
        <div className="brand-header">
          <img src="/icon.png" alt="PromPeter Logo" className="app-logo-main" />
          <div>
            <h1 className="app-title">PromPeter</h1>
            <p className="app-tagline">Tu copiloto inteligente de celular a PC</p>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Sincronización Instantánea</h3>
            <p>Empareja tu dispositivo móvil ingresando un código temporal. Sin logins complejos ni cuentas obligatorias.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h3>Comparte desde Cualquier App</h3>
            <p>Envía imágenes, prompts y enlaces de texto usando la hoja de compartir nativa de tu dispositivo móvil.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Cámara y Galería Directa</h3>
            <p>Captura fotos en tiempo real o elije archivos de tu almacenamiento y míralos aparecer en tu PC en segundos.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>100% Privado y Efímero</h3>
            <p>Los datos se transmiten usando Firebase en tiempo real de forma segura y se descartan tras cerrar la sesión.</p>
          </div>
        </div>

        <div className="download-section">
          <h2>Descarga la App Móvil</h2>
          <p>Instala la última versión oficial directamente en tu dispositivo Android sin pasar por tiendas intermediarias.</p>
          <a href="/PromPeter.apk" download="PromPeter_v1.1.0.apk" className="btn-download">
            <span className="download-icon">📥</span>
            <div className="download-text-container">
              <span className="btn-main-txt">Descargar APK Oficial</span>
              <span className="btn-sub-txt">Versión 1.1.0 (Android) • ~98.8 MB</span>
            </div>
          </a>
        </div>
      </section>

      {/* Columna Derecha: Sincronización Web */}
      <section className="right-panel">
        <div className="panel-container">
          {history.length === 0 ? (
            <div className="pairing-card card">
              <span className="status-badge">Listo para emparejar</span>
              <h2>Enlaza tu PC</h2>
              <p className="pairing-instruction">
                Abre <strong>PromPeter</strong> en tu celular, toca el ícono del monitor arriba a la derecha e ingresa este código:
              </p>
              <div className="code-display">{pairingCode}</div>
              <p className="waiting-text">Esperando acción desde tu teléfono...</p>
              <div className="loader-ring"></div>
            </div>
          ) : (
            <div className="history-container">
              <div className="history-header">
                <div>
                  <h2>Historial de Postales</h2>
                  <p className="history-subtitle">Guardado en la memoria de esta sesión</p>
                </div>
                <button className="btn-clear" onClick={clearHistory}>
                  🗑️ Borrar Todo
                </button>
              </div>

              <div className="history-list">
                {history.map((item, index) => (
                  <div key={item.timestamp || index} className="payload-card card">
                    <div className="card-header">
                      <span className="card-number">#{history.length - index}</span>
                      <span className="card-time">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    
                    {item.image && (
                      <div className="image-container">
                        <img src={item.image} alt="Postal enviada por IA" />
                        <button 
                          className={`btn-action btn-copy-image ${copiedIndex === index ? 'copied' : ''}`} 
                          onClick={() => copyImageToClipboard(item.image, index)}
                        >
                          {copiedIndex === index ? '✅ ¡Copiado!' : '📋 Copiar Postal'}
                        </button>
                      </div>
                    )}

                    {item.text && !item.image && (
                      <div className="text-container">
                        <p className="prompt-text">{item.text}</p>
                        <button 
                          className={`btn-action btn-copy-text ${copiedIndex === index ? 'copied' : ''}`} 
                          onClick={() => copyTextToClipboard(item.text, index)}
                        >
                          {copiedIndex === index ? '✅ ¡Copiado!' : '💬 Copiar Texto'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer General */}
      <footer className="footer-bar">
        <p className="footer-copyright">© 2026 PromPeter. Todos los derechos reservados.</p>
        <div className="footer-links">
          <button className="link-btn" onClick={() => setShowTermsModal(true)}>Términos y Condiciones</button>
          <span className="link-separator">•</span>
          <button className="link-btn" onClick={() => setShowPrivacyModal(true)}>Política de Privacidad</button>
        </div>
      </footer>

      {/* Modal de Términos y Condiciones */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-top" onClick={() => setShowTermsModal(false)}>×</button>
            <div className="modal-body scrollable">
              {renderMarkdown(termsAndConditions)}
            </div>
            <div className="modal-footer">
              <button className="btn-modal-close" onClick={() => setShowTermsModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Política de Privacidad */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-top" onClick={() => setShowPrivacyModal(false)}>×</button>
            <div className="modal-body scrollable">
              {renderMarkdown(privacyPolicy)}
            </div>
            <div className="modal-footer">
              <button className="btn-modal-close" onClick={() => setShowPrivacyModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
