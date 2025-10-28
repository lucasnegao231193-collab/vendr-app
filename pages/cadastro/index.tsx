"use client";

import { useRouter } from 'next/router';
import { Briefcase, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CadastroSelecao() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Criar Nova Conta
          </h1>
          <p className="text-lg text-gray-600">
            Escolha o tipo de conta que deseja criar
          </p>
        </div>

        {/* Cards de Seleção */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Modo Pessoal */}
          <button
            onClick={() => router.push('/cadastro/pessoal')}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-orange-500 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
                <User className="h-10 w-10 text-orange-600 group-hover:text-white transition-colors" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Modo Pessoal
              </h2>
              
              <p className="text-gray-600 mb-6">
                Para autônomos e profissionais independentes
              </p>
              
              <ul className="space-y-3 text-left w-full mb-6">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Gestão individual</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Controle pessoal de vendas</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Relatórios simplificados</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Ideal para começar</span>
                </li>
              </ul>
              
              <div className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold group-hover:bg-orange-600 transition-colors">
                Criar Conta Pessoal
              </div>
            </div>
          </button>

          {/* Modo Empresa */}
          <button
            onClick={() => router.push('/cadastro/empresa')}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-orange-500 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                <Briefcase className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Modo Empresa
              </h2>
              
              <p className="text-gray-600 mb-6">
                Para empresas com equipe de vendas
              </p>
              
              <ul className="space-y-3 text-left w-full mb-6">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Gestão de múltiplos vendedores</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Controle centralizado</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Relatórios completos</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Dashboard administrativo</span>
                </li>
              </ul>
              
              <div className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold group-hover:bg-blue-600 transition-colors">
                Criar Conta Empresa
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p>
            Já tem uma conta?{' '}
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
