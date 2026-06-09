// Cadastro.jsx — tela de cadastro de novos usuários

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    endereco: '',
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      await api.post('/users', form);

      setSucesso('Cadastro realizado com sucesso! Redirecionando para o login...');

      // Aguarda 2 segundos para o usuário ver a mensagem, depois redireciona
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Criar Conta</h1>
          <p className="text-gray-500 mt-2">Preencha os dados abaixo para se cadastrar</p>
        </div>

        {/* Mensagens de feedback */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {sucesso}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              placeholder="João da Silva"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              required
              placeholder="Rua Exemplo, 123 - Cidade/UF"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {/* Link para login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;
