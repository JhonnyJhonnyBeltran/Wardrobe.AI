'use client';

import { useState, useCallback } from 'react';
import { 
    processClothingImage, 
    type ProcessingResult, 
    type ProcessingStage,
    STAGE_MESSAGES 
} from '@/lib/imageProcessing';
import { Upload, Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface ImageProcessorProps {
    onImageProcessed?: (result: ProcessingResult) => void;
}

export default function ImageProcessor({ onImageProcessed }: ImageProcessorProps) {
    const [originalImage, setOriginalImage] = useState<string>('');
    const [processedImage, setProcessedImage] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
    const [progressPercent, setProgressPercent] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [error, setError] = useState('');
    const [processingTime, setProcessingTime] = useState<number>(0);

    // Progress callback for real-time updates
    const handleProgress = useCallback((stage: ProcessingStage, progress: number, message?: string) => {
        setProcessingStage(stage);
        setProgressPercent(progress);
        setProgressMessage(message || STAGE_MESSAGES[stage] || '');
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            setError('Por favor selecciona una imagen válida');
            return;
        }

        // Validar tamaño (máx 15MB - increased for high-res photos)
        if (file.size > 15 * 1024 * 1024) {
            setError('La imagen es demasiado grande (máx 15MB)');
            return;
        }

        // Reset estados
        setError('');
        setProcessedImage('');
        setProcessingStage('idle');
        setProgressPercent(0);
        setOriginalImage(URL.createObjectURL(file));

        // Procesar automáticamente
        await processImage(file);
    };

    const processImage = async (file: File) => {
        setProcessing(true);
        setProcessingStage('compressing');

        try {            
            const result = await processClothingImage(
                file, 
                {
                    normalize: true,
                    canvasWidth: 1200,
                    canvasHeight: 1500,
                    quality: 'quality', // Best quality model for clean backgrounds
                },
                handleProgress
            );

            setProcessingTime(result.processingTime || 0);

            if (result.success && result.imageUrl) {
                setProcessedImage(result.imageUrl);
                setProcessingStage('complete');
                onImageProcessed?.(result);
            } else {
                setError(result.error || 'Error al procesar la imagen');
                setProcessingStage('error');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setProcessingStage('error');
        } finally {
            setProcessing(false);
        }
    };

    const downloadImage = () => {
        if (!processedImage) return;

        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `prenda-procesada-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Procesador de Imágenes de Ropa</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Sube una foto y la IA la procesará automáticamente 
                    <br />
                    <span className="text-sm">✨ Todo se hace en tu dispositivo, sin enviar datos a servidores</span>
                </p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={processing}
                    className="hidden"
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center gap-3 ${
                        processing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {processing ? (
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    ) : (
                        <Upload className="w-12 h-12 text-gray-400" />
                    )}
                    <div>
                        <p className="text-lg font-medium">
                            {processing ? (
                                <span className="inline-flex flex-col items-center gap-1">
                                    <span className="animate-pulse">{progressMessage}</span>
                                    {progressPercent > 0 && (
                                        <span className="text-sm text-blue-400">{progressPercent}%</span>
                                    )}
                                </span>
                            ) : (
                                'Haz click para subir una imagen'
                            )}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            JPG, PNG o WebP • Máximo 15MB
                        </p>
                        {processingTime > 0 && !processing && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                ⚡ Procesado en {(processingTime / 1000).toFixed(1)}s
                            </p>
                        )}
                    </div>
                </label>
                
                {/* Progress Bar */}
                {processing && (
                    <div className="mt-4 w-full max-w-xs mx-auto">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                style={{ width: `${Math.max(progressPercent, 5)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Results */}
            {(originalImage || processedImage) && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Original */}
                    {originalImage && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Original</h3>
                            </div>
                            <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <img
                                    src={originalImage}
                                    alt="Original"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    )}

                    {/* Processed */}
                    {processedImage && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    Procesada
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </h3>
                                <button
                                    onClick={downloadImage}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar
                                </button>
                            </div>
                            <div className="relative aspect-[4/5] bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img
                                    src={processedImage}
                                    alt="Procesada"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-center">
                                <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                                    <div className="font-medium text-green-700 dark:text-green-300">
                                        ✓ Fondo removido
                                    </div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                                    <div className="font-medium text-blue-700 dark:text-blue-300">
                                        ✓ Enderezada
                                    </div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                                    <div className="font-medium text-purple-700 dark:text-purple-300">
                                        ✓ Centrada
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Consejos para mejores resultados:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Fotografía la prenda sobre una superficie plana</li>
                    <li>• Usa buena iluminación natural si es posible</li>
                    <li>• Evita sombras pronunciadas</li>
                    <li>• Asegúrate de que la prenda esté lo más extendida posible</li>
                </ul>
            </div>
        </div>
    );
}
