/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Search,
  Pin,
  Smile,
  Check,
  CheckCheck,
  FileText,
  Briefcase,
  Award,
  Shield,
  SearchCode,
  AlertCircle,
  Clock,
  UserCheck,
  X,
  FileCode,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatConversation, ChatMessage, ChatParticipant, MessageAttachment, AttachmentType } from "./types";
import { AttachmentValidator } from "./services";

interface ChatWindowProps {
  conversation: ChatConversation;
  currentUserId: string;
  messages: ChatMessage[];
  onSendMessage: (body: string, attachments?: MessageAttachment[]) => void;
  onTogglePin: (messageId: string) => void;
  onMarkSeen: () => void;
}

export function ChatWindow({
  conversation,
  currentUserId,
  messages,
  onSendMessage,
  onTogglePin,
  onMarkSeen
}: ChatWindowProps) {
  const [typedText, setTypedText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [simulatedTyping, setSimulatedTyping] = useState(false);

  // File Attachment State
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    onMarkSeen();
  }, [messages, onMarkSeen]);

  // Simulate remote typing indicator randomly when thread mounts
  useEffect(() => {
    const unread = conversation.unreadCount;
    if (unread > 0) {
      setSimulatedTyping(true);
      const timer = setTimeout(() => {
        setSimulatedTyping(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [conversation]);

  const handleSend = () => {
    if (typedText.trim() === "" && pendingAttachments.length === 0) return;
    onSendMessage(typedText, pendingAttachments.length > 0 ? pendingAttachments : undefined);
    setTypedText("");
    setPendingAttachments([]);
    setAttachmentError(null);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Add instant mock attachments
  const attachMockAsset = (type: AttachmentType) => {
    let name = "Master_Resume_Aarav.pdf";
    let size = "120 KB";

    if (type === "portfolio") {
      name = "Interactive_Portfolio_V2.docx";
      size = "180 KB";
    } else if (type === "certificate") {
      name = "AWS_Serverless_Credential.png";
      size = "2.4 MB";
    }

    const validation = AttachmentValidator.validate(name, 2 * 1024 * 1024); // 2MB
    if (!validation.valid) {
      setAttachmentError(validation.error || "Attachment check failed");
      return;
    }

    const newAttach: MessageAttachment = {
      id: `att_${Date.now()}`,
      name,
      type,
      url: "#",
      size
    };

    setPendingAttachments(prev => [...prev, newAttach]);
    setAttachmentError(null);
  };

  const insertEmoji = (emoji: string) => {
    setTypedText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Filters messages based on active query
  const filteredMessages = messages.filter(msg =>
    msg.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedMessages = messages.filter(m => m.isPinned);

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];

  return (
    <div
      className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 rounded-3xl flex flex-col h-[650px] w-full relative overflow-hidden shadow-xl"
      id={`chat-window-${conversation.id}`}
    >
      {/* 1. Header with details & tools */}
      <div className="p-4 border-b border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-950/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={otherParticipant.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt={conversation.name}
              className="w-10 h-10 rounded-2xl object-cover border border-zinc-100 dark:border-zinc-850"
            />
            {otherParticipant.isOnline && (
              <span className="absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
            )}
          </div>

          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <span>{conversation.name}</span>
              {conversation.isGroup && (
                <span className="bg-indigo-500/10 text-indigo-500 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                  Cohort Group
                </span>
              )}
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
              <span>Role: {otherParticipant.role}</span>
              <span>•</span>
              <span className={otherParticipant.isOnline ? "text-emerald-500 font-bold" : "text-zinc-400"}>
                {otherParticipant.isOnline ? "Online" : otherParticipant.lastActive || "Offline"}
              </span>
            </p>
          </div>
        </div>

        {/* Action Panel: Message Search */}
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search text..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-[10px] focus:outline-none w-24 text-zinc-800 dark:text-zinc-150"
              />
              <button onClick={() => { setSearchQuery(""); setShowSearch(false); }} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl transition-colors cursor-pointer"
              title="Search thread"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="bg-amber-500/5 border-b border-amber-500/10 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Pin className="w-4.5 h-4.5 text-amber-500 shrink-0 transform rotate-45" />
            <div className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
              <span className="font-bold text-amber-600 mr-1.5 font-mono">PINNED STATEMENT:</span>
              <span>{pinnedMessages[pinnedMessages.length - 1].body}</span>
            </div>
          </div>
          <button
            onClick={() => onTogglePin(pinnedMessages[pinnedMessages.length - 1].id)}
            className="text-[9px] text-zinc-400 hover:text-rose-500 font-bold uppercase shrink-0 font-mono cursor-pointer"
          >
            Unpin
          </button>
        </div>
      )}

      {/* 3. Messages Stream Box */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px] bg-gradient-to-b from-zinc-50/20 to-zinc-100/10 dark:from-zinc-950/10 dark:to-zinc-900/10">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-zinc-400 text-xs">
            <SearchCode className="w-8 h-8 mx-auto text-zinc-300" />
            <p className="font-bold">No matching messages found in this history.</p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const senderDetails = conversation.participants.find(p => p.id === msg.senderId) || {
              name: "User",
              role: "Student",
              avatarUrl: ""
            };

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                {!isMe && (
                  <img
                    src={senderDetails.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                    alt={senderDetails.name}
                    className="w-8 h-8 rounded-xl object-cover self-end shrink-0 border border-zinc-100 dark:border-zinc-800"
                  />
                )}

                {/* Message block */}
                <div className="space-y-1">
                  {/* Sender title if group */}
                  {conversation.isGroup && !isMe && (
                    <span className="text-[9px] font-bold text-zinc-400 font-mono block">
                      {senderDetails.name} • {senderDetails.role}
                    </span>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-[11px] leading-relaxed shadow-xs relative group ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-150 rounded-bl-none"
                    }`}
                  >
                    {/* Encrypted indicator watermark */}
                    {msg.encrypted && (
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" title="End-to-End Encrypted">
                        <Shield className={`w-3 h-3 ${isMe ? "text-white/40" : "text-zinc-400"}`} />
                      </div>
                    )}

                    <p>{msg.body}</p>

                    {/* Render attachment logs if any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 pt-2 border-t border-zinc-100/10">
                        {msg.attachments.map(att => (
                          <div
                            key={att.id}
                            className={`p-2 rounded-xl flex items-center justify-between gap-3 text-[10px] ${
                              isMe ? "bg-white/10 text-white" : "bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/40"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {att.type === "resume" ? <Briefcase className="w-3.5 h-3.5" /> : att.type === "certificate" ? <Award className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                              <span className="font-bold truncate">{att.name}</span>
                            </div>
                            <span className="text-[8px] font-mono opacity-80 shrink-0">{att.size}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Receipts and timestamps */}
                  <div className={`flex items-center gap-1.5 text-[8px] font-mono text-zinc-400 ${isMe ? "justify-end" : ""}`}>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMe && (
                      <span>
                        {msg.isSeen ? (
                          <span title="Read receipt">
                            <CheckCheck className="w-3 h-3 text-indigo-500 font-bold" />
                          </span>
                        ) : (
                          <span title="Delivered">
                            <Check className="w-3 h-3 text-zinc-300" />
                          </span>
                        )}
                      </span>
                    )}

                    {/* Quick pin action */}
                    <button
                      onClick={() => onTogglePin(msg.id)}
                      className="text-zinc-400 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 cursor-pointer"
                      title="Toggle pin statement"
                    >
                      <Pin className={`w-3 h-3 transform rotate-45 ${msg.isPinned ? "text-amber-500" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Remote typing simulation indicator */}
        {simulatedTyping && (
          <div className="flex gap-2 max-w-[80%] items-center mr-auto">
            <img
              src={otherParticipant.avatarUrl}
              alt={conversation.name}
              className="w-7 h-7 rounded-xl object-cover shrink-0 border border-zinc-100 dark:border-zinc-800"
            />
            <div className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl rounded-bl-none flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Error and attachment banners */}
      {attachmentError && (
        <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20 text-[10px] text-rose-500 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{attachmentError}</span>
          <button onClick={() => setAttachmentError(null)} className="ml-auto text-rose-500 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {pendingAttachments.length > 0 && (
        <div className="px-4 py-2 bg-indigo-500/5 border-t border-indigo-500/10 flex flex-wrap gap-2 shrink-0">
          {pendingAttachments.map(att => (
            <div key={att.id} className="bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-lg flex items-center gap-1.5 text-[9px] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
              <FileText className="w-3 h-3 text-indigo-500" />
              <span className="max-w-[110px] truncate">{att.name}</span>
              <button
                onClick={() => setPendingAttachments(prev => prev.filter(p => p.id !== att.id))}
                className="text-zinc-400 hover:text-rose-500 font-bold"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 5. Input Composer Frame */}
      <div className="p-4 border-t border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-950/40 space-y-3 shrink-0">
        
        {/* Fast assets upload shortcuts */}
        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500">
          <span className="font-bold">Fast Attachments:</span>
          <button
            onClick={() => attachMockAsset("resume")}
            className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-800 cursor-pointer text-zinc-600 dark:text-zinc-300 font-bold flex items-center gap-0.5"
          >
            <Briefcase className="w-2.5 h-2.5" />
            <span>Resume</span>
          </button>
          <button
            onClick={() => attachMockAsset("portfolio")}
            className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-800 cursor-pointer text-zinc-600 dark:text-zinc-300 font-bold flex items-center gap-0.5"
          >
            <BookOpen className="w-2.5 h-2.5" />
            <span>Portfolio</span>
          </button>
          <button
            onClick={() => attachMockAsset("certificate")}
            className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-800 cursor-pointer text-zinc-600 dark:text-zinc-300 font-bold flex items-center gap-0.5"
          >
            <Award className="w-2.5 h-2.5" />
            <span>Certificate</span>
          </button>
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2.5 relative">
          
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-indigo-500 rounded-xl hover:bg-zinc-200 transition-all cursor-pointer border border-zinc-200/40 dark:border-zinc-800/40"
            title="Emoji drawer"
          >
            <Smile className="w-4.5 h-4.5" />
          </button>

          {/* Emoji micro drawers list */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-14 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-2xl shadow-xl flex gap-2.5 z-40 shrink-0"
              >
                {["😊", "🔥", "🚀", "👍", "🎉", "💯", "👏", "💻"].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="text-base hover:scale-125 transition-transform duration-100 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="text"
            placeholder="Secure message input..."
            value={typedText}
            onChange={e => setTypedText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 px-4 py-3 rounded-2xl text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
          />

          <button
            onClick={handleSend}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md cursor-pointer transition-colors shrink-0"
          >
            <Send className="w-4.5 h-4.5" />
          </button>

        </div>
      </div>

    </div>
  );
}
