'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function ClasificacionRealtime() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('No se pudo acceder a la cámara');
      }
    };

    setupCamera();

    // Iniciar detección periódica
    const interval = setInterval(() => {
      capturarYDetectar();
    }, 3000); // cada 3 segundos

    return () => clearInterval(interval); // detener cuando el componente se desmonta
  }, []);

  const capturarYDetectar = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Captura la parte central del video
    const { videoWidth, videoHeight } = video;
    const sx = videoWidth / 2 - 112;
    const sy = videoHeight / 2 - 112;
    ctx.drawImage(video, sx, sy, 224, 224, 0, 0, 224, 224);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('imagen', blob, 'captura.jpg');

      try {
        console.log("Enviando imagen para clasificación...");
        const res = await axios.post(
          'http://localhost:8000/api/detection/ejecutar/',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setResultado(res.data);
      } catch (err) {
        console.error(err);
        setError('Error al clasificar imagen');
      }
    }, 'image/jpeg');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && <p className="text-red-500">{error}</p>}

      {/* Vista previa con borde */}
      <div className="relative w-[320px] h-[240px] border-4 border-blue-600 rounded overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover" />

        {/* Cuadro delimitador de clasificación */}
        <div className="absolute border-2 border-green-400 w-[120px] h-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {resultado && (
        <div className="mt-4 p-4 bg-gray-100 border rounded w-full text-center">
          <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
          <p><strong>Tipo:</strong> {resultado.tipo_material}</p>
          <p><strong>Confianza:</strong> {resultado.confianza.toFixed(2)}%</p>
          <p><strong>Categorías detectadas:</strong> {resultado.detected_categories.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
