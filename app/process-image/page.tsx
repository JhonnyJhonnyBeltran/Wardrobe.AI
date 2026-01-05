'use client';

import ImageProcessor from '@/components/ImageProcessor';
import { ProcessingResult } from '@/lib/imageProcessing';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProcessImagePage() {
    const handleImageProcessed = (result: ProcessingResult) => {
        console.log('Imagen procesada:', result);
        // Aquí podrías guardar la imagen en Supabase, etc.
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto py-8 px-4">
                {/* Navigation */}
                <Link
                    href="/closet"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al armario
                </Link>

                {/* Main Content */}
                <ImageProcessor onImageProcessed={handleImageProcessed} />

                {/* Technical Info */}
                <div className="max-w-4xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">
                        🚀 Tecnología 100% Local
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                ✅ Ventajas
                            </h4>
                            <ul className="space-y-1">
                                <li>• Completamente gratuito</li>
                                <li>• Privacidad total (sin enviar datos)</li>
                                <li>• Funciona offline una vez cargado</li>
                                <li>• Compatible con móviles</li>
                                <li>• Procesamiento rápido</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                🛠️ Tecnologías
                            </h4>
                            <ul className="space-y-1">
                                <li>• @imgly/background-removal (IA)</li>
                                <li>• WebAssembly (ONNX Runtime)</li>
                                <li>• Canvas API (normalización)</li>
                                <li>• Next.js 15 + React 19</li>
                                <li>• TypeScript</li>
                            </ul>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                        La primera vez que uses la herramienta, se descargará el modelo de IA 
                        (~5-10MB). Luego quedará en caché y funcionará instantáneamente.
                    </p>
                </div>
            </div>
        </div>
    );
}
