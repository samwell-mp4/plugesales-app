import { conversationRepository } from '../repositories/conversationRepository.js';

export const conversationService = {
    getOrCreateConversation: async (phone) => {
        let conversation = await conversationRepository.findByPhone(phone);
        if (!conversation) {
            conversation = await conversationRepository.create(phone);
        }
        return conversation;
    },
    updateLastMessage: async (id, message) => {
        return await conversationRepository.updateLastMessage(id, message);
    }
};
