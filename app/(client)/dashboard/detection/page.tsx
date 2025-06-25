import ClasificacionRealtime from "./components/ClasificacionRealtime";

export default function ClasificacionPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Clasificador en Tiempo Real</h1>
      <ClasificacionRealtime />
    </div>
  );
}