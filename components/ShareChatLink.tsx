/**
 * Componente para Compartilhar Link do Chat
 * Permite criar um link único para compartilhar conversas
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Share2, Copy, Check } from "lucide-react";

interface ShareChatLinkProps {
  chatId?: string;
  title?: string;
}

export function ShareChatLink({ chatId, title = "Compartilhar Chat" }: ShareChatLinkProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const { toast } = useToast();

  const generateShareLink = () => {
    // Gerar um ID único para o link compartilhado
    const shareId = chatId || `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const link = `${window.location.origin}/chat/shared/${shareId}`;
    setShareLink(link);
    return link;
  };

  const handleShare = () => {
    const link = generateShareLink();
    
    // Se o navegador suporta Web Share API
    if (navigator.share) {
      navigator.share({
        title: 'Venlo Chat',
        text: 'Confira esta conversa no Venlo',
        url: link,
      }).catch((error) => {
        console.log('Erro ao compartilhar:', error);
      });
    }
  };

  const handleCopy = async () => {
    const link = shareLink || generateShareLink();
    
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Crie uma cópia deste chat para outras pessoas conversarem
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-link">Link de Compartilhamento</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareLink || "Clique em 'Gerar Link' para criar"}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopy}
                disabled={!shareLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateShareLink}
              variant="outline"
              className="flex-1"
            >
              Gerar Link
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 vendr-btn-primary"
              disabled={!shareLink}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Como funciona:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>O link permite que outras pessoas vejam esta conversa</li>
              <li>Elas poderão fazer perguntas ao chatbot</li>
              <li>Cada pessoa terá sua própria sessão de chat</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
