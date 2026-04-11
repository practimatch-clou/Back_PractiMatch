const express = require("express");
const router = express.Router();
const pusher = require("../lib/pusher");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// POST /api/messages
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Guardar mensaje
    const message = await Message.create({ senderId, receiverId, content });

    // ✅ Después — busca primero, crea si no existe
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        lastMessage: content,
        lastMessageTime: new Date(),
      });
    } else {
      conversation.lastMessage = content;
      conversation.lastMessageTime = new Date();
      await conversation.save();
    }

    // después de guardar el mensaje, antes del pusher.trigger
    await Conversation.findByIdAndUpdate(conversation._id, {
      $inc: { [`unreadCount.${receiverId}`]: 1 },
      lastMessage: content,
      lastMessageTime: new Date(),
    });

    // Disparar evento al receptor
    await pusher.trigger(`chat-${receiverId}`, "new-message", {
      _id: message._id,
      senderId,
      receiverId,
      content,
      createdAt: message.createdAt,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("❌ Error completo:", err); // ← esto nos dirá exactamente qué falla
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:senderId/:receiverId — historial
router.get("/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:conversationId/read", async (req, res) => {
  const { userId } = req.body;
  await Conversation.findByIdAndUpdate(req.params.conversationId, {
    $set: { [`unreadCount.${userId}`]: 0 },
  });
  res.json({ ok: true });
});

module.exports = router;
