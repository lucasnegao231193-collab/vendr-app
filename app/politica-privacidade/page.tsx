export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Política de Privacidade - Venlo
        </h1>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-sm text-gray-600 mb-6">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
            <p className="text-gray-700 mb-4">
              A Venlo ("nós", "nosso" ou "nossa") está comprometida em proteger sua privacidade. 
              Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos 
              suas informações quando você usa nosso aplicativo de gestão de vendas externas.
            </p>
            <p className="text-gray-700">
              Ao usar o Venlo, você concorda com a coleta e uso de informações de acordo com esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informações que Coletamos</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Informações Fornecidas por Você</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Dados de Cadastro:</strong> Nome, email, senha (criptografada)</li>
              <li><strong>Dados da Empresa:</strong> Nome do negócio, tipo de conta</li>
              <li><strong>Dados de Produtos:</strong> Informações sobre produtos cadastrados no estoque</li>
              <li><strong>Dados de Vendas:</strong> Registros de transações, valores, formas de pagamento</li>
              <li><strong>Dados de Clientes:</strong> Informações de clientes cadastrados (se aplicável)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Informações Coletadas Automaticamente</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Dados de Uso:</strong> Como você interage com o aplicativo</li>
              <li><strong>Dados do Dispositivo:</strong> Tipo de dispositivo, sistema operacional, versão do app</li>
              <li><strong>Dados de Localização:</strong> Apenas se você autorizar (para funcionalidades específicas)</li>
              <li><strong>Cookies e Tecnologias Similares:</strong> Para melhorar sua experiência</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Como Usamos Suas Informações</h2>
            <p className="text-gray-700 mb-3">Utilizamos as informações coletadas para:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Fornecer, operar e manter nosso aplicativo</li>
              <li>Processar suas transações e gerenciar seu estoque</li>
              <li>Melhorar, personalizar e expandir nosso aplicativo</li>
              <li>Entender e analisar como você usa nosso aplicativo</li>
              <li>Desenvolver novos produtos, serviços e funcionalidades</li>
              <li>Comunicar com você sobre atualizações, suporte e informações promocionais</li>
              <li>Detectar e prevenir fraudes e atividades maliciosas</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartilhamento de Informações</h2>
            <p className="text-gray-700 mb-3">
              Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Com Seu Consentimento:</strong> Quando você autorizar expressamente</li>
              <li><strong>Provedores de Serviços:</strong> Com empresas que nos ajudam a operar o aplicativo (hospedagem, analytics)</li>
              <li><strong>Requisitos Legais:</strong> Quando exigido por lei ou para proteger direitos legais</li>
              <li><strong>Transferência de Negócios:</strong> Em caso de fusão, aquisição ou venda de ativos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Segurança dos Dados</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Criptografia de dados em trânsito (HTTPS/SSL)</li>
              <li>Criptografia de senhas (bcrypt)</li>
              <li>Autenticação segura</li>
              <li>Backups regulares</li>
              <li>Acesso restrito aos dados</li>
              <li>Monitoramento de segurança</li>
            </ul>
            <p className="text-gray-700">
              No entanto, nenhum método de transmissão pela Internet é 100% seguro. 
              Não podemos garantir segurança absoluta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Seus Direitos (LGPD)</h2>
            <p className="text-gray-700 mb-3">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Acesso:</strong> Solicitar cópias de seus dados pessoais</li>
              <li><strong>Correção:</strong> Corrigir dados incompletos ou incorretos</li>
              <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
              <li><strong>Informação:</strong> Saber com quem compartilhamos seus dados</li>
            </ul>
            <p className="text-gray-700">
              Para exercer seus direitos, entre em contato conosco através do email: 
              <strong className="text-blue-600"> privacidade@venlo.com.br</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Retenção de Dados</h2>
            <p className="text-gray-700">
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os 
              propósitos descritos nesta política, a menos que um período de retenção maior seja 
              exigido ou permitido por lei.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies e Tecnologias Similares</h2>
            <p className="text-gray-700 mb-4">
              Usamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Manter você conectado</li>
              <li>Lembrar suas preferências</li>
              <li>Analisar o uso do aplicativo</li>
              <li>Melhorar a experiência do usuário</li>
            </ul>
            <p className="text-gray-700">
              Você pode configurar seu navegador para recusar cookies, mas isso pode afetar 
              algumas funcionalidades do aplicativo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacidade de Menores</h2>
            <p className="text-gray-700">
              Nosso aplicativo não é direcionado a menores de 18 anos. Não coletamos 
              intencionalmente informações de menores. Se você é pai/mãe ou responsável e 
              acredita que seu filho nos forneceu informações, entre em contato conosco.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Links para Outros Sites</h2>
            <p className="text-gray-700">
              Nosso aplicativo pode conter links para sites de terceiros. Não somos responsáveis 
              pelas práticas de privacidade desses sites. Recomendamos que você leia as políticas 
              de privacidade de cada site que visitar.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Alterações nesta Política</h2>
            <p className="text-gray-700">
              Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você 
              sobre quaisquer alterações publicando a nova política nesta página e atualizando a 
              data de "Última atualização". Recomendamos que você revise esta política regularmente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contato</h2>
            <p className="text-gray-700 mb-4">
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacidade@venlo.com.br</p>
              <p className="text-gray-700"><strong>Site:</strong> https://venlo.com.br</p>
              <p className="text-gray-700"><strong>Encarregado de Dados (DPO):</strong> dpo@venlo.com.br</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Base Legal (LGPD)</h2>
            <p className="text-gray-700 mb-3">
              Processamos seus dados pessoais com base nas seguintes bases legais:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Consentimento:</strong> Quando você nos fornece permissão explícita</li>
              <li><strong>Execução de Contrato:</strong> Para fornecer os serviços contratados</li>
              <li><strong>Obrigação Legal:</strong> Para cumprir requisitos legais</li>
              <li><strong>Legítimo Interesse:</strong> Para melhorar nossos serviços e prevenir fraudes</li>
            </ul>
          </section>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-8">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Esta Política de Privacidade está em conformidade com a 
              Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e outras legislações 
              aplicáveis de proteção de dados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
