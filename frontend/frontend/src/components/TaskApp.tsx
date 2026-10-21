import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, api, type Estatisticas, type Tarefa } from '../api';

interface TaskAppProps {
  onLogout: () => void;
}

export function TaskApp({ onLogout }: TaskAppProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  async function carregar(): Promise<void> {
    try {
      const [listaTarefas, estatisticas] = await Promise.all([api.listarTarefas(), api.estatisticas()]);
      setTarefas(listaTarefas);
      setStats(estatisticas);
    } catch (error) {
      setAlertMessage(error instanceof ApiError ? error.message : 'Não foi possível carregar as tarefas.');
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!titulo.trim()) return;

    setIsCreating(true);
    setAlertMessage(null);

    try {
      await api.criarTarefa({ titulo, descricao: descricao || undefined });
      setTitulo('');
      setDescricao('');
      await carregar();
    } catch (error) {
      setAlertMessage(error instanceof ApiError ? error.message : 'Não foi possível criar a tarefa.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggle(tarefa: Tarefa): Promise<void> {
    try {
      await api.atualizarTarefa(tarefa.id, { concluida: !tarefa.concluida });
      await carregar();
    } catch (error) {
      setAlertMessage(error instanceof ApiError ? error.message : 'Não foi possível atualizar a tarefa.');
    }
  }

  async function handleDelete(tarefa: Tarefa): Promise<void> {
    try {
      await api.excluirTarefa(tarefa.id);
      await carregar();
    } catch (error) {
      setAlertMessage(error instanceof ApiError ? error.message : 'Não foi possível excluir a tarefa.');
    }
  }

  return (
    <div className="view">
      <div className="panel-head">
        <div className="eyebrow">Minhas tarefas</div>
      </div>

      {alertMessage ? (
        <div className="alert" data-kind="error" role="alert">
          {alertMessage}
        </div>
      ) : null}

      <dl className="stats-row">
        <div className="stat">
          <dt>Total</dt>
          <dd>{stats?.total ?? '—'}</dd>
        </div>
        <div className="stat">
          <dt>Concluídas</dt>
          <dd>{stats?.concluidas ?? '—'}</dd>
        </div>
        <div className="stat">
          <dt>Pendentes</dt>
          <dd>{stats?.pendentes ?? '—'}</dd>
        </div>
      </dl>

      <form className="task-form" onSubmit={handleCreate}>
        <div className="field">
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="O que precisa ser feito?"
          />
        </div>

        <div className="field">
          <label htmlFor="descricao">Descrição (opcional)</label>
          <textarea
            id="descricao"
            rows={2}
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Detalhes da tarefa"
          />
        </div>

        <button className="btn-primary" type="submit" disabled={isCreating || !titulo.trim()}>
          {isCreating ? 'Adicionando…' : 'Adicionar tarefa'}
        </button>
      </form>

      <div className="rule" />

      <div className="section-title">Lista</div>

      {tarefas.length === 0 ? (
        <p className="empty-state">Nenhuma tarefa ainda. Crie a primeira acima.</p>
      ) : (
        <ul className="task-list">
          {tarefas.map((tarefa) => (
            <li className="task-item" key={tarefa.id} data-done={tarefa.concluida}>
              <div className="task-info">
                <div className="task-title">{tarefa.titulo}</div>
                {tarefa.descricao ? <div className="task-desc">{tarefa.descricao}</div> : null}
              </div>

              <div className="task-actions">
                <button
                  className="btn-icon"
                  type="button"
                  title={tarefa.concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
                  onClick={() => void handleToggle(tarefa)}
                >
                  {tarefa.concluida ? '↺' : '✔'}
                </button>
                <button
                  className="btn-icon"
                  data-kind="danger"
                  type="button"
                  title="Excluir tarefa"
                  onClick={() => void handleDelete(tarefa)}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button className="btn-ghost" type="button" onClick={onLogout}>
        Sair
      </button>
    </div>
  );
}
