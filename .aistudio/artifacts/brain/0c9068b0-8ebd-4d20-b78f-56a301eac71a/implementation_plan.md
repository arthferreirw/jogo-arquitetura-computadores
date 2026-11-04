# Von Neumann Defender: Remodelação Temática para Arquitetura de Computadores

Este plano detalha a transformação visual, conceitual e de interface do jogo para o universo de **Arquitetura de Computadores (Arquitetura de Von Neumann)** sobre um substrato de **Circuito Impresso (PCB Verde e Dourado)**, preservando a fluidez de simulação a 60 FPS, o áudio procedural e a mecânica de coleta e defesa.

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo refletem suas escolhas confirmadas e definem a nova identidade do jogo antes de aplicarmos as alterações no código.

- **Metáfora Central Confirmada**: **Dentro da CPU e Arquitetura de Von Neumann** — O jogador controla o **Agente de Barramento / ULA (Unidade Lógica e Aritmética)** que percorre o chip buscando dados e protegendo a **Unidade de Controle (UC) + Banco de Registradores** no centro do processador.
- **Três Recursos Coletáveis Confirmados**:
  1. **Ciclos de Clock (Hz)** — Osciladores de quartzo dourados/ciano que alimentam a velocidade de operação (substitui *Aether*).
  2. **Cache SRAM (KB)** — Células estáticas de memória de acesso rápido em prata/silício para expansão estrutural (substitui *Titanium*).
  3. **Instruções / Opcodes (ISA)** — Pacotes de código de máquina de alto valor em verde-fósforo/âmbar para aprimoramentos avançados (substitui *Plasma*).
- **Direção Visual Confirmada**: **Circuito PCB (Verde Escuro, Trilhas de Cobre/Ouro e Serigrafia Técnica)** — O fundo do mapa passa a ser uma placa de circuito impresso com trilhas de barramento ortogonais, *vias* metalizadas, pinos de solda dourados e HUD inspirado em analisadores lógicos e serigrafia de hardware.

---

## 1. Overview & Core Concept

- **O Que o Jogo Faz**: O jogador opera dentro do die de um processador Von Neumann durante a execução de programas pesados (6 Ciclos de Execução / Benchmarks). É preciso realizar o ciclo **Fetch-Decode-Execute**: buscar *Ciclos de Clock*, blocos de *Cache SRAM* e *Opcodes* nos barramentos periféricos, enquanto dispara pulsos lógicos contra anomalias de hardware (*Pipeline Hazards*, *Deadlocks* e *Page Faults*) e aprimora a arquitetura do processador.
- **Público-Alvo**: Estudantes e entusiastas de Ciência da Computação e Arquitetura de Computadores que desejam vivenciar conceitos reais da matéria (ULA, Registradores, Cache L1/L2, Branch Prediction, Overclocking, Interrupções e Pipeline) de forma lúdica e interativa.
- **Valor Educacional e Lúdico**: Cada mecânica do jogo traduz um conceito real da disciplina:
  - **Mineração $\rightarrow$ Ciclo de Busca (Instruction/Data Fetch)** através do barramento de dados.
  - **Dash $\rightarrow$ Desvio Incondicional (`JMP` / `Branch` de Baixa Latência)** com gasto de energia de clock.
  - **Pulso da Base $\rightarrow$ Interrupção de Hardware (`IRQ` / `Reset de Pipeline`)** que limpa hazards próximos à Unidade de Controle.

---

## 2. User Experience & Visual Design

- **Fluxo de Experiência do Usuário**:
  1. **Tela de Título (Bootloader / BIOS Setup)**: O jogador é recebido pelo logotipo vetorial **VON NEUMANN // CORE-07** sobre uma câmera panorâmica que sobrevoa a Unidade de Controle na placa PCB. Exibe recordes de *Throughput (IPC Score)* e *Benchmark Wave* salvos, além do botão principal `INICIAR CICLO DE INSTRUÇÃO [SPACE / ENTER]`.
  2. **Jogo Ativo (Ciclo Fetch-Execute)**: O jogador navega sobre as trilhas do circuito impresso, extraindo recursos de *Osciladores de Clock*, *Bancos SRAM* e *ROMs de Opcodes*, enquanto neutraliza ameaças que tentam corromper a Unidade de Controle.
  3. **Terminal de Arquitetura (Microarquitetura & Upgrades `[E]`)**: Ao se aproximar da Unidade de Controle, o jogador abre o painel de engenharia da CPU para instalar melhorias como *Pipeline Superescalar*, *Predição de Desvio (Branch Predictor)* e *Memória Cache L1/L2*.
  4. **Pausa (`[Esc]`) e Relatório de Kernel Panic / Benchmark Concluído**: Telas de fim de partida estilizadas como relatórios de diagnóstico de hardware (*Kernel Panic: Unidade de Controle Corrompida* na derrota, ou *Benchmark 100% Estável: Processador Validado* na vitória).

- **Identidade Visual & Tema (PCB Verde & Dourado)**:
  - **Paleta 60-30-10**:
    - **60% Substrato PCB Dominante**: Verde fibra de vidro profundo (`#041B11` a `#072A1A`) com trilhas de circuito impressas em verde-esmeralda sutil (`#0D472A`) e *vias* de solda.
    - **30% Superfícies Estruturais (Silício & Serigrafia)**: Painéis em cinza-chumbo de chip integrado (`#0C1914`), bordas técnicas de serigrafia branca/creme (`#D1FAE5`) e barramentos de dados.
    - **10% Acentos de Alta Intenção (Ouro de Contato & Fósforo)**: Contatos banhados a ouro (`#F59E0B` / `#FBBF24`), pulsos lógicos em verde-fósforo (`#10B981`) e alertas de exceção/erro em vermelho LED (`#EF4444`).
  - **Tipografia & Hierarquia**:
    - Títulos e cabeçalhos com estética técnica limpa e espaçamento de serigrafia de hardware.
    - Leituras numéricas do HUD (Integridade de Tensão, Energia de Clock, Contadores de Recursos e Contador de Programa `PC`) com alinhamento tabular estrito (`font-mono tabular-nums`).
  - **Redesign Geométrico das Entidades no Canvas 2D**:
    - **Jogador (Agente ULA)**: Desenhado com o formato clássico trapezoidal chanfrado do símbolo da **ULA (ALU)** em diagramas de arquitetura, com pinos dourados de entrada/saída e feixe de leitura de barramento.
    - **Base Central (Unidade de Controle + Registradores)**: Chip quadrado QFP (*Quad Flat Package*) com pinos metálicos dourados nos quatro lados, núcleo de silício pulsante e perímetro de proteção representando o *Barramento Local de Alta Velocidade*.
    - **Nós de Recursos**:
      - *Ciclos de Clock*: Cristal oscilador metálico dourado com ondas de pulso quadrado (`_|¯|_`).
      - *Cache SRAM*: Chip DIP retangular prateado com fileiras de pinos laterais.
      - *Instruções (Opcodes)*: Bloco hexagonal de memória ROM emitindo brilho verde/âmbar com rótulos hexadecimais.
    - **Inimigos (Anomalias de Execução)**:
      - *Pipeline Hazard (antes Swarmer)*: Pacote de dados corrompido rápido e instável (triângulo vermelho pontilhado).
      - *Deadlock (antes Warden)*: Bloco pesado de travamento mútuo (octógono laranja/dourado com engrenagens/cadeados lógicos) que projeta uma trilha de travamento antes de dar carga.
      - *Page Fault / Stack Overflow (antes Sentinel)*: Anomalia de endereçamento (losango carmesim) que mira um ponteiro de memória laser (`0xERR`) antes de disparar exceções à distância.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Tradução Didática Completa (Terminologia de Arquitetura de Computadores em Português)**
  - *Abordagem Escolhida*: Converter todos os textos, HUD, nomes de inimigos, partículas flutuantes e upgrades para termos autênticos da disciplina (ex.: *Barramento Largura de Banda*, *Frequência de Clock*, *Unidade Lógica e Aritmética*, *Cache Hit*, *IRQ Pulse*).
  - *Por quê*: Atende diretamente ao objetivo de contextualizar o jogo na disciplina de Arquitetura de Computadores sem perder a clareza imediata dos controles e barras de estado.
- **Decisão 2: Renderização Procedural de Trilhas PCB no Canvas 2D**
  - *Abordagem Escolhida*: Substituir a grade espacial simples por um gerador visual de trilhas de circuito impresso (linhas com curvas de 45°, *pads* circulares de solda dourada e *vias* de conexão) diretamente no `CanvasRenderer`.
  - *Por quê*: Garante 60 FPS constantes sem depender de imagens externas pesadas e cria a sensação autêntica de estar navegando sobre uma placa-mãe / interior de CPU.

---

## 4. Technical Architecture & Data Strategy

### Diagrama de Arquitetura e Mapeamento Temático

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     APP SHELL (Von Neumann Defender)                    │
│  Estados: TITLE (BIOS) -> PLAYING -> PAUSED -> UPGRADE_STATION -> END   │
└───────────────┬─────────────────────────────────────────┬───────────────┘
                │                                         │
                ▼ (Isolado a 60 FPS)                      ▼ (Telemetria 12Hz)
┌───────────────────────────────────────┐ ┌───────────────────────────────┐
│        GAME MANAGER & SIMULAÇÃO       │ │    INTERFACE HUD & MODAIS     │
│                                       │ │                               │
│  ┌─────────────────────────────────┐  │ │  ┌─────────────────────────┐  │
│  │ Entidades de Arquitetura:       │  │ │  │ HUD Analisador Lógico:  │  │
│  │ • Jogador: Agente ULA (ALU)     │  │ │  │ • Tensão VDD (HP)       │  │
│  │ • Base: Unidade de Controle (UC)│  │ │  │ • Energia de Clock      │  │
│  │ • Recursos:                     │  │ │  │ • Contadores:           │  │
│  │   - Clock Cycles (Dourado)      │  │ │  │   [CLOCK] [SRAM] [ISA]  │  │
│  │   - Cache SRAM (Prata/Silício)  │  │ │  │ • Benchmark Wave 1..6   │  │
│  │   - Opcodes ISA (Verde/Âmbar)   │  │ │  └─────────────────────────┘  │
│  │ • Ameaças (Bugs/Exceções):      │  │ │  ┌─────────────────────────┐  │
│  │   - Pipeline Hazard (Rápido)    │  │ │  │ Terminal de Upgrades:   │  │
│  │   - Deadlock (Carga Pesada)     │  │ │  │ • Barramento 64-bit     │  │
│  │   - Page Fault (Ponteiro Laser) │  │ │  │ • ULA Superescalar      │  │
│  └───────────────┬─────────────────┘  │ │  │ • Overclocking PLL      │  │
│                  ▼                    │ │  │ • Cache L1 / L2         │  │
│  ┌─────────────────────────────────┐  │ │  │ • Branch Prediction     │  │
│  │ CanvasRenderer (Estética PCB):  │  │ │  │ • Subsistema UC + IRQ   │  │
│  │ • Substrato Verde + Trilhas 45° │  │ │  │ • Correção ECC (Reparo) │  │
│  │ • Pads de Solda Dourados        │  │ │  └─────────────────────────┘  │
│  │ • Radar de Endereçamento Memory │  │ └───────────────────────────────┘
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

### Árvore de Upgrades de Arquitetura de Computadores

| ID Interno | Nome na Disciplina | Categoria | Efeito Prático no Jogo |
| :--- | :--- | :--- | :--- |
| `MINING_DRILL` | **Barramento de Dados 64-Bit** | `BARRAMENTO` | Aumenta a taxa de transferência (leitura/extração de nós) em +40%. |
| `PLASMA_CANNON` | **ULA Superescalar (ALU)** | `EXECUÇÃO` | Aumenta o dano lógico por disparo de instrução em +30%. |
| `RAPID_DISCHARGE` | **Overclocking de Clock (PLL)** | `EXECUÇÃO` | Acelera a frequência de disparo da ULA em +25%. |
| `TITANIUM_PLATING` | **Registradores com Memória Cache L1** | `MEMÓRIA` | Expande a integridade máxima da ULA (+35 HP) e restaura tensão. |
| `THRUSTER_INJECTOR` | **Predição de Desvio (Branch Predictor)** | `PIPELINE` | Aumenta a velocidade de deslocamento nas trilhas em +18%. |
| `OUTPOST_REACTOR` | **Expansão da Unidade de Controle (UC)** | `NÚCLEO CPU` | Fortalece a UC (+150 HP), amplia o barramento local e acelera o pulso de Interrupção (`IRQ`). |
| `REPAIR_CORE` | **Código de Correção de Erros (ECC)** | `NÚCLEO CPU` | Executa rotina de paridade ECC para restaurar 180 HP da Unidade de Controle. |
