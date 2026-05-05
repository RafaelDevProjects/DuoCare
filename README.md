<p align="center">
  <img src="assets/mascote.png" width="120" alt="Care Plus Mascote"/>
</p>

<h1 align="center">Care Plus</h1>
<p align="center">
  Plataforma de saúde e bem-estar com desafios, rede social e sistema de ligas
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo-blue?logo=expo" />
  <img src="https://img.shields.io/badge/Backend-Spring_Boot_4-green?logo=springboot" />
  <img src="https://img.shields.io/badge/Database-Oracle-red?logo=oracle" />
  <img src="https://img.shields.io/badge/Auth-JWT-yellow" />
</p>

---

## Sobre o Projeto

O **Care Plus** é um aplicativo desenvolvido para a empresa de convênios médicos Care Plus, com o objetivo de melhorar a saúde física e mental dos clientes através de:

- **Desafios** de corrida, hidratação, meditação e nutrição com sistema de pontuação
- **Rede social** interna para compartilhar conquistas e interagir com outros usuários
- **Sistema de ligas** (Bronze → Prata → Ouro → Platina → Diamante → Safira) baseado em pontos acumulados
- **Ranking** global com pódio animado
- **Conexões** entre usuários para criar uma comunidade engajada

---

## Estrutura do Repositório

```
careplus/
├── careplus-api/          ← Backend Java Spring Boot
└── duocare-app/           ← Frontend React Native (Expo)
```

---

# 📱 Mobile — React Native (Expo)

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.79 | Framework mobile |
| Expo | SDK 55 | Build e dev tools |
| Expo Router | 5.x | Navegação file-based |
| TypeScript | 5.x | Tipagem estática |
| Axios | 1.x | Requisições HTTP |
| expo-secure-store | 14.x | Armazenamento seguro do token JWT |
| react-native-svg | 15.x | Ícones vetoriais customizados |
| react-native-safe-area-context | 4.x | Safe area em diferentes dispositivos |

## Objetivo

O app mobile é o principal canal de interação do usuário com a plataforma Care Plus. Ele consome a API REST do backend e oferece uma experiência fluida com animações nativas, ícones SVG customizados e o mascote da marca presente em toda a jornada do usuário.

## Estrutura de Pastas

```
duocare-app/
├── app/
│   ├── _layout.tsx              ← Layout raiz com AuthProvider
│   ├── index.tsx                ← Redirect inicial (login ou tabs)
│   ├── (auth)/
│   │   ├── _layout.tsx          ← Layout das telas de autenticação
│   │   ├── login.tsx            ← Tela de login com mascote animado
│   │   └── register.tsx         ← Tela de cadastro com validação em tempo real
│   └── (tabs)/
│       ├── _layout.tsx          ← Bottom tabs com ícones SVG
│       ├── desafios.tsx         ← Listar, iniciar e atualizar desafios
│       ├── feed.tsx             ← Feed social com posts, curtidas e comentários
│       ├── liga.tsx             ← Liga atual, progresso e ranking
│       ├── conexoes.tsx         ← Gerenciar conexões e buscar usuários
│       └── perfil.tsx           ← Perfil do usuário com estatísticas
├── src/
│   ├── services/
│   │   ├── api.ts               ← Axios configurado com interceptor de token
│   │   ├── authService.ts       ← Login e cadastro
│   │   ├── desafioService.ts    ← CRUD de desafios e progresso
│   │   ├── postService.ts       ← Feed, curtidas e comentários
│   │   ├── ligaService.ts       ← Liga do usuário e ranking
│   │   └── conexaoService.ts    ← Conexões e busca de usuários
│   ├── contexts/
│   │   └── AuthContext.tsx      ← Contexto global de autenticação
│   ├── components/
│   │   └── icons/
│   │       └── CarePlusIcons.tsx ← Biblioteca de ícones SVG flat minimalistas
│   └── theme/
│       └── colors.ts            ← Paleta de cores da marca
├── assets/
│   ├── mascote.png              ← Mascote 3D do Care Plus
│   └── ...
├── app.json                     ← Configuração Expo
└── package.json
```

## Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo Go instalado no celular **ou** Android Emulator configurado

### Instalação

```bash
# Entre na pasta do app
cd duocare-app

# Instale as dependências
npx expo install expo-router expo-status-bar react-native-safe-area-context react-native-screens expo-secure-store react-native-svg

npm install axios --legacy-peer-deps
```

### Configuração da API

Edite o arquivo `src/services/api.ts` e ajuste a URL base:

```typescript
// Emulador Android
const API_URL = 'http://10.0.2.2:8080';

// Dispositivo físico (substitua pelo IP da sua máquina)
const API_URL = 'http://192.168.1.XXX:8080';

// iOS Simulator
const API_URL = 'http://localhost:8080';
```

> Para descobrir seu IP local no Windows: `ipconfig` → procure "Endereço IPv4"

### Executando

```bash
# Inicie o servidor de desenvolvimento
npx expo start --clear

# Opções após iniciar:
# Pressione [a] → abre no emulador Android
# Pressione [i] → abre no simulador iOS
# Escaneie o QR Code → abre no Expo Go do celular
```

## Funcionalidades por Tela

### 🔐 Login / Cadastro
- Mascote animado flutuando na tela de login
- Validação em tempo real dos campos no cadastro (indicador de progresso 4/4)
- Animação de shake no formulário quando há erro de credencial
- Token JWT salvo de forma segura com `expo-secure-store`

### 🏃 Desafios
- Duas abas: **Meus desafios** e **Disponíveis**
- Cards com barra de progresso animada (amarelo → verde conforme avança)
- Modal para atualizar progresso com teclado numérico
- Alerta de conclusão ao atingir 100% da meta com pontos ganhos
- Empty state com mascote flutuando

### 📱 Feed Social
- Abas **Global** (todos os posts) e **Conexões** (só quem você segue)
- Curtir com feedback visual instantâneo (coração preenchido/vazio)
- Modal de comentários com envio em tempo real
- Botão de deletar post próprio com confirmação

### 🏆 Liga & Ranking
- Card da liga atual com mascote flutuando e barra de progresso animada
- Pódio animado com spring animation para o top 3
- Lista completa do ranking com posição destacada do usuário logado
- Grid com todas as ligas e seus ícones SVG únicos

### 🤝 Conexões
- Três abas: **Minhas**, **Pendentes** e **Buscar**
- Campo de busca com ícone integrado
- Aceitar/recusar solicitações com loading individual por botão
- Badge no header indicando número de solicitações pendentes

### 👤 Perfil
- Mascote flutuando no topo da tela
- Estatísticas em cards com spring animation
- Modal para editar nome e bio
- Barra de progresso para a próxima liga
- Logout com confirmação

---

# ☕ Backend — Java Spring Boot

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Java | 21 | Linguagem |
| Spring Boot | 4.0.3 | Framework principal |
| Spring Security | 7.x | Autenticação e autorização |
| Spring Data JPA | 7.x | Persistência e ORM |
| Hibernate | 7.2 | Implementação JPA |
| Oracle JDBC | ojdbc11 | Driver do banco de dados |
| JWT (jjwt) | 0.12.5 | Geração e validação de tokens |
| Lombok | 1.18.x | Redução de boilerplate |
| Springdoc OpenAPI | 2.8.6 | Documentação Swagger UI |

## Objetivo

API REST stateless que serve de backend para o app mobile. Gerencia autenticação JWT, desafios com sistema de pontuação automático, feed social, conexões entre usuários e o sistema de ligas.

## Estrutura de Pastas

```
careplus-api/
├── src/main/java/com/br/careplus/
│   ├── CareplusApplication.java         ← Classe principal (@SpringBootApplication)
│   ├── api/
│   │   ├── controller/
│   │   │   ├── AuthController.java      ← POST /api/auth/login, /register
│   │   │   ├── DesafioController.java   ← GET/POST /api/desafios
│   │   │   ├── PostController.java      ← GET/POST /api/posts
│   │   │   ├── ConexaoController.java   ← GET/POST /api/conexoes
│   │   │   ├── LigaController.java      ← GET /api/liga
│   │   │   └── UserController.java      ← GET/PUT /api/users/me
│   │   ├── dto/
│   │   │   ├── auth/                    ← LoginRequest, LoginResponse, RegisterRequest
│   │   │   ├── user/                    ← UserResponse
│   │   │   ├── desafio/                 ← DesafioResponse, UserDesafioResponse, ProgressoRequest
│   │   │   ├── post/                    ← PostRequest, PostResponse, ComentarioRequest/Response
│   │   │   └── liga/                    ← LigaResponse, RankingItemResponse
│   │   └── exception/
│   │       ├── GlobalExceptionHandler.java ← @ControllerAdvice com respostas padronizadas
│   │       └── ApiError.java            ← DTO de erro padrão
│   ├── config/
│   │   ├── SwaggerConfig.java           ← Configuração OpenAPI + esquema JWT
│   │   └── SpringdocConfig.java         ← Desabilita módulos HATEOAS desnecessários
│   ├── domain/
│   │   ├── model/
│   │   │   ├── User.java                ← Entidade usuário (implementa UserDetails)
│   │   │   ├── Desafio.java             ← Entidade desafio
│   │   │   ├── UserDesafio.java         ← Progresso do usuário no desafio
│   │   │   ├── CategoriaDesafio.java    ← Categoria (CORRIDA, HIDRATACAO...)
│   │   │   ├── Conexao.java             ← Conexão entre usuários
│   │   │   ├── Post.java                ← Post do feed social
│   │   │   ├── Curtida.java             ← Curtida em post
│   │   │   ├── Comentario.java          ← Comentário em post
│   │   │   ├── HistoricoPontos.java     ← Log de pontos ganhos/perdidos
│   │   │   └── Liga.java                ← Configuração das ligas
│   │   ├── repository/                  ← Interfaces JpaRepository + queries JPQL
│   │   └── service/
│   │       ├── AuthService.java         ← Lógica de login e registro
│   │       ├── DesafioService.java      ← Iniciar, atualizar progresso, concluir
│   │       ├── PostService.java         ← Feed, curtir, comentar
│   │       ├── ConexaoService.java      ← Solicitar, aceitar, recusar
│   │       ├── LigaService.java         ← Calcular liga e ranking
│   │       └── PontosService.java       ← Adicionar pontos + histórico
│   └── security/
│       ├── JwtService.java              ← Gerar e validar tokens JWT
│       ├── JwtAuthFilter.java           ← Filtro que intercepta requisições
│       ├── SecurityConfig.java          ← Configuração Spring Security + CORS
│       └── UserDetailsServiceConfig.java ← Carrega usuário pelo e-mail
└── src/main/resources/
    └── application.properties           ← Conexão Oracle, JWT secret, Springdoc
```

## Como Executar

### Pré-requisitos

- Java 21+
- Maven 3.9+
- Oracle Database (FIAP: `oracle.fiap.com.br:1521/orcl`)

### Configuração

Edite `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:oracle:thin:@oracle.fiap.com.br:1521/orcl
spring.datasource.username=SEU_RM (LOGIN ENVIADO VIA TEAMS)
spring.datasource.password=SUA_SENHA (SENHA ENVIADA VIA TEAMS)
```

### Executando

```bash
# Acesse a pasta do backend
cd api/careplus/careplus

# Execute com Maven
mvn spring-boot:run
```

A API estará disponível em: `http://localhost:8080`

### Swagger UI

```
http://localhost:8080/swagger-ui/index.html
```

> No Swagger, clique em **Authorize** 🔒, cole o token retornado pelo login e todos os endpoints protegidos passarão a funcionar.

---

## Endpoints e Exemplos

### 🔐 Autenticação

#### Cadastrar usuário
```http
POST /api/auth/register
Content-Type: application/json
```
```json
// Request
{
  "nome": "Rafael Almeida",
  "email": "rafael@email.com",
  "senha": "senha123"
}

// Response 201
{
  "id": 1,
  "nome": "Rafael Almeida",
  "email": "rafael@email.com",
  "fotoUrl": null,
  "bio": null,
  "pontos": 0,
  "criadoEm": "2024-11-15T10:30:00"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json
```
```json
// Request
{
  "email": "rafael@email.com",
  "senha": "senha123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "nome": "Rafael Almeida",
  "pontos": 0
}
```

---

### 🏃 Desafios

#### Listar desafios disponíveis
```http
GET /api/desafios
Authorization: Bearer {token}
```
```json
// Response 200
[
  {
    "id": 1,
    "titulo": "Corrida de 5km",
    "descricao": "Complete 5km correndo hoje",
    "metaValor": 5.0,
    "metaUnidade": "km",
    "pontosRecompensa": 100,
    "duracaoDias": 1,
    "nivel": "MEDIO",
    "categoriaNome": "CORRIDA"
  }
]
```

#### Iniciar desafio
```http
POST /api/desafios/1/iniciar
Authorization: Bearer {token}
```
```json
// Response 200
{
  "id": 1,
  "desafioId": 1,
  "tituloDesafio": "Corrida de 5km",
  "metaValor": 5.0,
  "metaUnidade": "km",
  "progressoAtual": 0.0,
  "percentual": 0.0,
  "status": "EM_ANDAMENTO",
  "pontosGanhos": 0,
  "iniciadoEm": "2024-11-15T10:35:00",
  "concluidoEm": null
}
```

#### Atualizar progresso (conclui automaticamente ao atingir a meta)
```http
PATCH /api/desafios/progresso/1
Authorization: Bearer {token}
Content-Type: application/json
```
```json
// Request
{ "valor": 5.0 }

// Response 200 — desafio concluído
{
  "id": 1,
  "tituloDesafio": "Corrida de 5km",
  "progressoAtual": 5.0,
  "percentual": 100.0,
  "status": "CONCLUIDO",
  "pontosGanhos": 100,
  "concluidoEm": "2024-11-15T11:00:00"
}
```

---

### 📱 Feed Social

#### Criar post
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json
```
```json
// Request
{
  "conteudo": "Acabei de completar minha corrida de 5km! Muito satisfeito com o progresso.",
  "desafioRefId": 1
}

// Response 200
{
  "id": 1,
  "userId": 1,
  "nomeUsuario": "Rafael Almeida",
  "conteudo": "Acabei de completar minha corrida de 5km!",
  "totalCurtidas": 0,
  "totalComentarios": 0,
  "curtidoPorMim": false,
  "criadoEm": "2024-11-15T11:05:00"
}
```

#### Curtir / Descurtir post
```http
POST /api/posts/1/curtir
Authorization: Bearer {token}
```
```json
// Response 200 — após curtir
{
  "id": 1,
  "totalCurtidas": 1,
  "curtidoPorMim": true
}
```

#### Comentar em post
```http
POST /api/posts/1/comentarios
Authorization: Bearer {token}
Content-Type: application/json
```
```json
// Request
{ "conteudo": "Parabéns! Continue assim!" }

// Response 200
{
  "id": 1,
  "userId": 2,
  "nomeUsuario": "Maria Silva",
  "conteudo": "Parabéns! Continue assim!",
  "criadoEm": "2024-11-15T11:10:00"
}
```

---

### 🤝 Conexões

#### Buscar usuários por nome
```http
GET /api/conexoes/buscar?nome=Maria
Authorization: Bearer {token}
```
```json
// Response 200
[
  {
    "id": 2,
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "pontos": 250,
    "bio": "Apaixonada por corrida!"
  }
]
```

#### Enviar solicitação
```http
POST /api/conexoes/2
Authorization: Bearer {token}
```
```json
// Response 200
{
  "id": 1,
  "userId": 2,
  "nome": "Maria Silva",
  "status": "PENDENTE",
  "criadoEm": "2024-11-15T11:15:00"
}
```

#### Aceitar solicitação
```http
PATCH /api/conexoes/1/aceitar
Authorization: Bearer {token}
```
```json
// Response 200
{
  "id": 1,
  "nome": "Rafael Almeida",
  "status": "ACEITO"
}
```

---

### 🏆 Liga & Ranking

#### Minha liga atual
```http
GET /api/liga/minha
Authorization: Bearer {token}
```
```json
// Response 200
{
  "ligaNome": "Prata",
  "ligaCor": "#C0C0C0",
  "pontos": 1250,
  "pontosMinimo": 1000,
  "pontosMaximo": 2999,
  "pontosParaProxima": 1750
}
```

#### Ranking global
```http
GET /api/liga/ranking?limite=10
Authorization: Bearer {token}
```
```json
// Response 200
[
  {
    "posicao": 1,
    "userId": 5,
    "nome": "João Pedro",
    "pontos": 8500,
    "ligaNome": "Platina",
    "ligaCor": "#E5E4E2"
  },
  {
    "posicao": 2,
    "userId": 1,
    "nome": "Rafael Almeida",
    "pontos": 1250,
    "ligaNome": "Prata",
    "ligaCor": "#C0C0C0"
  }
]
```

---

### ❌ Respostas de Erro

Todos os erros seguem o formato padrão do `GlobalExceptionHandler`:

```json
// 400 Bad Request
{
  "status": 400,
  "erro": "Requisição inválida",
  "mensagem": "E-mail já cadastrado.",
  "timestamp": "2024-11-15T11:20:00"
}

// 401 Unauthorized
{
  "status": 401,
  "erro": "Não autorizado",
  "mensagem": "E-mail ou senha incorretos.",
  "timestamp": "2024-11-15T11:20:00"
}

// 409 Conflict
{
  "status": 409,
  "erro": "Conflito",
  "mensagem": "Desafio já iniciado.",
  "timestamp": "2024-11-15T11:20:00"
}
```

---

## Script SQL — Banco de Dados Oracle

Para criar as tabelas execute o script `careplus_oracle_schema.sql` no SQL Developer ou via terminal:

```sql
-- Principais tabelas criadas:
-- CP_USERS, CP_LIGAS, CP_CATEGORIAS_DESAFIO, CP_DESAFIOS
-- CP_USER_DESAFIOS, CP_CONEXOES, CP_POSTS, CP_CURTIDAS
-- CP_COMENTARIOS, CP_HISTORICO_PONTOS

-- Seeds já incluídos no script:
-- 6 ligas: Bronze, Prata, Ouro, Platina, Diamante, Safira
-- 4 categorias: CORRIDA, HIDRATACAO, MEDITACAO, NUTRICAO
```

---

## Testando com Postman

Importe o arquivo `careplus_postman_collection.json` no Postman:

1. Abra o Postman → **Import** → selecione o arquivo
2. Execute **Register** para criar um usuário
3. Execute **Login** — o token é salvo automaticamente na variável `{{token}}`
4. Todos os outros endpoints já usam `{{token}}` nos headers automaticamente

---

## Integrantes

| Nome | RM |
|---|---|
| Rafael Almeida | RM554019 |

---

<p align="center">
  Desenvolvido com ❤️ para a Care Plus — FIAP 2024
</p>
