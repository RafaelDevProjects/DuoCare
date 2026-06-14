<p align="center">
  <img src="app/duocare-app/assets/mascote.png" width="120" alt="DuoCare Mascote"/>
</p>

<h1 align="center">DuoCare</h1>

<p align="center">
  Plataforma de saúde e bem-estar com desafios, rede social e sistema de ligas
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo-blue?logo=expo" />
  <img src="https://img.shields.io/badge/Backend-Spring_Boot_4-green?logo=springboot" />
  <img src="https://img.shields.io/badge/Database-Oracle-red?logo=oracle" />
  <img src="https://img.shields.io/badge/Auth-JWT-yellow" />
  <img src="https://img.shields.io/badge/WebSocket-STOMP-purple" />
</p>

## 👥 Integrantes

| Nome | RM |
|---|---|
| Rafael Almeida | RM554019 |
| Giovanna Franco | RM553701 |
| Rafael Jorge | RM552765 |

---

## Sobre o Projeto

O **DuoCare** é um aplicativo desenvolvido para a empresa de convênios médicos Care Plus, com o objetivo de melhorar a saúde física e mental dos clientes através de:

- **Desafios** de corrida, hidratação, meditação e nutrição com sistema de pontuação
- **Rede social** interna para compartilhar conquistas e interagir com outros usuários
- **Sistema de ligas** (Bronze → Prata → Ouro → Platina → Diamante → Safira) baseado em pontos acumulados
- **Ranking** global com pódio animado
- **Conexões** entre usuários para criar uma comunidade engajada
- **Notificações em tempo real** via WebSocket (STOMP)

---

## Estrutura do Repositório

```
careplus/
├── api/careplus/careplus   ← Backend Java Spring Boot
└── app/duocare-app         ← Frontend React Native (Expo)
```

---

## Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/RafaelDevProjects/DuoCare/tree/sprint_4
```

### 2. Execute o Backend (API) antes de iniciar o app mobile

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Java | 21+ |
| Maven | 3.9+ |
| Oracle Database | FIAP: `oracle.fiap.com.br:1521/orcl` |
| Node.js | 18+ |
| npm ou yarn | — |
| Expo Go (celular) **ou** Android Emulator | — |

---

## ☕ Backend — Java Spring Boot

### Tecnologias

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
| Spring WebSocket | 7.x | Suporte a STOMP |

### Configuração

Edite `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:oracle:thin:@oracle.fiap.com.br:1521/orcl
spring.datasource.username=SEU_RM
spring.datasource.password=SUA_SENHA
```

### Executando a API

```bash
# Acesse a pasta do backend
cd api/careplus/careplus

# Execute com Maven
mvn spring-boot:run
```

A API estará disponível em: `http://localhost:8080`

**Swagger UI:** `http://localhost:8080/swagger-ui/index.html`

> No Swagger, clique em **Authorize 🔒**, cole o token retornado pelo login e todos os endpoints protegidos passarão a funcionar.

### Estrutura de Pastas

```
careplus-api/
├── src/main/java/com/br/careplus/
│   ├── CareplusApplication.java              ← Classe principal (@SpringBootApplication)
│   ├── api/
│   │   ├── controller/
│   │   │   ├── AuthController.java           ← POST /api/auth/login, /register
│   │   │   ├── DesafioController.java        ← GET/POST /api/desafios
│   │   │   ├── PostController.java           ← GET/POST /api/posts
│   │   │   ├── ConexaoController.java        ← GET/POST /api/conexoes
│   │   │   ├── LigaController.java           ← GET /api/liga
│   │   │   └── UserController.java           ← GET/PUT /api/users/me
│   │   ├── dto/
│   │   │   ├── auth/                         ← LoginRequest, LoginResponse, RegisterRequest
│   │   │   ├── user/                         ← UserResponse, UserProfileResponse
│   │   │   ├── desafio/                      ← DesafioResponse, UserDesafioResponse
│   │   │   ├── post/                         ← PostRequest, PostResponse, ComentarioRequest/Response
│   │   │   ├── liga/                         ← LigaResponse, RankingItemResponse
│   │   │   └── notification/                 ← NotificationDTO (payload WebSocket)
│   │   └── exception/
│   │       ├── GlobalExceptionHandler.java   ← @ControllerAdvice com respostas padronizadas
│   │       └── ApiError.java                 ← DTO de erro padrão
│   ├── config/
│   │   ├── SwaggerConfig.java                ← Configuração OpenAPI + esquema JWT
│   │   ├── SpringdocConfig.java              ← Desabilita módulos HATEOAS desnecessários
│   │   └── WebSocketConfig.java              ← Configuração STOMP (endpoint /ws, broker /topic)
│   ├── domain/
│   │   ├── model/
│   │   │   ├── User.java                     ← Entidade usuário (implementa UserDetails)
│   │   │   ├── Desafio.java                  ← Entidade desafio (inclui campo dicas)
│   │   │   ├── UserDesafio.java              ← Progresso do usuário no desafio
│   │   │   ├── CategoriaDesafio.java         ← Categoria (CORRIDA, HIDRATACAO...)
│   │   │   ├── Conexao.java                  ← Conexão entre usuários
│   │   │   ├── Post.java                     ← Post do feed social
│   │   │   ├── Curtida.java                  ← Curtida em post
│   │   │   ├── Comentario.java               ← Comentário em post
│   │   │   ├── HistoricoPontos.java          ← Log de pontos ganhos/perdidos
│   │   │   └── Liga.java                     ← Configuração das ligas
│   │   ├── repository/                       ← Interfaces JpaRepository + queries JPQL
│   │   └── service/
│   │       ├── AuthService.java              ← Lógica de login e registro
│   │       ├── DesafioService.java           ← Iniciar, atualizar progresso, concluir (com WebSocket)
│   │       ├── PostService.java              ← Feed, curtir, comentar (com WebSocket)
│   │       ├── ConexaoService.java           ← Solicitar, aceitar, recusar (com WebSocket)
│   │       ├── LigaService.java              ← Calcular liga e ranking
│   │       ├── PontosService.java            ← Adicionar pontos + histórico
│   │       └── NotificationService.java      ← Envio de mensagens STOMP para os tópicos
│   └── security/
│       ├── JwtService.java                   ← Gerar e validar tokens JWT
│       ├── JwtAuthFilter.java                ← Filtro que intercepta requisições
│       ├── SecurityConfig.java               ← Configuração Spring Security + CORS
│       └── UserDetailsServiceConfig.java     ← Carrega usuário pelo e-mail
└── src/main/resources/
    └── application.properties                ← Conexão Oracle, JWT secret, Springdoc
```

---

## 📱 Mobile — React Native (Expo)

### Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.83 | Framework mobile |
| Expo | SDK 55 | Build e dev tools |
| Expo Router | 5.x | Navegação file-based |
| TypeScript | 5.x | Tipagem estática |
| Axios | 1.x | Requisições HTTP |
| @stomp/stompjs | 7.x | Cliente WebSocket STOMP |
| expo-secure-store | 14.x | Armazenamento seguro do token JWT |
| react-native-svg | 15.x | Ícones vetoriais customizados |

### Executando o App Mobile

```bash
# Entre na pasta do app
cd app/duocare-app

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npx expo start --clear
```

Após iniciar:
- Pressione `a` → abre no emulador Android
- Pressione `i` → abre no simulador iOS

### Estrutura de Pastas

```
duocare-app/
├── app/
│   ├── _layout.tsx              ← Layout raiz com AuthProvider e SocketProvider
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
│   │   ├── AuthContext.tsx      ← Contexto global de autenticação
│   │   └── SocketContext.tsx    ← Contexto WebSocket STOMP (useSubscription)
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

### Funcionalidades por Tela

#### 🔐 Login / Cadastro
- Mascote animado flutuando na tela de login
- Validação em tempo real dos campos no cadastro (indicador de progresso 4/4)
- Animação de shake no formulário quando há erro de credencial
- Token JWT salvo de forma segura com `expo-secure-store`

#### 🏃 Desafios
- Duas abas: **Meus desafios** e **Disponíveis**
- Cards com barra de progresso animada (amarelo → verde conforme avança)
- Modal para atualizar progresso com teclado numérico
- Alerta de conclusão ao atingir 100% da meta com pontos ganhos
- Empty state com mascote flutuando

#### 📱 Feed Social
- Feed global e feed de conexões (paginado)
- Curtir com feedback visual instantâneo (coração preenchido/vazio)
- Modal de comentários com envio em tempo real
- Botão de deletar post próprio com confirmação

#### 🏆 Liga & Ranking
- Card da liga atual com mascote flutuando e barra de progresso animada
- Pódio animado com spring animation para o top 3
- Lista completa do ranking com posição destacada do usuário logado
- Grid com todas as ligas e seus ícones SVG únicos

#### 🤝 Conexões
- Três abas: **Minhas**, **Pendentes** e **Buscar**
- Campo de busca com ícone integrado
- Aceitar/recusar solicitações com loading individual por botão
- Badge no header indicando número de solicitações pendentes

#### 👤 Perfil
- Mascote flutuando no topo da tela
- Estatísticas em cards com spring animation
- Modal para editar nome e bio
- Barra de progresso para a próxima liga
- Logout com confirmação

---

## 🔔 WebSocket — Notificações em Tempo Real

O backend expõe um broker STOMP sobre WebSocket na URL `ws://localhost:8080/ws`. O cliente deve conectar enviando o token JWT no header `Authorization: Bearer {token}`.

### Tópicos disponíveis

| Tópico | Descrição | Tipos de evento |
|---|---|---|
| `/topic/feed/{userId}` | Novo post de uma conexão ou comentário no seu post | `NOVO_POST`, `NOVO_COMENTARIO` |
| `/topic/conexoes/{userId}` | Nova solicitação de conexão ou aceitação | `NOVA_SOLICITACAO`, `CONEXAO_ACEITA` |
| `/topic/desafios/{userId}` | Desafio concluído (pontos adicionados) | `DESAFIO_CONCLUIDO` |

### Exemplo de payload (conexão aceita)

```json
{
  "tipo": "CONEXAO_ACEITA",
  "mensagem": "Maria Silva aceitou sua solicitação de conexão!",
  "dados": { "id": 5, "nome": "Maria Silva", "status": "ACEITO" },
  "timestamp": 1731685200000
}
```

---

## 📡 Endpoints da API

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
    "dicas": "Mantenha um ritmo confortável",
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
POST /api/desafios/{id}/iniciar
Authorization: Bearer {token}
```

```json
// Response 200
{
  "id": 1,
  "desafioId": 1,
  "tituloDesafio": "Corrida de 5km",
  "descricao": "Complete 5km correndo hoje",
  "dicas": "Mantenha um ritmo confortável",
  "metaValor": 5.0,
  "metaUnidade": "km",
  "progressoAtual": 0.0,
  "percentual": 0.0,
  "status": "EM_ANDAMENTO",
  "pontosGanhos": 0,
  "pontosRecompensa": 100,
  "iniciadoEm": "2024-11-15T10:35:00",
  "prazoFinal": "2024-11-16T10:35:00",
  "nivel": "MEDIO",
  "categoriaNome": "CORRIDA"
}
```

#### Atualizar progresso

Conclui automaticamente ao atingir a meta.

```http
PATCH /api/desafios/progresso/{id}
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
POST /api/posts/{id}/curtir
Authorization: Bearer {token}
```

```json
// Response 200
{
  "id": 1,
  "totalCurtidas": 1,
  "curtidoPorMim": true
}
```

#### Comentar em post

```http
POST /api/posts/{id}/comentarios
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
POST /api/conexoes/{receptorId}
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
PATCH /api/conexoes/{id}/aceitar
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

#### Cancelar solicitação enviada

```http
DELETE /api/conexoes/{receptorId}/cancelar
Authorization: Bearer {token}
```

`Response 204 No Content`

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

### 👤 Usuário

#### Obter perfil autenticado

```http
GET /api/users/me
Authorization: Bearer {token}
```

```json
// Response 200
{
  "id": 1,
  "nome": "Rafael Almeida",
  "email": "rafael@email.com",
  "fotoUrl": null,
  "bio": "Apaixonado por saúde",
  "pontos": 1250,
  "criadoEm": "2024-11-15T10:30:00"
}
```

#### Atualizar perfil

```http
PUT /api/users/me?nome=Rafael+Sigoli&bio=Novo+bio
Authorization: Bearer {token}
```

`Response 200` com o objeto `UserResponse` atualizado.

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

## 🗄️ Banco de Dados — Oracle

Execute o script `careplus_oracle_schema.sql` no SQL Developer ou via terminal para criar as tabelas:

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

## 🧪 Testando com Postman

Importe o arquivo `careplus_postman_collection.json` no Postman:

1. Abra o Postman → **Import** → selecione o arquivo
2. Execute **Register** para criar um usuário
3. Execute **Login** — o token é salvo automaticamente na variável `{{token}}`
4. Todos os outros endpoints já usam `{{token}}` nos headers automaticamente

---


<p align="center">Desenvolvido com ❤️ para o DuoCare — FIAP 2026</p>
