<p align="center">
  <img src="app\duocare-app\assets\mascote.png" width="120" alt="Care Plus Mascote"/>
</p>

<h1 align="center">Care Plus — DuoCare</h1>
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
## Sobre o Projeto

Aplicativo desenvolvido para a Care Plus com foco em bem-estar e saúde preventiva. Composto por uma API REST em Java Spring Boot e um app mobile em React Native (Expo), com autenticação JWT e banco Oracle.

---

## Como executar a API

```bash
# Acesse a pasta do backend
cd api/careplus/careplus

# Configure suas credenciais em src/main/resources/application.properties
spring.datasource.username=SEU_RM
spring.datasource.password=SUA_SENHA

# Execute
mvn spring-boot:run
```

API disponível em `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui/index.html`

---

# Testes — 

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
