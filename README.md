# Von Neumann Defender — Arquitetura de Computadores (PCB Edition)

**Von Neumann Defender** é um jogo 2D de ação, coleta e defesa de base (*Top-Down Roguelite / Base-Builder*) desenvolvido em **TypeScript, React e HTML5 Canvas**, inteiramente ambientado no interior de um processador e sobre uma **Placa de Circuito Impresso (PCB)**.

O objetivo do projeto é transformar conceitos fundamentais da disciplina de **Arquitetura e Organização de Computadores** em mecânicas interativas, permitindo visualizar e vivenciar na prática o funcionamento da **Arquitetura de Von Neumann**, o ciclo de instrução (*Fetch-Decode-Execute*), a hierarquia de memória, os barramentos e as anomalias de execução em pipeline.

---

## 1. O Que o Jogo Faz (Visão Geral e Loop Principal)

No jogo, você assume o controle da **Unidade Lógica e Aritmética (ULA / ALU)** operando dentro do *die* de silício de uma CPU durante uma bateria de **6 Ciclos de Benchmark**:

1. **Trafegar pelos Barramentos (Exploração):** Você navega pelas trilhas de cobre da placa PCB a partir do núcleo central do processador.
2. **Ciclo de Busca / Data Fetch (Coleta de Recursos):** Usando o feixe de leitura do barramento de dados, você extrai três insumos vitais espalhados pelo circuito: **Ciclos de Clock (Hz)**, **Blocos de Cache SRAM (KB)** e **Instruções / Opcodes (ISA)**.
3. **Execução e Depuração (Combate):** Enquanto busca dados, anomalias de baixo nível (**Pipeline Hazards**, **Deadlocks** e **Page Faults**) invadem o chip tentando corromper a **Unidade de Controle (UC)**. Você utiliza disparos lógicos da ULA e saltos incondicionais (`JMP`) para neutralizá-las.
4. **Evolução da Microarquitetura (Upgrades):** Retornando à Unidade de Controle no centro do mapa, você investe os recursos coletados para instalar melhorias reais de engenharia de processadores — como **Barramento de 64-Bit**, **ULA Superescalar**, **Predição de Desvio (*Branch Predictor*)**, **Cache L1** e **Código de Correção de Erros (ECC)**.
5. **Validação ou Kernel Panic:** Se a integridade da Unidade de Controle ou a tensão (`VDD`) da ULA chegar a zero, ocorre uma exceção fatal (**Kernel Panic**). Se você sobreviver e depurar todos os 6 Ciclos de Benchmark, o processador é homologado com sucesso e seu **Throughput (IPC)** fica registrado.

---

## 2. Conexão com a Disciplina de Arquitetura de Computadores

Cada elemento visual, entidade, recurso e mecânica foi projetado como uma metáfora direta dos conteúdos estudados em sala de aula:

### A. Componentes da Arquitetura de Von Neumann

| Elemento no Jogo | Conceito em Arquitetura de Computadores | Como Funciona na Mecânica |
| :--- | :--- | :--- |
| **Jogador (Agente em forma de "V")** | **ULA — Unidade Lógica e Aritmética (ALU)** | Representada pelo símbolo clássico trapezoidal chanfrado em "V" dos diagramas de blocos da CPU. É o circuito responsável por realizar operações lógicas/aritméticas (disparos de execução) e processar os dados buscados. |
| **Base Central (Chip QFP Dourado)** | **Unidade de Controle (UC) + Banco de Registradores** | O cérebro do processador que coordena o ciclo de execução. Fica no centro da placa PCB com pinos metálicos nos 4 lados. Se a UC for destruída pelas anomalias, todo o sistema entra em colapso (*Kernel Panic*). |
| **Cúpula de Proteção Central** | **Barramento Local de Alta Velocidade** | Quando a ULA está próxima da Unidade de Controle, a latência de comunicação é mínima, permitindo regenerar rapidamente a **Tensão (`VDD`)** e o **Buffer de Clock**. |
| **Pulso de Choque da Base** | **Interrupção de Hardware (`IRQ` / Reset)** | Periodicamente, a Unidade de Controle emite um sinal de interrupção de alta prioridade (`IRQ HARDWARE RESET`) que limpa e afasta anomalias que estejam sobrecarregando o núcleo. |
| **Trilhas do Cenário** | **Barramentos de Dados, Endereços e Controle** | O fundo verde de fibra de vidro exibe trilhas em 45°, *vias* metalizadas e feixes de barramentos por onde pulsos elétricos trafegam continuamente. |
| **Minimapa no Canto Inferior** | **Mapa de Endereçamento de Memória** | Funciona como um analisador lógico / radar de endereços, mostrando a posição da UC, da ULA, dos bancos de memória e das exceções ativas. |

---

### B. Os 3 Recursos Coletáveis (O Ciclo *Fetch-Decode-Execute*)

A ação de "minerar" no jogo representa a etapa de **Busca (*Instruction & Data Fetch*)**, na qual o processador lê sinais e palavras de memória através do barramento:

1. **Ciclos de Clock (`Hz` — Cápsula de Cristal Oscilador Dourado):**
   - **Na disciplina:** O gerador de clock (cristal piezoelétrico de quartzo) emite pulsos de onda quadrada (`_|¯|_`) que sincronizam todas as operações síncronas do processador.
   - **No jogo:** É o recurso mais abundante, essencial para financiar qualquer evolução de frequência ou barramento.
2. **Cache SRAM (`KB` — Circuito Integrado DIP Prateado):**
   - **Na disciplina:** A *Static Random-Access Memory* (SRAM) é a memória volátil ultrarrápida usada nos níveis de Cache (L1/L2/L3) próximos ao núcleo para evitar o gargalo de buscar dados na memória principal (DRAM).
   - **No jogo:** Necessária para melhorias estruturais de armazenamento, registradores e largura de barramento.
3. **Instruções / Opcodes (`ISA` — Módulo ROM Hexagonal Verde/Âmbar):**
   - **Na disciplina:** O *Operation Code* (Opcode) é a porção da instrução em linguagem de máquina (definida pela *Instruction Set Architecture* — ISA) que especifica qual operação a ULA deve executar (`ADD`, `SUB`, `LOAD`, `JMP`).
   - **No jogo:** Recurso raro e de alto valor (também obtido ao depurar anomalias complexas), exigido para desbloquear técnicas avançadas como superescalaridade e predição de desvio.

---

### C. Inimigos como Anomalias de Execução e Baixo Nível

Em vez de monstros genéricos, os inimigos representam problemas clássicos de projeto de processadores e sistemas operacionais:

- **Pipeline Hazard (Triângulo Vermelho Rápido):**
  - *Conceito:* Conflitos estruturais, de dados (*RAW/WAR/WAW*) ou de controle que ocorrem quando instruções consecutivas no pipeline disputam o mesmo recurso ou dependem de resultados ainda não gravados (*Write-Back*).
  - *Comportamento:* Avançam rapidamente em enxame tentando atrasar (*stall*) ou danificar a ULA e a Unidade de Controle.
- **Deadlock (Octógono Pesado Dourado/Laranja):**
  - *Conceito:* Estado de travamento mútuo onde dois ou mais processos/unidades retêm recursos de barramento e aguardam indefinidamente um pelo outro.
  - *Comportamento:* Inimigo robusto de alta potência que projeta uma faixa de bloqueio de barramento (*Telegraph*) antes de avançar em alta velocidade para travar a ULA.
- **Page Fault / Stack Overflow (Losango Carmesim à Distância):**
  - *Conceito:* Exceção disparada pela MMU (*Memory Management Unit*) quando o processador tenta acessar uma página de memória virtual que não está mapeada na memória física ou viola limites de endereço (`SEGFAULT`).
  - *Comportamento:* Mantém distância e mira um ponteiro de endereço inválido (laser tracejado vermelho) antes de disparar projéteis de exceção contra a ULA.

---

### D. Árvore de Engenharia de Microarquitetura (Upgrades)

Ao pressionar `[E]` próximo à Unidade de Controle, o jogador acessa melhorias diretamente ligadas à evolução histórica dos processadores:

1. **Barramento de Dados 64-Bit (`BARRAMENTO`):**
   - Aumenta a largura do barramento (*bus width*), permitindo transferir mais bits por ciclo de busca (+40% de velocidade de leitura dos nós de recursos).
2. **ULA Superescalar (`EXECUÇÃO`):**
   - Inspira-se em arquiteturas superescalares capazes de despachar e executar múltiplas instruções em unidades funcionais paralelas (+30% de poder lógico nos disparos).
3. **Multiplicador de Clock / Overclock PLL (`EXECUÇÃO`):**
   - Utiliza um *Phase-Locked Loop* (PLL) para multiplicar a frequência de operação interna da CPU, aumentando a cadência de disparos (+25% de taxa de disparo).
4. **Registradores & Memória Cache L1 (`MEMÓRIA`):**
   - Expande o banco de registradores internos e a Cache L1, aumentando a estabilidade elétrica máxima da ULA (+35 mV de integridade `VDD`).
5. **Predição de Desvio / *Branch Predictor* (`PIPELINE`):**
   - Antecipa o resultado de desvios condicionais antes de serem resolvidos, evitando esvaziar o pipeline (*pipeline flush*) e aumentando a velocidade de deslocamento nas trilhas em +18%.
6. **Expansão da Unidade de Controle (`NÚCLEO CPU`):**
   - Amplia a capacidade da UC (+150 HP), expande o raio do Barramento Local e reduz o tempo de recarga da Interrupção de Hardware (`IRQ`).
7. **Rotina de Correção de Erros — ECC (`NÚCLEO CPU`):**
   - Baseada em memórias *Error-Correcting Code* (Código de Hamming), que detectam e corrigem inversões de bits (*bit flips*) automaticamente, restaurando 180 HP da Unidade de Controle.

---

## 3. Controles do Jogo

| Tecla / Ação | Função no Jogo | Metáfora na Arquitetura |
| :--- | :--- | :--- |
| **`W, A, S, D`** ou **Setas** | Movimentar a ULA pelas trilhas | Tráfego de sinais nos barramentos da PCB |
| **Mouse / Cursor** | Direcionar o topo da ULA | Apontamento do Contador de Programa / Endereço |
| **`Espaço`** ou **Segurar Botão Esquerdo (LMB)** | Ativar feixe de extração nos nós próximos | **Ciclo de Busca (*Instruction/Data Fetch*)** |
| **Clique Esquerdo (LMB)** ou **Segurar `F`** | Disparar pulsos lógicos contra anomalias | **Ciclo de Execução (*ALU Execute*)** |
| **`Shift`** ou **Botão Direito (RMB)** | Esquiva rápida com invulnerabilidade curta | **Salto Incondicional (`JMP` / *Branch*)** |
| **`E`** (próximo ao centro) | Abrir Terminal de Upgrades da UC | **Reconfiguração de Microarquitetura** |
| **`Esc`** | Pausar / Retomar partida | **Instrução `HLT` (*Halt* / Interrupção)** |
| **`M`** | Alternar áudio ligado/mudo | Controle do sintetizador de áudio |

---

## 4. Arquitetura de Software do Projeto

O código foi estruturado separando a **simulação matemática a 60 FPS** da **camada de interface declarativa em React**:

- **`src/game/systems/GameManager.ts`:** Coordenador mestre do *Game Loop*, cálculo de *delta time* limitado (`Math.min(rawDt, 0.05)`), efeito de *hitstop* (congelamento de 45ms em impactos críticos) e orquestração das ondas de benchmark.
- **`src/game/renderer/CanvasRenderer.ts`:** Motor gráfico 2D que desenha proceduralmente o substrato PCB, trilhas em 45°, *vias* douradas, encapsulamento QFP da Unidade de Controle, geometria em "V" da ULA, *telegraphs* de ataque e o radar de memória.
- **`src/game/engine/AudioSynth.ts`:** Sintetizador sonoro procedural construído com **Web Audio API** (osciladores senoidais, triangulares e dente-de-serra modulados em tempo real), sem depender de arquivos `.mp3` ou `.wav` externos.
- **`src/game/engine/ParticleSystem.ts`:** Sistema de partículas com *Object Pooling* pré-alocado (600 partículas reutilizáveis em $O(1)$) para evitar pausas de *Garbage Collection*.
- **`src/components/`:** Camada de interface de baixa oclusão (`HUD.tsx`, `TitleScreen.tsx`, `UpgradesModal.tsx`, `PauseModal.tsx`, `GameOverModal.tsx`) sincronizada por telemetria controlada.

---

## 5. Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento (porta 3000)
npm run dev

# 3. Gerar build de produção
npm run build
```
