import { messageRepository } from '../repositories/messageRepository.js';
import { conversationService } from '../services/conversationService.js';

export const webhookController = {
    status: async (req, res) => {
        const { results } = req.body;
        if (!results || !Array.isArray(results)) return res.status(200).send();

        try {
            for (const item of results) {
                const { messageId, status, deliveredAt, seenAt } = item;
                const existingMessage = await messageRepository.findByInfobipId(messageId);
                
                if (existingMessage) {
                    const statusName = status?.groupName || status?.name;
                    
                    if (statusName === 'DELIVERED') {
                        await messageRepository.updateStatus(messageId, 'delivered', deliveredAt || new Date());
                    } else if (statusName === 'READ' || statusName === 'SEEN') {
                        await messageRepository.updateStatus(messageId, 'seen', seenAt || new Date(), 'seen');
                    }
                    
                    // Trigger conversation update timestamp
                    await conversationService.updateLastMessage(existingMessage.conversation_id, existingMessage.content?.templateName ? `Template: ${existingMessage.content.templateName}` : existingMessage.content?.text);
                }
            }
            res.status(200).send();
        } catch (err) {
            console.error('Webhook Status Error:', err);
            res.status(500).json({ error: err.message });
        }
    },

    inbound: async (req, res) => {
        const { results } = req.body;
        if (!results || !Array.isArray(results)) return res.status(200).send();

        try {
            for (const item of results) {
                const from = item.from;
                const to = item.to;
                const messageId = item.messageId;
                const content = item.message?.text || (item.message?.type === 'IMAGE' ? '[Imagem]' : '[Mídia]');
                const receivedAt = item.receivedAt || new Date();

                const conversation = await conversationService.getOrCreateConversation(from);
                
                const existing = await messageRepository.findByInfobipId(messageId);
                if (!existing) {
                    await messageRepository.create({
                        conversation_id: conversation.id,
                        message_id_infobip: messageId,
                        from_number: from,
                        to_number: to,
                        direction: 'inbound',
                        content: { text: content },
                        status: 'received',
                        sent_at: receivedAt
                    });

                    await conversationService.updateLastMessage(conversation.id, content);
                }
            }
            res.status(200).send();
        } catch (err) {
            console.error('Webhook Inbound Error:', err);
            res.status(500).json({ error: err.message });
        }
    }
};
