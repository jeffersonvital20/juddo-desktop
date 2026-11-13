import { useEffect } from 'react';
import { useScoreboardStore } from '../store/useScoreboardStore';

export function useScoreboardShortcuts() {
  const toggleCronometro = useScoreboardStore((s) => s.toggleCronometro);
  const iniciarOsaekomi = useScoreboardStore((s) => s.iniciarOsaekomi);
  const toketa = useScoreboardStore((s) => s.toketa);
  const toggleSonoMama = useScoreboardStore((s) => s.toggleSonoMama);
  const toggleGoldenScore = useScoreboardStore((s) => s.toggleGoldenScore);
  const resetTempo = useScoreboardStore((s) => s.resetTempo);

  // Pontuações Branco
  const adicionarWazaAri = useScoreboardStore((s) => s.adicionarWazaAri);
  const removerWazaAri = useScoreboardStore((s) => s.removerWazaAri);
  const adicionarIppon = useScoreboardStore((s) => s.adicionarIppon);
  const adicionarShido = useScoreboardStore((s) => s.adicionarShido);
  const removerShido = useScoreboardStore((s) => s.removerShido);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se o usuário estiver digitando em um input de texto
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      const isShift = e.shiftKey;

      switch (key) {
        // Controle de Cronômetro
        case ' ': // Barra de espaço
          e.preventDefault();
          toggleCronometro();
          break;

        case 's': // Sono-Mama / Yoshi
          e.preventDefault();
          toggleSonoMama();
          break;

        case 'g': // Alternar Golden Score
          e.preventDefault();
          toggleGoldenScore();
          break;

        case 'r': // Reset de tempo
          if (isShift) {
            e.preventDefault();
            resetTempo();
          }
          break;

        // Controle de Osaekomi
        case 'o': // Osaekomi Branco
          e.preventDefault();
          iniciarOsaekomi('Branco');
          break;

        case 'p': // Osaekomi Azul
          e.preventDefault();
          iniciarOsaekomi('Azul');
          break;

        case 'x': // Toketa (Fim da Imobilização)
        case 'escape':
          e.preventDefault();
          toketa();
          break;

        // PONTUAÇÕES DO ATLETA BRANCO (Lado Esquerdo do Teclado: W, I, 1)
        case 'w':
          e.preventDefault();
          if (isShift) removerWazaAri('Branco');
          else adicionarWazaAri('Branco');
          break;

        case 'i':
          e.preventDefault();
          adicionarIppon('Branco');
          break;

        case '1':
          e.preventDefault();
          if (isShift) removerShido('Branco');
          else adicionarShido('Branco');
          break;

        // PONTUAÇÕES DO ATLETA AZUL (Lado Direito: E, K, 2)
        case 'e':
          e.preventDefault();
          if (isShift) removerWazaAri('Azul');
          else adicionarWazaAri('Azul');
          break;

        case 'k':
          e.preventDefault();
          adicionarIppon('Azul');
          break;

        case '2':
          e.preventDefault();
          if (isShift) removerShido('Azul');
          else adicionarShido('Azul');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleCronometro,
    iniciarOsaekomi,
    toketa,
    toggleSonoMama,
    toggleGoldenScore,
    resetTempo,
    adicionarWazaAri,
    removerWazaAri,
    adicionarIppon,
    adicionarShido,
    removerShido,
  ]);
}
