import React from 'react';
import ClientExternalForm from './ClientExternalForm';

const ClientSubmissionAdd: React.FC = () => {
    return (
        <div className="p-4 lg:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-black tracking-tighter text-white">
                    ADICIONAR <span className="text-primary-color">SUBMISSÃO</span>
                </h1>
                <p className="text-white/60 font-medium">Crie uma nova submissão de cliente para disparo manual.</p>
            </header>
            
            <div className="max-w-4xl mx-auto">
                <ClientExternalForm />
            </div>
        </div>
    );
};

export default ClientSubmissionAdd;
