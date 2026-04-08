const INFOBIP_BASE_URL = 'https://8k6xv1.api-us.infobip.com';

export const infobipService = {
    sendWhatsAppTemplate: async (apiKey, customerPhone, templateName, templateLanguage, templateVariables, sender) => {
        const payload = {
            messages: [{
                from: sender,
                to: customerPhone,
                content: {
                    templateName,
                    templateData: {
                        body: {
                            placeholders: templateVariables
                        }
                    },
                    language: templateLanguage
                }
            }]
        };

        const response = await fetch(`${INFOBIP_BASE_URL}/whatsapp/1/message/template`, {
            method: 'POST',
            headers: {
                'Authorization': `App ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.description || 'Erro ao enviar template Infobip');
        }

        return result.messages?.[0]?.messageId;
    }
};
