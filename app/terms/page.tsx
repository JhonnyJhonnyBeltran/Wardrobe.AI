import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-color)]">
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Términos de Servicio</h1>
                <div className="space-y-4 text-[var(--foreground-secondary)] text-sm leading-relaxed">
                    <p>Bienvenido a Klozet.</p>
                    <p>
                        Estos Términos de Servicio rigen tu uso de nuestra aplicación y servicios.
                        Al acceder o utilizar Klozet, aceptas estar sujeto a estos términos.
                    </p>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mt-6">1. Uso del Servicio</h2>
                    <p>Debes utilizar nuestra plataforma de manera responsable y legal, respetando los derechos de otros usuarios.</p>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mt-6">2. Contenido del Usuario</h2>
                    <p>Tú conservas la propiedad del contenido que publicas (fotos de outfits, prendas), pero nos concedes una licencia para mostrarlo en la plataforma según la configuración de tu perfil.</p>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mt-6">3. Modificaciones</h2>
                    <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios significativos.</p>
                </div>
            </div>
        </div>
    );
}
