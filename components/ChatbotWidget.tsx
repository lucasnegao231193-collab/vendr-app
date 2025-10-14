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
  "Como adicionar vendedores?",
  "Como gerenciar estoque?",
  "Como aceitar devoluções?",
];

// Base de conhecimento do chatbot
const knowledgeBase: Record<string, string> = {
  transferencia: "Para fazer uma transferência:\n1. Vá em 'Transferências' no menu\n2. Clique em 'Nova Transferência'\n3. Selecione o vendedor\n4. Escolha os produtos e quantidades\n5. Clique em 'Enviar Transferência'\n\nO vendedor receberá uma notificação e poderá aceitar ou recusar.",
  vendedor: "Para adicionar vendedores:\n1. Acesse 'Vendedores' no menu\n2. Clique em '+ Novo Vendedor'\n3. Preencha nome, email e telefone\n4. Defina se está ativo\n5. Salve\n\nO vendedor receberá um convite por email para criar sua conta.",
  estoque: "Para gerenciar estoque:\n1. Vá em 'Estoque' no menu\n2. Clique em '+ Adicionar Produto'\n3. Preencha nome, marca, preço e quantidade\n4. Salve\n\nVocê pode editar ou remover produtos a qualquer momento.",
  devolucao: "Para aceitar devoluções:\n1. Acesse 'Devoluções' no menu\n2. Veja as devoluções pendentes\n3. Clique em 'Aceitar' ou 'Recusar'\n4. Se aceitar, o produto volta automaticamente ao seu estoque\n\nO vendedor será notificado da decisão.",
  meta: "Os vendedores podem configurar suas próprias metas:\n1. Vendedor acessa 'Minhas Metas'\n2. Clica em 'Configurar Meta'\n3. Define a data e valor desejado\n4. Salva\n\nAs metas ajudam a acompanhar o desempenho diário e mensal.",
  venda: "Para registrar vendas:\n1. Vendedor acessa 'Nova Venda'\n2. Seleciona os produtos\n3. Define quantidades\n4. Escolhe forma de pagamento (PIX, Dinheiro, Cartão)\n5. Confirma a venda\n\nA venda é registrada automaticamente no sistema.",
  default: "Desculpe, não entendi sua pergunta. Você pode:\n\n• Escolher uma das perguntas frequentes acima\n• Reformular sua pergunta\n• Falar com nosso suporte humano pelo WhatsApp\n\nEstou aqui para ajudar! 😊"
};

function getAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('transferência') || message.includes('transferencia') || message.includes('transferir')) {
    return knowledgeBase.transferencia;
  }
  if (message.includes('vendedor') || message.includes('vendedores') || message.includes('adicionar')) {
    return knowledgeBase.vendedor;
  }
  if (message.includes('estoque') || message.includes('produto') || message.includes('produtos')) {
    return knowledgeBase.estoque;
  }
  if (message.includes('devolução') || message.includes('devolucao') || message.includes('devolver')) {
    return knowledgeBase.devolucao;
  }
  if (message.includes('meta') || message.includes('metas') || message.includes('objetivo')) {
    return knowledgeBase.meta;
  }
  if (message.includes('venda') || message.includes('vendas') || message.includes('vender')) {
    return knowledgeBase.venda;
  }
  
  return knowledgeBase.default;
}

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

    // Resposta inteligente do bot com IA
    setTimeout(() => {
      const aiResponse = getAIResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <motion.div
        className="fixed bottom-6 right-6 lg:bottom-6 sm:bottom-24 z-50"
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
