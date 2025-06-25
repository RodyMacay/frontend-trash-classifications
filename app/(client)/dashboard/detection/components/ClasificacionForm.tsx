'use client';

import { useState } from 'react';
import axios from 'axios';

type Props = {
  onResultado: (data: any) => void;
};

export default function ClasificacionForm({ onResultado }: Props) {
  const [imagen, setImagen] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagen) return;

    const formData = new FormData();
    formData.append('imagen', imagen);

    try {
      setCargando(true);
      const res = await axios.post(
        'http://localhost:8000/api/detection/ejecutar/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      onResultado(res.data);
    } catch (err) {
      console.error(err);
      alert('Error al procesar la imagen.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImagen(e.target.files?.[0] || null)}
        className="block w-full"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={cargando}
      >
        {cargando ? 'Procesando...' : 'Clasificar'}
      </button>
    </form>
  );
}
