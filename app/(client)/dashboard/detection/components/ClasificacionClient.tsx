'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ClasificacionResultado from './ClasificacionResultado';

export default function ClasificacionClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        alert('Error al acceder a la cámara.');
      }
    };
    getCamera();
  }, []);

  const capturarYEnviar = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dibujar frame en canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('imagen', blob, 'captura.jpg');

      try {
        setLoading(true);
        const res = await axios.post(
          'http://localhost:8000/api/detection/ejecutar/',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        setResultado(res.data);
      } catch (error) {
        console.error('Error al clasificar', error);
        alert('Error al clasificar imagen');
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border-4 border-blue-500 rounded-md overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          className="w-full max-w-md aspect-video"
        />
      </div>

      <button
        onClick={capturarYEnviar}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? 'Procesando...' : 'Capturar y Clasificar'}
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {resultado && <ClasificacionResultado resultado={resultado} />}
    </div>
  );
}
