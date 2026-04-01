import React from 'react';
import ClientExternalForm from './ClientExternalForm';

const ClientSubmissionAdd: React.FC = () => {
    return (
        <div className="relative min-h-screen">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#acf800]/5 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full -z-10" />

            <div className="p-4 lg:p-12 max-w-[1600px] mx-auto">
                <header className="mb-16 space-y-2">
                    <h1 className="text-5xl font-black tracking-tighter text-white leading-none">
                        NOVA <span className="text-[#acf800] italic">SUBMISSÃO</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] w-12 bg-[#acf800]/30" />
                        <p className="text-[11px] font-black tracking-[4px] uppercase opacity-40">Gestão Interna de Disparos</p>
                    </div>
                </header>
                
                <div className="max-w-5xl">
                    <ClientExternalForm />
                </div>
            </div>
        </div>
    );
};

export default ClientSubmissionAdd;
