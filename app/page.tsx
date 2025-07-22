"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

// --- Definimos la estructura de los datos ---
// Esta interfaz describe todos los campos posibles que pueden llegar desde n8n
// para cualquier tipo de resultado. Los campos opcionales (?) permiten flexibilidad.
interface Metadata {
  type: string;
  coursename?: string;
  sectionname?: string;
  // Campos para módulos/recursos
  modulename?: string;
  moduleprofile?: string;
  moduleurl?: string;
  // Campos para preguntas
  questionprofile?: string;
  question_preview?: string;
  dificultad_estimada?: string;
  habilidad_cognitiva_bloom?: string;
}

interface SearchResult {
  id: string;
  score: number;
  values: unknown[];
  metadata: Metadata;
}

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedType, setSelectedType] = useState("question")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const N8N_WEBHOOK_URL = 'https://pixarron.app.n8n.cloud/webhook/d87b3f36-9d36-4e1a-bb86-4fabdfd2086e';

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true)
    setHasSearched(true)
    setSearchResults([])
    
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          textoBusqueda: searchQuery,
          tipoDeBusqueda: selectedType 
        }),
      });

      if (!response.ok) throw new Error(`Error en la respuesta de n8n: ${response.statusText}`);

      const data = await response.json();
      const matches = data.matches || (Array.isArray(data) && data[0]?.matches) || [];
      setSearchResults(matches);

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
    setSelectedType("question")
    setSearchResults([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return "text-green-600"
    if (percentage >= 30) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage > 50) return "bg-green-500"
    if (percentage >= 30) return "bg-yellow-500"
    return "bg-red-500"
  }

  const contentTypes = [
    { label: "Pregunta", value: "question" },
    { label: "Cuestionario", value: "quiz" },
    { label: "Recurso", value: "url" },
  ]

  const getTypeLabel = (value: string) => {
    const type = contentTypes.find((t) => t.value === value)
    return type ? type.label : value
  }

  const getTypeLabelLower = (value: string) => {
    return getTypeLabel(value).toLowerCase()
  }

  // --- Componente de Tarjeta actualizado para ser flexible ---
  // Revisa esta sección para asegurarte de que coincide con tu código.
  const ResultCard = ({ result }: { result: SearchResult }) => {
    const { metadata } = result;
    const percentage = Math.round(result.score * 100);
    
    const title = metadata.modulename || `Pregunta de ${metadata.coursename}`;
    const description = metadata.moduleprofile || metadata.questionprofile || "No hay descripción disponible.";
    const url = metadata.moduleurl || metadata.question_preview || "#";

    return (
        <div
          key={result.id}
          className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3 className="text-xl font-semibold mb-2">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                  {title}
                </a>
              </h3>
            </div>
            <div className="ml-4 min-w-[120px]">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressBarColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${getProgressColor(percentage)}`}>
                  {percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* ESTA ES LA SECCIÓN CLAVE QUE MUESTRA LAS ETIQUETAS */}
          <div className="flex flex-wrap gap-4 mb-3">
            {metadata.coursename && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Curso: {metadata.coursename}</span>}
            {metadata.sectionname && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Sección: {metadata.sectionname}</span>}
            {/* Se muestran solo si existen en los datos */}
            {metadata.dificultad_estimada && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{metadata.dificultad_estimada}</span>}
            {metadata.habilidad_cognitiva_bloom && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{metadata.habilidad_cognitiva_bloom}</span>}
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">
              {getTypeLabel(metadata.type)}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Buscador de Contenido Educativo</h1>
        </div>

        {/* Selector de tipo de contenido */}
        {!hasSearched && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de contenido:</label>
            <div className="flex gap-6 justify-center">
              {contentTypes.map((type) => (
                <label key={type.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="contentType"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    disabled={isSearching}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-8">
          <Input
            type="text"
            placeholder={`Buscar ${getTypeLabelLower(selectedType)}...`}
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
              ? `Cargando ${getTypeLabelLower(selectedType)}...`
              : hasSearched
                ? `${getTypeLabel(selectedType)} encontradas (${searchResults.length} resultados):`
                : "Esperando resultados..."}
          </div>

          {/* Tarjetas de resultados */}
          {!isSearching && hasSearched && (
            <div className="space-y-4">
              {searchResults.map((result: SearchResult) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
