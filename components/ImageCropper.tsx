'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number; // width / height
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 4 / 5 }: ImageCropperProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            imageRef.current = img;
            centerImage();
            draw();
        };
    }, [imageSrc]);

    useEffect(() => {
        draw();
    }, [scale, rotation, position]);

    const centerImage = () => {
        if (!imageRef.current || !canvasRef.current) return;
        // Initial centering logic could go here
        // For now we start at 0,0 relative to center
        setPosition({ x: 0, y: 0 });
        setScale(1);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;

        if (!canvas || !ctx || !img) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save context
        ctx.save();

        // Move to center
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Rotate
        ctx.rotate((rotation * Math.PI) / 180);

        // Scale
        ctx.scale(scale, scale);

        // Translate to position
        ctx.translate(position.x, position.y);

        // Draw image centered
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        // Restore context
        ctx.restore();

        // Draw overlay (guide)
        // Assuming we want to crop the visible area of the canvas
        // Or we can draw a darkening overlay outside the crop area if the canvas is bigger than the crop area
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        // Adjust position based on rotation to keep movement natural
        // This is a simplified version, ideally we'd use a matrix
        // For 0 rotation:
        const rad = -rotation * Math.PI / 180;
        const newDx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const newDy = dx * Math.sin(rad) + dy * Math.cos(rad);

        setPosition(prev => ({ x: prev.x + newDx / scale, y: prev.y + newDy / scale }));
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (blob) onCropComplete(blob);
        }, 'image/jpeg', 0.95);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-800">
                    <h3 className="text-white font-bold">Editar Imagen</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Editor Area */}
                <div
                    ref={containerRef}
                    className="relative w-full aspect-[4/5] bg-black overflow-hidden cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={750} // 4:5 Aspect Ratio
                        className="w-full h-full object-contain pointer-events-none bg-white"
                    />

                    {/* Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        <div className="w-full h-full border border-white/50 grid grid-cols-3 grid-rows-3">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="border border-white/20" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-gray-900 space-y-4">
                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.05"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-32 accent-white"
                        />
                        <button
                            onClick={() => setScale(s => Math.min(3, s + 0.1))}
                            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <div className="w-px h-8 bg-gray-700 mx-2" />
                        <button
                            onClick={() => setRotation(r => r + 90)}
                            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700"
                        >
                            <RotateCw className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" onClick={onCancel} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="flex-1 bg-white text-black hover:bg-gray-200">
                            <Check className="w-4 h-4 mr-2" />
                            Guardar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
