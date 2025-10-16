/**
 * Sistema de Email com Nodemailer
 */
import nodemailer from 'nodemailer';

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Enviar email
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Venlo" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}

/**
 * Templates de Email
 */

export function welcomeEmail(name: string) {
  return {
    subject: 'Bem-vindo ao Venlo! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bem-vindo ao Venlo!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${name}</strong>,</p>
              <p>Estamos muito felizes em ter você conosco! 🚀</p>
              <p>O Venlo é a plataforma completa para gerenciar suas vendas externas e ambulantes.</p>
              <h3>Próximos Passos:</h3>
              <ul>
                <li>✅ Configure seu estoque</li>
                <li>✅ Adicione seus vendedores</li>
                <li>✅ Faça sua primeira venda</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">Acessar Dashboard</a>
              <p>Se precisar de ajuda, estamos aqui para você!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Venlo. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function newSaleEmail(sellerName: string, total: number, products: number) {
  return {
    subject: '🎉 Nova Venda Realizada!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 32px; font-weight: bold; color: #4CAF50; }
            .stat-label { color: #666; font-size: 14px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Nova Venda!</h1>
            </div>
            <div class="content">
              <p>Ótimas notícias! <strong>${sellerName}</strong> acabou de realizar uma venda.</p>
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">R$ ${total.toFixed(2)}</div>
                  <div class="stat-label">Valor Total</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${products}</div>
                  <div class="stat-label">Produtos</div>
                </div>
              </div>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">Ver Detalhes</a>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function subscriptionEmail(planName: string, amount: number, status: 'success' | 'failed') {
  const isSuccess = status === 'success';
  
  return {
    subject: isSuccess ? '✅ Pagamento Confirmado' : '❌ Falha no Pagamento',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${isSuccess ? '#4CAF50' : '#f44336'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: ${isSuccess ? '#4CAF50' : '#f44336'}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isSuccess ? '✅ Pagamento Confirmado' : '❌ Falha no Pagamento'}</h1>
            </div>
            <div class="content">
              ${isSuccess ? `
                <p>Seu pagamento de <strong>R$ ${amount.toFixed(2)}</strong> para o plano <strong>${planName}</strong> foi processado com sucesso!</p>
                <p>Sua assinatura está ativa e você pode continuar usando todos os recursos.</p>
              ` : `
                <p>Não conseguimos processar seu pagamento de <strong>R$ ${amount.toFixed(2)}</strong> para o plano <strong>${planName}</strong>.</p>
                <p>Por favor, atualize suas informações de pagamento para continuar usando o serviço.</p>
              `}
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/configuracoes" class="button">
                ${isSuccess ? 'Ver Assinatura' : 'Atualizar Pagamento'}
              </a>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function lowStockEmail(productName: string, currentStock: number) {
  return {
    subject: '⚠️ Estoque Baixo',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert { background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Estoque</h1>
            </div>
            <div class="content">
              <div class="alert">
                <strong>Atenção!</strong> O produto <strong>${productName}</strong> está com estoque baixo.
              </div>
              <p>Estoque atual: <strong>${currentStock} unidades</strong></p>
              <p>Recomendamos reabastecer o quanto antes para evitar rupturas.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/estoque" class="button">Gerenciar Estoque</a>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}
