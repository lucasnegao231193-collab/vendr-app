export default function TermosUso() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Termos de Uso - Venlo
        </h1>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-sm text-gray-600 mb-6">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-700">
              Ao acessar e usar o Venlo, você concorda em cumprir e estar vinculado a estes 
              Termos de Uso. Se você não concordar com qualquer parte destes termos, não use 
              nosso aplicativo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p className="text-gray-700 mb-4">
              O Venlo é uma plataforma de gestão de vendas externas e ambulantes que oferece:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Gestão de estoque e produtos</li>
              <li>Registro e controle de vendas</li>
              <li>Relatórios e análises</li>
              <li>Catálogo digital</li>
              <li>Gestão financeira</li>
              <li>Funcionalidades offline</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cadastro e Conta</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Elegibilidade</h3>
            <p className="text-gray-700 mb-4">
              Você deve ter pelo menos 18 anos para usar o Venlo. Ao criar uma conta, você 
              declara que tem capacidade legal para celebrar este contrato.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Responsabilidade da Conta</h3>
            <p className="text-gray-700 mb-4">
              Você é responsável por:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Manter a confidencialidade de sua senha</li>
              <li>Todas as atividades que ocorrem em sua conta</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              <li>Fornecer informações precisas e atualizadas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Uso Aceitável</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Você Concorda em NÃO:</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Usar o serviço para fins ilegais ou não autorizados</li>
              <li>Violar leis locais, estaduais, nacionais ou internacionais</li>
              <li>Transmitir vírus, malware ou código malicioso</li>
              <li>Tentar acessar contas de outros usuários</li>
              <li>Interferir ou interromper o serviço</li>
              <li>Fazer engenharia reversa do aplicativo</li>
              <li>Copiar, modificar ou distribuir o conteúdo sem autorização</li>
              <li>Usar o serviço para spam ou comunicações não solicitadas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Planos e Pagamentos</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Planos Disponíveis</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Plano Solo (Gratuito):</strong> Funcionalidades básicas para vendedores individuais</li>
              <li><strong>Planos Pagos:</strong> Funcionalidades avançadas e suporte prioritário</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Faturamento</h3>
            <p className="text-gray-700 mb-4">
              Para planos pagos:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Cobrança recorrente mensal ou anual</li>
              <li>Renovação automática até cancelamento</li>
              <li>Sem reembolsos para períodos parciais</li>
              <li>Preços sujeitos a alterações com aviso prévio de 30 dias</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
            <p className="text-gray-700 mb-4">
              O Venlo e todo seu conteúdo, recursos e funcionalidades são propriedade exclusiva 
              da Venlo e estão protegidos por leis de direitos autorais, marcas registradas e 
              outras leis de propriedade intelectual.
            </p>
            <p className="text-gray-700">
              Você mantém todos os direitos sobre os dados que insere no aplicativo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disponibilidade do Serviço</h2>
            <p className="text-gray-700 mb-4">
              Nos esforçamos para manter o Venlo disponível 24/7, mas:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Não garantimos disponibilidade ininterrupta</li>
              <li>Podemos realizar manutenções programadas</li>
              <li>Podem ocorrer interrupções não planejadas</li>
              <li>Não somos responsáveis por perdas decorrentes de indisponibilidade</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-700 mb-4">
              Na máxima extensão permitida por lei:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>O Venlo é fornecido "como está" sem garantias</li>
              <li>Não garantimos que o serviço atenderá suas necessidades específicas</li>
              <li>Não somos responsáveis por danos indiretos, incidentais ou consequenciais</li>
              <li>Nossa responsabilidade total não excederá o valor pago nos últimos 12 meses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Backup de Dados</h2>
            <p className="text-gray-700">
              Embora façamos backups regulares, você é responsável por manter cópias de seus 
              dados importantes. Não somos responsáveis por perda de dados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cancelamento e Suspensão</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Por Você</h3>
            <p className="text-gray-700 mb-4">
              Você pode cancelar sua conta a qualquer momento através das configurações.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 Por Nós</h3>
            <p className="text-gray-700 mb-4">
              Podemos suspender ou encerrar sua conta se:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Você violar estes Termos de Uso</li>
              <li>Houver atividade fraudulenta ou ilegal</li>
              <li>Não houver pagamento (para planos pagos)</li>
              <li>Por motivos legais ou regulatórios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modificações dos Termos</h2>
            <p className="text-gray-700">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. 
              Notificaremos você sobre alterações significativas. O uso continuado após as 
              alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Lei Aplicável</h2>
            <p className="text-gray-700">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. 
              Quaisquer disputas serão resolvidas nos tribunais brasileiros.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contato</h2>
            <p className="text-gray-700 mb-4">
              Para questões sobre estes Termos de Uso:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> suporte@venlo.com.br</p>
              <p className="text-gray-700"><strong>Site:</strong> https://venlo.com.br</p>
            </div>
          </section>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-8">
            <p className="text-sm text-blue-800">
              <strong>Ao usar o Venlo, você reconhece que leu, compreendeu e concorda em estar 
              vinculado a estes Termos de Uso e à nossa Política de Privacidade.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
