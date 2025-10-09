/**
 * Chat Interno Empresa <-> Vendedor
 * Realtime com Supabase
 */
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Mensagem {
  id: string;
  texto: string;
  sender_id: string;
  created_at: string;
  sender_perfil?: {
    nome: string;
  };
}

interface ChatPanelProps {
  receiverId?: string; // ID do destinatário (opcional, se for owner vendo todos)
  receiverNome?: string;
}

export function ChatPanel({ receiverId, receiverNome }: ChatPanelProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMensagens();
    setupRealtime();
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const loadMensagens = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      let query = supabase
        .from("mensagens")
        .select(`
          id,
          texto,
          sender_id,
          created_at,
          sender_perfil:perfis!mensagens_sender_id_fkey (
            nome
          )
        `)
        .order("created_at", { ascending: true });

      // Se tiver receiverId, filtrar conversa específica
      if (receiverId) {
        query = query.or(`sender_id.eq.${user.id},sender_id.eq.${receiverId}`);
        query = query.or(`receiver_id.eq.${user.id},receiver_id.eq.${receiverId}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMensagens((data as any) || []);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
        },
        (payload) => {
          setMensagens((prev) => [...prev, payload.new as Mensagem]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    try {
      const { data: perfil } = await supabase
        .from("perfis")
        .select("empresa_id")
        .eq("user_id", userId)
        .single();

      if (!perfil) return;

      await supabase.from("mensagens").insert({
        texto: novaMensagem,
        sender_id: userId,
        receiver_id: receiverId || null,
        empresa_id: perfil.empresa_id,
      });

      setNovaMensagem("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando chat...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {receiverNome ? `Chat com ${receiverNome}` : "Chat da Equipe"}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {mensagens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma mensagem ainda</p>
              </div>
            ) : (
              mensagens.map((msg) => {
                const isOwn = msg.sender_id === userId;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={isOwn ? "bg-[#0057FF] text-white" : "bg-gray-200"}>
                        {msg.sender_perfil?.nome?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                      <div
                        className={`rounded-lg px-3 py-2 max-w-[300px] ${
                          isOwn
                            ? "bg-[#0057FF] text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.texto}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={handleEnviar}
          className="border-t p-4 flex gap-2"
        >
          <Input
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
