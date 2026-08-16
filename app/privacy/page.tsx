import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-color)]">
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Política de Privacidad</h1>
                <div className="space-y-4 text-[var(--foreground-secondary)] text-sm leading-relaxed">
                    <p>En Klozet, valoramos y respetamos tu privacidad.</p>
                    <p>
                        Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información
                        cuando utilizas nuestra plataforma.
                    </p>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mt-6">1. Información que recopilamos</h2>
                    <p>Recopilamos la información que nos proporcionas directamente, como tu nombre, correo electrónico y el contenido que subes (fotos de tu armario, outfits).</p>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mt-6">2. Uso de la información</h2>
                    <p>Utilizamos tu información para proporcionar, mantener y mejorar nuestros servicios, así como para personalizar tu experiencia (por ejemplo, mediante recomendaciones de IA de estilo).</p>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mt-6">3. Seguridad</h2>
                    <p>Implementamos medidas de seguridad para proteger tu información contra acceso no autorizado. Las sesiones y los datos sensibles están encriptados utilizando tecnologías modernas (Supabase).</p>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mt-6">4. Servicios de Terceros (Autenticación)</h2>
                    <p>Si inicias sesión utilizando servicios de terceros (como Google o Apple), recibiremos la información pública de tu perfil (nombre y correo) necesaria para crear y mantener tu cuenta en Klozet.</p>
                </div>
            </div>
        </div>
    );
}
