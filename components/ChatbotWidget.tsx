/**
 * Chatbot Widget de Suporte - Venlo
 * Design: bottom-right fixed, expansível
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const quickMessages = [
  "Como fazer uma transferência?",
  "Dúvidas sobre vendedores",
  "Problemas técnicos",
  "Falar com suporte",
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Como posso ajudar você hoje?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [hasNotification, setHasNotification] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simular resposta do bot
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Obrigado pela sua mensagem! Nossa equipe vai responder em breve.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {!isOpen && (
          <Button
            size="lg"
            onClick={() => {
              setIsOpen(true);
              setHasNotification(false);
            }}
            className="relative h-14 w-14 rounded-full bg-venlo-orange-500 hover:bg-venlo-orange-600 shadow-lg"
          >
            <MessageCircle className="h-6 w-6 text-white" />
            {hasNotification && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-error rounded-full border-2 border-white animate-pulse" />
            )}
          </Button>
        )}
      </motion.div>

      {/* Janela do Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] bg-white dark:bg-trust-blue-800 rounded-venlo-lg shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-trust-blue-900 dark:bg-trust-blue-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-venlo-orange-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Suporte Venlo</h3>
                  <p className="text-xs text-trust-blue-200">
                    Online - Resposta rápida
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-trust-blue-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-trust-blue-900">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-venlo p-3",
                      message.sender === "user"
                        ? "bg-venlo-orange-500 text-white"
                        : "bg-white dark:bg-trust-blue-700 text-trust-blue-900 dark:text-white"
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.sender === "user"
                          ? "text-venlo-orange-100"
                          : "text-trust-blue-500 dark:text-trust-blue-300"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Mensagens Rápidas */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-trust-blue-500 dark:text-trust-blue-300 font-medium">
                    Perguntas frequentes:
                  </p>
                  {quickMessages.map((msg, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(msg)}
                      className="w-full text-left p-2 text-sm bg-white dark:bg-trust-blue-700 hover:bg-venlo-orange-50 dark:hover:bg-trust-blue-600 rounded-venlo transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-trust-blue-800 border-t dark:border-trust-blue-700">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(inputValue);
                }}
                className="flex gap-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 bg-venlo-orange-500 hover:bg-venlo-orange-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
