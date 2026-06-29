export const sendAccountingNotification = async (
    action_type: string,
    action_description: string,
    whatsapp_message: string,
    data: any
) => {
    try {
        const payload = {
            action_type,
            action_description,
            whatsapp_message,
            data
        };

        await fetch('https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/contabilidade_notificacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Erro ao enviar notificação para contabilidade:', error);
    }
};

export const exportFinanceDataToN8n = async (data: any) => {
    try {
        await fetch('https://plug-sales-dispatch-app-n8n-2.hx8235.easypanel.host/webhook/export_financeiro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return true;
    } catch (error) {
        console.error('Erro ao exportar dados para n8n:', error);
        return false;
    }
};
