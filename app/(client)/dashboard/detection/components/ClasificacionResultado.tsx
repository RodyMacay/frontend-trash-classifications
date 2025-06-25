type Props = {
  resultado: {
    tipo_material: string;
    confianza: number;
    detected_categories: string[];
  };
};

export default function ClasificacionResultado({ resultado }: Props) {
  return (
    <div className="mt-6 p-4 border rounded bg-gray-100">
      <h2 className="text-xl font-semibold">Resultado</h2>
      <p><strong>Tipo de material:</strong> {resultado.tipo_material}</p>
      <p><strong>Confianza:</strong> {resultado.confianza.toFixed(2)}%</p>
      <p><strong>Categorías detectadas:</strong> {resultado.detected_categories.join(', ')}</p>
    </div>
  );
}
