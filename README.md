<p align="center">
  <img src="app\duocare-app\assets\mascote.png" width="120" alt="Care Plus Mascote"/>
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

## Integrantes

| Nome | RM |
|---|---|
| Rafael Almeida | RM554019 |
| Giovanna Franco | RM553701 |
| Rafael Jorge | RM552765 |

---

# 🧪 Testes — Sprint 4

## Parte A — Testes Manuais (Azure Boards)

Testes manuais de validação em nível de sistema cadastrados no Azure Boards, cobrindo as funcionalidades principais:

| ID | Funcionalidade |
|---|---|
| CT01 | Cadastro de usuário com dados válidos |
| CT02 | Login com credenciais válidas |
| CT03 | Iniciar desafio disponível |
| CT04 | Atualizar progresso de desafio até conclusão |
| CT05 | Criar post no feed social |
| CT06 | Enviar solicitação de conexão entre usuários |

🔗 **Azure Boards:** https://dev.azure.com/DuoCare/Duo%20Care%20-%20Care%20plus

---

## Parte B — Testes Automatizados (Postman)

Collection disponível em `tests/DuoCare - Sprint 4.postman_collection.json`.

| ID | Teste | Endpoint | Resultado Esperado |
|---|---|---|---|
| AT01 | Cadastro de usuário | POST /api/auth/register | 201 Created |
| AT02 | Login com credenciais válidas | POST /api/auth/login | 200 OK + Token JWT |
| AT03 | Iniciar desafio | POST /api/desafios/{id}/iniciar | 200 OK + EM_ANDAMENTO |
| AT04 | Atualizar progresso até conclusão | PATCH /api/desafios/progresso/{id} | 200 OK + CONCLUIDO |

### Como executar

1. Importe `tests/DuoCare - Sprint 4.postman_collection.json` no Postman
2. Crie um environment `DuoCare Local` com a variável `token`
3. Com a API rodando, execute pelo **Collection Runner**

🎥 **Vídeo de demonstração:** https://youtu.be/-BZ7jd7tnB0

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
├── api/careplus/careplus   ← Backend Java Spring Boot
├── app/duocare-app         ← Frontend React Native (Expo)
└── tests/                  ← Testes automatizados (Postman Collection)
```

---

# Como executar

1. Clone o repositorio

```
git clone https://github.com/RafaelDevProjects/DuoCare.git
```

2. Executar o Backend (API) para depois inicializar o app Mobile.

### Pré-requisitos

- Java 21+
- Maven 3.9+
- Oracle Database (FIAP: `oracle.fiap.com.br:1521/orcl`)
- Node.js 18+
- npm ou yarn
- Expo Go instalado no celular **ou** Android Emulator configurado

### Configuração

Edite `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:oracle:thin:@oracle.fiap.com.br:1521/orcl
spring.datasource.username=SEU_RM
spring.datasource.password=SUA_SENHA

careplus.jwt.secret=SuaChaveSecretaComMinimode32Caracteres
careplus.jwt.expiration-ms=86400000
```

## Executando API

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

## Executando Mobile

```bash
# Entre na pasta do app
cd app/duocare-app

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npx expo start --clear
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

---

<p align="center">
  Desenvolvido com ❤️ para a Care Plus — FIAP 2024
</p>
