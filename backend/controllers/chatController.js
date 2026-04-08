import { infobipService } from '../services/infobipService.js';
import { conversationService } from '../services/conversationService.js';
import { messageRepository } from '../repositories/messageRepository.js';
import { conversationRepository } from '../repositories/conversationRepository.js';

export const chatController = {
    sendTemplate: async (req, res) => {
        const { apiKey, customerPhone, templateName, templateLanguage, templateVariables, sender } = req.body;
        
        if (!apiKey || !customerPhone || !templateName || !sender) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
        }

        try {
            const messageId = await infobipService.sendWhatsAppTemplate(apiKey, customerPhone, templateName, templateLanguage, templateVariables, sender);
            const conversation = await conversationService.getOrCreateConversation(customerPhone);
            
            await messageRepository.create({
                conversation_id: conversation.id,
                message_id_infobip: messageId,
                from_number: sender,
                to_number: customerPhone,
                direction: 'outbound',
                content: { templateName, templateVariables },
                status: 'sent',
                sent_at: new Date()
            });

            await conversationService.updateLastMessage(conversation.id, `Template: ${templateName}`);

            res.json({ success: true, messageId });
        } catch (err) {
            console.error('Error sending WhatsApp template:', err);
            res.status(500).json({ error: err.message });
        }
    },

    getMessagesByPhone: async (req, res) => {
        const { phone } = req.params;
        try {
            const conversation = await conversationRepository.findByPhone(phone);
            if (!conversation) return res.json([]);
            
            const messages = await messageRepository.getHistoryByConversationId(conversation.id);
            res.json(messages);
        } catch (err) {
            console.error('Error fetching chat messages:', err);
            res.status(500).json({ error: err.message });
        }
    },

    listChats: async (req, res) => {
        try {
            const chats = await conversationRepository.getAll();
            res.json(chats);
        } catch (err) {
            console.error('Error listing chats:', err);
            res.status(500).json({ error: err.message });
        }
    }
};
