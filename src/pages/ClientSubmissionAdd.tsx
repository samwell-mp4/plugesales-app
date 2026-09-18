import React from 'react';
import ClientExternalForm from './ClientExternalForm';

const ClientSubmissionAdd: React.FC = () => {
    return (
        <div className="w-full min-h-screen">
            <ClientExternalForm isInternal={true} />
        </div>
    );
};

export default ClientSubmissionAdd;

