const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const User = require('../models/User'); // ajusta según tu modelo

// GET /api/conversations/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Buscando conversaciones para:', userId);

    const conversations = await Conversation.find({
      participants: { $in: [userId] }
    }).sort({ lastMessageTime: -1 });

    console.log('📋 Conversaciones encontradas:', conversations.length);
    console.log(conversations);

    // Obtener datos del otro participante
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const otroId = conv.participants.find((p) => p !== userId);
        const otro = await User.findById(otroId).select('nombre fotoPerfil');
        return {
          id: conv._id,
          participantId: otroId,
          nombre: otro?.nombre ?? 'Usuario',
          iniciales: (otro?.nombre ?? 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
          ultimoMensaje: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
        };
      })
    );

    res.json({ ok: true, conversations: result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;