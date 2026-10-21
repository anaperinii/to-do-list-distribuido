import axios from 'axios';
import { env } from '../config/env';

export const logClient = {
  async registrar(token: string, acao: string, detalhe: string): Promise<void> {
    try {
      await axios.post(
        `${env.logsServiceUrl}/api/logs`,
        { acao, detalhe },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          timeout: 3000,
        },
      );
    } catch (error) {
      console.error('Falha ao registrar log no serviço de logs:', (error as Error).message);
    }
  },
};
