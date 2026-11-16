# 🖥️ Judoo Desktop — Mesa de Operação do Tatame e Cronometragem Oficial (FIJ)

Aplicação desktop multiplataforma de missão crítica e altíssima responsividade desenvolvida com **Tauri v2 (Rust) + React 18 + TypeScript** para operação pelos **mesários oficiais** à beira do tatame.

Projetado para operar com **latência zero no cronômetro local** e sincronização em tempo real com o servidor central (`juddo-backend`) e os telões da arena (`juddo-web`), aplicando automaticamente todas as regras oficiais de pontuação e penalidades da **Federação Internacional de Judô (FIJ)**.

---

## 🚀 Tecnologias Utilizadas

- **Shell Nativo & Backend Local**: [Tauri v2](https://v2.tauri.app/) + **Rust (Edition 2021)** (`tauri-plugin-shell`, comandos nativos IPC para alertas sonoros de tatame / gongo)
- **Interface Gráfica (Frontend)**: [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Bundler**: [Vite 5](https://vitejs.dev/)
- **Gerenciamento de Estado de Baixa Latência**: [Zustand v5](https://zustand-demo.pmnd.rs/)
- **Estilização & UI**: [Tailwind CSS 3](https://tailwindcss.com/) (com suporte a temas e alto contraste para ginásios), `clsx` e `tailwind-merge`
- **Ícones**: [Lucide React](https://lucide.dev/)

---

## 🥋 Funcionalidades e Regras FIJ Implementadas

- **Cronômetro Oficial de Combate (`Hajime` / `Matte`)**:
  - Contagem regressiva precisa (padrão 4 minutos para Sênior) e transição automática ou manual para **Golden Score** (tempo progressivo sem limite até a primeira pontuação ou decisão).
- **Cronômetro de Imobilização (`Osaekomi` / `Toketa` / `Sono-mama` / `Yoshi`)**:
  - **10 a 19 segundos**: Concede automaticamente **Waza-ari** ao atleta que aplica a imobilização.
  - **20 segundos** (ou 10 segundos caso o atleta já possua 1 Waza-ari): Concede **Ippon** (*Waza-ari-awasete-ippon*) e encerra o combate automaticamente.
- **Regras Automáticas de Pontuação e Penalidades (FIJ)**:
  - **2º Waza-ari**: Converte automaticamente em *Waza-ari-awasete-ippon* e finaliza a luta.
  - **3º Shido (Penalidade)**: Aplica automaticamente **Hansoku-make** (desclassificação) ao infrator e declara a vitória por Ippon ao adversário.
  - **Auditoria / Correção**: Permite cancelar Waza-ari ou Shido com recálculo imediato do placar e registro de evento na API.
- **Atalhos Rápidos de Teclado para Mesários**: Operação ágil durante o combate sem depender exclusivamente do mouse.
- **Sincronização com a API Central**: Envio imediato dos eventos de pontuação e estado do cronômetro para atualização simultânea do Telão da Arena e das chaves do campeonato.

---

## ⚙️ Pré-requisitos

1. **Para rodar em modo Web / Interface de Desenvolvimento Rápido (apenas Node.js)**:
   - [Node.js 20+](https://nodejs.org/) e `npm`
2. **Para rodar ou compilar o executável Desktop Nativo (Tauri + Rust)**:
   - [Node.js 20+](https://nodejs.org/)
   - [Rust & Cargo](https://www.rust-lang.org/tools/install) (`rustup`)
   - **Windows**: Microsoft Visual Studio C++ Build Tools + WebView2 (já incluso no Windows 10/11)
   - **Linux**: pacotes `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`
   - **macOS**: Xcode Command Line Tools
3. **Backend (`juddo-backend`)** em execução (padrão em `http://localhost:8080`).

---

## 💻 Como Rodar o Projeto

### Opção 1 — Rodar como Aplicação Desktop Nativa (Tauri)

1. Instale as dependências:
   ```bash
   cd juddo-desktop
   npm install
   ```

2. Inicie o Tauri em modo de desenvolvimento (abre a janela nativa do sistema operacional):
   ```bash
   npm run tauri dev
   ```

### Opção 2 — Rodar no Navegador (Modo Vite Dev Server)

Ideal para desenvolvimento rápido de interface sem precisar compilar o binário Rust:

```bash
cd juddo-desktop
npm install

# Ambiente de Desenvolvimento (.env.development)
npm run dev

# Ambiente de Homologação (.env.staging)
npm run dev:staging

# Ambiente de Produção (.env.production)
npm run dev:prod
```
Acesse em: [http://localhost:1420](http://localhost:1420) (ou na porta indicada pelo Vite no terminal).

---

## 📦 Como Gerar e Baixar o Aplicativo Nativo (`.exe` / `.zip`)

### 📥 Onde Baixar o Executável Pronto
O aplicativo compilado para Windows x64 está disponível diretamente pela aplicação web oficial:
- **Página Inicial do Judoo Web**: No card da Mesa ou no botão do cabeçalho.
- **Link Direto**: `http://localhost:3000/downloads/judoo-desktop-windows-x64.zip` (ou na pasta `public/downloads/judoo-desktop-windows-x64.zip` do repositório `juddo-web`).
- **Instalação**: Extraia o arquivo `.zip` e execute `judoo-desktop.exe` com privilégios normais de usuário.

### 🔨 Compilação Manual a partir do Código Fonte

Para compilar o executável de produção otimizado com Tauri e Rust:

```bash
# 1. Gerar o frontend de produção
npm run build:prod

# 2. Compilar o binário release com Tauri/Cargo
npm run tauri build
# ou diretamente via cargo:
cd src-tauri && cargo build --release
```

Os arquivos compilados estarão disponíveis em:
- Executável de Release: `src-tauri/target/release/judoo-desktop.exe`
- Instaladores automáticos (NSIS/MSI): `src-tauri/target/release/bundle/`

Para compilar apenas o bundle web (`dist/`) por ambiente:
```bash
npm run build:dev
npm run build:staging
npm run build:prod
```

---

## 🔧 Variáveis de Ambiente

O projeto conta com arquivos de configuração para cada ambiente na raiz:
- `.env.development` (Desenvolvimento local)
- `.env.staging` (Homologação)
- `.env.production` (Produção)

| Variável | Descrição | Exemplo (`development`) |
| :--- | :--- | :--- |
| `VITE_APP_ENV` | Ambiente ativo (`development`, `staging`, `production`) | `development` |
| `VITE_ENV_LABEL` | Identificação visual do ambiente na tela da mesa | `Desenvolvimento` |
| `VITE_API_URL` | URL base da API REST (`juddo-backend`) | `http://localhost:8080/api` |
| `VITE_HUB_URL` | URL do Hub SignalR (`/hubs/tatame`) | `http://localhost:8080/hubs/tatame` |

---

## 🔐 Acesso de Mesário para Testes Locais

Com o `juddo-backend` rodando em desenvolvimento, utilize a credencial padrão de mesário:
- **E-mail**: `mesario1@judoo.com` (ou `admin@judoo.com`)
- **Senha**: `123456`
