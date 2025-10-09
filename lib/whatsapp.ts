/**
 * WhatsApp Integration Utilities
 * Gera links para suporte via WhatsApp
 */

interface BuildWhatsAppLinkParams {
  phone: string;
  message: string;
}

/**
 * Constrói URL do WhatsApp com mensagem pré-preenchida
 */
export function buildWhatsAppLink({ phone, message }: BuildWhatsAppLinkParams): string {
  // Remove caracteres não-numéricos do telefone
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Encode da mensagem
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Abre WhatsApp em nova aba
 */
export function openWhatsApp(phone: string, message: string): void {
  const link = buildWhatsAppLink({ phone, message });
  window.open(link, '_blank', 'noopener,noreferrer');
}

/**
 * Gera mensagem contextual baseada no role e pathname
 */
export function getContextualMessage(
  role: 'owner' | 'seller',
  pathname: string
): string {
  const baseMessages = {
    owner: process.env.NEXT_PUBLIC_SUPPORT_MESSAGE_OWNER || 'Olá! Sou empresa e preciso de ajuda no Vendr.',
    seller: process.env.NEXT_PUBLIC_SUPPORT_MESSAGE_SELLER || 'Olá! Sou vendedor e preciso de ajuda no Vendr.',
  };

  let contextInfo = '';

  // Adicionar contexto baseado na rota atual
  if (pathname.includes('/dashboard')) {
    contextInfo = '\nEstou na página: Dashboard';
  } else if (pathname.includes('/vendedores')) {
    contextInfo = '\nEstou na página: Vendedores';
  } else if (pathname.includes('/estoque')) {
    contextInfo = '\nEstou na página: Estoque';
  } else if (pathname.includes('/financeiro')) {
    contextInfo = '\nEstou na página: Financeiro';
  } else if (pathname.includes('/vendedor/venda')) {
    contextInfo = '\nEstou na página: Nova Venda';
  } else if (pathname.includes('/vendedor')) {
    contextInfo = '\nEstou na página: Dashboard do Vendedor';
  }

  return baseMessages[role] + contextInfo;
}
