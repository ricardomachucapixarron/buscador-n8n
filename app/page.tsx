"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

// --- CAMBIO 1: Definimos la estructura de los datos ---
// Esto le dice a TypeScript cómo es un resultado de búsqueda.
interface Metadata {
  coursename: string;
  id_subject: number;
  modulename: string;
  moduleprofile: string;
  moduleurl: string;
  sectionname: string;
  sectionurl: string;
  type: string;
}

interface SearchResult {
  id: string;
  score: number;
  values: any[];
  metadata: Metadata;
}

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  // --- CAMBIO 2: Aplicamos el nuevo tipo al estado ---
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const N8N_WEBHOOK_URL = 'https://pixarron.app.n8n.cloud/webhook/d87b3f36-9d36-4e1a-bb86-4fabdfd2086e';

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return

    setIsSearching(true)
    setHasSearched(true)
    setSearchResults([])

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

      const data = await response.json();
      setSearchResults(data.matches || []);

    } catch (error) {
      console.error("Error al conectar con n8n:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false)
    }
  }

  const handleReset = () => {
    setSearchQuery("")
    setIsSearching(false)
    setHasSearched(false)
    setSearchResults([])
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

          {!isSearching && hasSearched && (
            <div className="space-y-4">
              {/* --- CAMBIO 3: Usamos el nuevo tipo en el map --- */}
              {searchResults.map((result: SearchResult) => (
                <div
                  key={result.id}
                  className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        <a href={result.metadata.moduleurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          {result.metadata.modulename}
                        </a>
                      </h3>
                    </div>
                    <div className="ml-4 min-w-[120px]">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
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
