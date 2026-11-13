import React from 'react';
import { useScoreboardStore } from '../../store/useScoreboardStore';
import { Trophy, RotateCcw } from 'lucide-react';

export const VictoryModal: React.FC = () => {
  const {
    lutaFinalizada,
    vencedor,
    tipoVitoria,
    atletaBrancoNome,
    atletaAzulNome,
    novaLuta,
  } = useScoreboardStore();

  if (!lutaFinalizada || !vencedor) return null;

  const nomeVencedor = vencedor === 'Branco' ? atletaBrancoNome : atletaAzulNome;
  const corVencedor = vencedor === 'Branco' ? 'BRANCO (SHIRO)' : 'AZUL (AO)';

  const getTipoDescricao = (tipo: string | null) => {
    switch (tipo) {
      case 'Ippon':
        return 'VITÓRIA POR IPPON DIRETO';
      case 'WazaAriAwaseteIppon':
        return 'WAZA-ARI-AWASETE-IPPON (2º WAZA-ARI)';
      case 'HansokuMake':
        return 'VITÓRIA POR HANSOKU-MAKE (3 SHIDOS / DESQUALIFICAÇÃO)';
      case 'GoldenScorePoint':
        return 'VITÓRIA NO GOLDEN SCORE (PONTO DE OURO)';
      case 'WazaAri':
        return 'VITÓRIA POR PONTUAÇÃO (WAZA-ARI)';
      default:
        return 'LUTA ENCERRADA';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-slate-900 border-4 border-amber-500 rounded-3xl max-w-lg w-full p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow de Fundo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-400 shadow-lg shadow-amber-500/30">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/60">
          Resultado Oficial da Luta
        </span>

        <h2 className="text-3xl font-black text-white mt-4 tracking-tight">
          {nomeVencedor}
        </h2>

        <p className={`text-base font-extrabold uppercase mt-1 ${vencedor === 'Branco' ? 'text-slate-300' : 'text-blue-400'}`}>
          VENCEDOR: JUDOGI {corVencedor}
        </p>

        <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Decisão da Mesa:</span>
          <div className="text-sm font-black text-amber-300 mt-0.5">
            {getTipoDescricao(tipoVitoria)}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => novaLuta(240)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-base"
          >
            <RotateCcw className="w-5 h-5" />
            Iniciar Próximo Combate (Reset)
          </button>
        </div>
      </div>
    </div>
  );
};
