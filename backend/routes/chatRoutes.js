import express from 'express';
import { chatController } from '../controllers/chatController.js';
import { webhookController } from '../controllers/webhookController.js';

const router = express.Router();

/**
 * @route POST /api/infobip/send-template
 * @desc Envia um template via Infobip e salva no histórico local
 */
router.post('/infobip/send-template', chatController.sendTemplate);

/**
 * @route GET /api/chat/:phone/messages
 * @desc Recupera o histórico de mensagens de um cliente específico
 */
router.get('/chat/:phone/messages', chatController.getMessagesByPhone);

/**
 * @route GET /api/chats
 * @desc Lista todas as conversas ativas (dashboard)
 */
router.get('/chats', chatController.listChats);

/**
 * @route POST /api/webhook/whatsapp-status
 * @desc Webhook para atualizações de status (delivered, seen)
 */
router.post('/webhook/whatsapp-status', webhookController.status);

/**
 * @route POST /api/webhook/whatsapp-inbound
 * @desc Webhook para mensagens recebidas dos clientes
 */
router.post('/webhook/whatsapp-inbound', webhookController.inbound);

export default router;
