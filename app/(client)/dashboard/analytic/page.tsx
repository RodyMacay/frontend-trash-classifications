"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, Square, Clock, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import axios from "axios";

// Interfaces
interface Clasificacion {
  id: number;
  tipo_material: string;
  confianza: number;
  created_at: string;
}

interface Operacion {
  id: number;
  fecha_inicio: string;
  completada: boolean;
  descripcion: string;
  clasificaciones: Clasificacion[];
}

interface Estadisticas {
  total_clasificaciones: number;
  por_tipo: Record<string, number>;
}

interface OperacionCompletada {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  total_clasificaciones: number;
  por_tipo: Record<string, number>;
}

export default function Dashboard() {
  const [operacionActiva, setOperacionActiva] = useState<Operacion | null>(null);
  const [operacionesCompletadas, setOperacionesCompletadas] = useState<OperacionCompletada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);

  // Consulta cada 5 segundos la operación activa
  useEffect(() => {
    fetchOperacionActiva();
    const interval = setInterval(fetchOperacionActiva, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchOperacionesCompletadas();
  }, []);

  const fetchOperacionActiva = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/analytics/operacion-activa/");
      setOperacionActiva(res.data);
    } catch (err) {
      setOperacionActiva(null);
    }
  };

  const fetchOperacionesCompletadas = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/analytics/operaciones-completadas/");
      setOperacionesCompletadas(res.data);
    } catch (err) {
      setError("Error al cargar operaciones completadas.");
    }
  };

  const iniciarClasificador = async () => {
    setLoading(true);
    setError("");
    setEstadisticas(null);
    try {
      const res = await axios.post("http://localhost:8000/api/detection/activar-script/");
      alert(res.data.mensaje);
      fetchOperacionActiva();
    } catch (err) {
      setError("Error al iniciar el clasificador.");
    } finally {
      setLoading(false);
    }
  };

  const detenerClasificador = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:8000/api/detection/detener-script/");
      setEstadisticas({
        total_clasificaciones: res.data.total_clasificaciones,
        por_tipo: res.data.por_tipo,
      });
      setMostrarPopup(true);
      fetchOperacionActiva();
      fetchOperacionesCompletadas();
    } catch (err) {
      setError("Error al detener el clasificador.");
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    const colores: Record<string, string> = {
      metal: "bg-blue-100 text-blue-800",
      plastico: "bg-green-100 text-green-800",
      papel: "bg-yellow-100 text-yellow-800",
      vidrio: "bg-purple-100 text-purple-800",
      organico: "bg-orange-100 text-orange-800"
    };
    return colores[tipo.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center justify-center gap-3">
            <BarChart3 className="h-10 w-10 text-blue-600" />
            Dashboard Clasificador
          </h1>
          <p className="text-slate-600">Sistema de clasificación de materiales en tiempo real</p>
        </div>

        {/* Control Panel */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Panel de Control
            </CardTitle>
            <CardDescription>
              Inicia o detén el proceso de clasificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={iniciarClasificador} 
                disabled={loading}
                size="lg"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4" />
                {loading ? "Iniciando..." : "Iniciar Clasificador"}
              </Button>
              <Button
                onClick={detenerClasificador}
                disabled={loading || !operacionActiva}
                variant="destructive"
                size="lg"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                {loading ? "Deteniendo..." : "Detener Clasificador"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Operación Activa */}
        {operacionActiva ? (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  Operación Activa
                </div>
              </CardTitle>
              <CardDescription>
                Iniciada el {new Date(operacionActiva.fecha_inicio).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Descripción</p>
                  <p className="text-slate-900">{operacionActiva.descripcion || "Sin descripción"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Total de clasificaciones</p>
                  <p className="text-2xl font-bold text-blue-600">{operacionActiva.clasificaciones.length}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Clasificaciones recientes</p>
                <ScrollArea className="h-64 w-full rounded-md border bg-white/50 p-4">
                  <div className="space-y-3">
                    {operacionActiva.clasificaciones.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                          <Badge className={getTipoColor(c.tipo_material)}>
                            {c.tipo_material}
                          </Badge>
                          <span className="text-sm font-medium">
                            {(c.confianza * 100).toFixed(2)}% confianza
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(c.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0 bg-slate-50/50">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-slate-600">No hay operación activa actualmente</p>
              <p className="text-sm text-slate-500 mt-1">Inicia el clasificador para comenzar</p>
            </CardContent>
          </Card>
        )}

        {/* Operaciones Completadas */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Operaciones Completadas
            </CardTitle>
            <CardDescription>
              Historial de sesiones de clasificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {operacionesCompletadas.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600">No hay operaciones completadas</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {operacionesCompletadas.map((op) => (
                  <Card key={op.id} className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Período</p>
                          <p className="text-sm text-slate-600">
                            {new Date(op.fecha_inicio).toLocaleDateString()} - {new Date(op.fecha_fin).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(op.fecha_inicio).toLocaleTimeString()} a {new Date(op.fecha_fin).toLocaleTimeString()}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-slate-700">Descripción</p>
                          <p className="text-sm text-slate-600">{op.descripcion || "Sin descripción"}</p>
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {op.total_clasificaciones} clasificaciones
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Distribución por tipo</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(op.por_tipo).map(([tipo, cantidad]) => (
                              <Badge key={tipo} className={`text-xs ${getTipoColor(tipo)}`}>
                                {tipo}: {cantidad}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de estadísticas */}
        <Dialog open={mostrarPopup} onOpenChange={setMostrarPopup}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Estadísticas Finales
              </DialogTitle>
              <DialogDescription>
                Resumen de la sesión de clasificación completada
              </DialogDescription>
            </DialogHeader>
            
            {estadisticas && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">Total de clasificaciones</p>
                  <p className="text-3xl font-bold text-blue-900">{estadisticas.total_clasificaciones}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">Distribución por tipo de material</p>
                  <div className="space-y-2">
                    {Object.entries(estadisticas.por_tipo).map(([tipo, cantidad]) => (
                      <div key={tipo} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <Badge className={getTipoColor(tipo)}>
                          {tipo}
                        </Badge>
                        <span className="font-semibold text-slate-900">{cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setMostrarPopup(false)} className="w-full">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}