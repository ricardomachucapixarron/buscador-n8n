"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function Component() {
  // --- ESTADOS (Se mantienen igual, pero uno nuevo para los resultados) ---
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResults, setSearchResults] = useState([]) // <-- 1. Estado para guardar los resultados REALES

  // ❗ URL de Producción actualizada
  const N8N_WEBHOOK_URL = 'https://pixarron.app.n8n.cloud/webhook/d87b3f36-9d36-4e1a-bb86-4fabdfd2086e';

  // --- FUNCIÓN DE BÚSQUEDA (Aquí está la magia) ---
  const handleSearch = async () => { // <-- 2. Convertimos la función a async
    if (!searchQuery.trim() || isSearching) return

    setIsSearching(true)
    setHasSearched(true)
    setSearchResults([]) // Limpiamos resultados anteriores

    // <-- 3. Reemplazamos la simulación con la llamada real a n8n
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textoBusqueda: searchQuery }),
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta de n8n: ${response.statusText}`);
      }

      // Asumimos que n8n devuelve un objeto JSON
      const data = await response.json();
      // CORRECCIÓN: Accedemos directamente a la clave "matches" del objeto
      setSearchResults(data.matches || []); // Guardamos los resultados en el estado

    } catch (error) {
      console.error("Error al conectar con n8n:", error);
      setSearchResults([]); // En caso de error, aseguramos que los resultados estén vacíos
    } finally {
      setIsSearching(false) // Esto se ejecuta siempre, al final
    }
  }

  // --- OTRAS FUNCIONES (Se mantienen igual) ---
  const handleReset = () => {
    setSearchQuery("")
    setIsSearching(false)
    setHasSearched(false)
    setSearchResults([]) // <-- También limpiamos los resultados aquí
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 60) return "text-green-600"
    if (percentage >= 45) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 60) return "bg-green-500"
    if (percentage >= 45) return "bg-yellow-500"
    return "bg-red-500"
  }

  // <-- 4. El array de datos de ejemplo se ha eliminado. Ya no es necesario.

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Buscador de Contenido Educativo</h1>
        </div>

        <div className="flex gap-3 mb-8">
          <Input
            type="text"
            placeholder="Ingresa tu búsqueda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 h-12 text-lg"
            aria-label="Campo de búsqueda"
          />
          <Button
            onClick={handleSearch}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSearching}
          >
            <Search className="w-5 h-5 mr-2" />
            {isSearching ? "Buscando..." : "Buscar"}
          </Button>
          {hasSearched && (
            <Button onClick={handleReset} variant="outline" className="h-12 px-4 bg-transparent" disabled={isSearching}>
              Reiniciar
            </Button>
          )}
        </div>

        <div className="border-t pt-6">
          <div className="text-center text-gray-500 text-lg mb-6">
            {isSearching
              ? "Cargando resultados..."
              : hasSearched
                ? `Resultados de búsqueda (${searchResults.length} encontrados):`
                : "Esperando resultados..."}
          </div>

          {/* <-- 5. El renderizado ahora usa los datos reales de n8n */}
          {!isSearching && hasSearched && (
            <div className="space-y-4">
              {searchResults.map((result: any) => ( // <-- Usamos el estado `searchResults`
                <div
                  key={result.id} // <-- Usamos el ID que viene de n8n
                  className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {/* Usamos las claves del objeto `metadata` de n8n */}
                        <a href={result.metadata.moduleurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          {result.metadata.modulename}
                        </a>
                      </h3>
                    </div>
                    <div className="ml-4 min-w-[120px]">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          {/* Calculamos el porcentaje a partir de `score` */}
                          <div
                            className={`h-2 rounded-full ${getProgressBarColor(Math.round(result.score * 100))}`}
                            style={{ width: `${Math.round(result.score * 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${getProgressColor(Math.round(result.score * 100))}`}>
                          {Math.round(result.score * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-3">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Curso: {result.metadata.coursename}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Sección: {result.metadata.sectionname}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{result.metadata.moduleprofile}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
