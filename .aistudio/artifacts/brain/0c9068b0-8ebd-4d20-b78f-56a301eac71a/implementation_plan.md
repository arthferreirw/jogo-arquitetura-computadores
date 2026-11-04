# Simplificação de Terminologia: Tela de Fim de Jogo e HUD Acessível

Este plano detalha a atualização de linguagem na **Tela de Fim de Jogo (Derrota/Vitória)** e no **HUD durante a partida**, substituindo jargões excessivamente técnicos por termos claros e familiares para qualquer jogador, mantendo a referência à disciplina de **Arquitetura de Computadores** entre parênteses.

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo refletem exatamente as suas escolhas confirmadas:

- **Formato dos Rótulos (Confirmado)**: **Termos simples com o conceito entre parênteses** — O jogador lê primeiro o que o indicador significa no jogo (ex.: *Vida*, *Pontos*, *Recursos Coletados*) e vê a associação com a disciplina de forma leve entre parênteses.
- **Motivo da Derrota (Confirmado)**: **Exibir apenas a causa direta da derrota** — A tela de derrota mostrará claramente se o jogador perdeu porque **a vida da sua nave (ULA) acabou** ou porque **a Base Central (Unidade de Controle) foi destruída**.
- **Alcance da Simplificação (Confirmado)**: **Simplificar também o HUD durante a partida** — As barras de Vida, Energia, Esquiva, Onda, Pontuação e Base no HUD principal seguirão o mesmo padrão claro e direto.

---

## 1. Overview & Core Concept

- **O Que Muda**: Jogadores que não dominam siglas como `VDD (mV)`, `IPC`, `HLT`, `JMP` ou `0xDEAD` agora entenderão instantaneamente cada barra de status durante o jogo e o resumo ao final da partida, sem que o jogo perca sua identidade temática de Arquitetura de Computadores.
- **Benefício Principal**: Reduz a carga cognitiva durante a ação rápida e deixa o placar de fim de jogo autoexplicativo na primeira leitura.

---

## 2. User Experience & Visual Design

### A. Nova Tela de Fim de Jogo (Derrota e Vitória)

1. **Cabeçalho Direto e Compreensível**:
   - **Na Derrota**:
     - Subtítulo: `FIM DE JOGO · SISTEMA INTERROMPIDO` (em vez de `EXCEÇÃO FATAL DE HARDWARE // 0xDEAD`)
     - Título Principal: `PROCESSADOR SOBRECARREGADO` (em vez de `KERNEL PANIC: FALHA NA CPU`)
     - **Aviso da Causa Direta da Derrota**: Uma faixa destacada logo abaixo do título informando exatamente o motivo:
       - Caso 1 (Jogador sem vida): *"Causa da derrota: A vida da sua nave (ULA) chegou a zero."*
       - Caso 2 (Base destruída): *"Causa da derrota: A Base Central (Unidade de Controle) foi destruída pelos inimigos."*
   - **Na Vitória**:
     - Subtítulo: `MISSÃO CONCLUÍDA · TODAS AS ONDAS SUPERADAS`
     - Título Principal: `PROCESSADOR PROTEGIDO!`

2. **Tabela de Estatísticas (Termo Simples + Conceito entre Parênteses)**:
   - `PONTUAÇÃO FINAL (Desempenho)` $\rightarrow$ `1250 pts` (sem a sigla confusa `IPC`)
   - `ONDA ALCANÇADA (Ciclo)` $\rightarrow$ `Onda 3 / 6`
   - `RECURSOS COLETADOS (Dados)` $\rightarrow$ `45 itens` (em vez de `palavras buscadas (Fetch)`)
   - `INIMIGOS DERROTADOS (Bugs)` $\rightarrow$ `18 inimigos` (em vez de `anomalias depuradas`)
   - `TEMPO DE SOBREVIVÊNCIA:` $\rightarrow$ `02:15` (em vez de `Tempo de Uptime da CPU`)
   - `RECORDE DE PONTOS:` $\rightarrow$ `3400 pts` (em vez de `Recorde Histórico de IPC`)

3. **Botões de Ação Claros**:
   - `JOGAR NOVAMENTE [ESPAÇO / ENTER]`
   - `VOLTAR AO MENU INICIAL`

---

### B. Novo HUD Principal Durante a Partida

- **Canto Superior Esquerdo (Status do Jogador)**:
  - `VIDA (ULA)` com leitura em `100 / 100 HP` (em vez de `TENSÃO ULA (VDD)` em `mV`)
  - `ENERGIA (Clock)` com leitura `100 / 100` (em vez de `BUFFER DE CLOCK`)
  - `ESQUIVA [SHIFT / RMB]: PRONTA | CARREGANDO` (em vez de `SALTO JMP: EM LATÊNCIA`)
- **Topo Central (Progresso de Ondas)**:
  - `ONDA X / 6 (Ciclo da CPU)`
  - `PRÓXIMA ONDA EM Xs` ou `DERROTE OS INIMIGOS (X restantes)` (em vez de `PRÓXIMO FETCH` / `DEPURAR HAZARDS`)
- **Canto Superior Direito (Recursos e Pontos)**:
  - Mantém os 3 recursos claros: `CLOCK`, `SRAM` e `OPCODES`
  - Placar: `PONTOS: X` (em vez de `THROUGHPUT: X IPC`)
- **Rodapé Central (Status da Base)**:
  - Botão de interação: `PRESSIONE [E] OU CLIQUE: ABRIR MELHORIAS DA BASE (UPGRADES)`
  - Barra da Base: `BASE CENTRAL (Unidade de Controle Nv.X)` com `500 / 500 HP`

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão: Rastrear a Causa Exata da Derrota no Estado do Jogo**
  - *Abordagem Escolhida*: Armazenar no `GameManager` a mensagem clara do motivo da derrota (`gameOverReason`) no exato momento em que a vida da ULA chega a zero ou a vida da Base Central chega a zero, repassando-a diretamente para o modal de Fim de Jogo.
  - *Por quê*: Garante que o jogador nunca fique em dúvida se perdeu porque levou dano demais ou porque esqueceu de defender a base no centro do mapa.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GAME MANAGER (Estado da Partida)                 │
│  • Detecta fim de jogo:                                                 │
│    - player.hp <= 0  ──► "A vida da sua nave (ULA) chegou a zero."      │
│    - core.hp <= 0    ──► "A Base Central (Unidade de Controle) caiu."   │
└───────────────┬─────────────────────────────────────────┬───────────────┘
                │                                         │
                ▼                                         ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────┐
│        HUD DURANTE A PARTIDA          │ │      MODAL DE FIM DE JOGO     │
│  • VIDA (ULA): 100 / 100 HP           │ │  • Título claro de Fim/Vitória│
│  • ENERGIA (Clock): 100 / 100         │ │  • Destaque: Causa da Derrota │
│  • ESQUIVA: PRONTA / CARREGANDO       │ │  • PONTUAÇÃO FINAL (pts)      │
│  • ONDA X / 6 (Ciclo da CPU)          │ │  • ONDA ALCANÇADA (Ciclo)     │
│  • PONTOS: X                          │ │  • RECURSOS COLETADOS (Dados) │
│  • BASE CENTRAL (Unidade de Controle) │ │  • INIMIGOS DERROTADOS (Bugs) │
└───────────────────────────────────────┘ └───────────────────────────────┘
```
