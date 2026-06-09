// Dashboard.jsx — tela principal com listagem de usuários
// Exibe tabela com usuários ativos, botões de edição e exclusão (soft delete)

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Dashboard() {
  const { usuario, logout } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estado do modal de edição
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formEdicao, setFormEdicao] = useState({ nome: '', email: '', endereco: '', senha: '' });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Busca a lista de usuários ativos ao montar o componente
  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get('/users');
      setUsuarios(response.data);
    } catch (error) {
      setErro('Erro ao carregar usuários.');
    } finally {
      setCarregando(false);
    }
  };

  // Abre o modal com os dados do usuário selecionado preenchidos
  const abrirModalEdicao = (user) => {
    setUsuarioEditando(user);
    setFormEdicao({
      nome: user.nome,
      email: user.email,
      endereco: user.endereco,
      senha: '', // Senha em branco: não altera se deixado vazio
    });
    setMensagem('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setUsuarioEditando(null);
  };

  // Salva as alterações do usuário via PUT
  const salvarEdicao = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');

    // Remove a senha do payload se não foi alterada
    const payload = { ...formEdicao };
    if (!payload.senha) delete payload.senha;

    try {
      await api.put(`/users/${usuarioEditando.id}`, payload);
      setMensagem('Usuário atualizado com sucesso!');
      await carregarUsuarios(); // Recarrega a lista
      setTimeout(() => fecharModal(), 1500);
    } catch (error) {
      setMensagem(error.response?.data?.error || 'Erro ao atualizar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  // Realiza o Soft Delete via DELETE (o backend apenas preenche deletedAt)
  const deletarUsuario = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja remover "${nome}"?`)) return;

    try {
      await api.delete(`/users/${id}`);
      // Remove da lista local imediatamente (sem precisar recarregar)
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      alert('Erro ao deletar usuário.');
    }
  };

  // Formata a data para exibição legível
  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Olá, <span className="font-medium text-blue-600">{usuario?.nome}</span></p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          Sair
        </button>
      </nav>

      {/* Conteúdo principal */}
      <main className="p-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Cabeçalho da tabela */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Usuários Cadastrados</h2>
            <button
              onClick={carregarUsuarios}
              className="text-sm text-blue-600 hover:underline"
            >
              Atualizar
            </button>
          </div>

          {/* Estados de carregamento e erro */}
          {carregando && (
            <div className="p-8 text-center text-gray-500">Carregando usuários...</div>
          )}

          {erro && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {erro}
            </div>
          )}

          {/* Tabela de usuários */}
          {!carregando && !erro && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">E-mail</th>
                    <th className="px-6 py-3">Endereço</th>
                    <th className="px-6 py-3">Cadastrado em</th>
                    <th className="px-6 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        Nenhum usuário cadastrado.
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-800">{user.nome}</td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-gray-600">{user.endereco}</td>
                        <td className="px-6 py-4 text-gray-500">{formatarData(user.createdAt)}</td>
                        <td className="px-6 py-4 text-center space-x-2">
                          {/* Botão Editar */}
                          <button
                            onClick={() => abrirModalEdicao(user)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                          >
                            Editar
                          </button>
                          {/* Botão Deletar (Soft Delete) */}
                          <button
                            onClick={() => deletarUsuario(user.id, user.nome)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Editar Usuário</h2>

            {mensagem && (
              <div className={`rounded-lg px-4 py-3 mb-4 text-sm ${
                mensagem.includes('sucesso')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {mensagem}
              </div>
            )}

            <form onSubmit={salvarEdicao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formEdicao.nome}
                  onChange={(e) => setFormEdicao({ ...formEdicao, nome: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formEdicao.email}
                  onChange={(e) => setFormEdicao({ ...formEdicao, email: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={formEdicao.endereco}
                  onChange={(e) => setFormEdicao({ ...formEdicao, endereco: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova senha <span className="text-gray-400 font-normal">(deixe em branco para não alterar)</span>
                </label>
                <input
                  type="password"
                  value={formEdicao.senha}
                  onChange={(e) => setFormEdicao({ ...formEdicao, senha: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
