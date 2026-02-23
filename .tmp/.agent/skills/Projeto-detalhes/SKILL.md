# SKILL: Sistema MTR - Plataforma Integrada (Nuxt 4)

---

## 1. VISÃO GERAL

O Sistema MTR será uma plataforma integrada composta por:

- Sistema Web Administrativo
- Automação IA para gestores

O objetivo do sistema é eliminar controles em planilhas,
automatizar consultas no SINIR e centralizar todas as informações
relacionadas aos manifestos de forma organizada e segura.

---

## 2. OBJETIVO DO SISTEMA

O sistema deve permitir:

- Cadastros padronizados
- Lançamentos rápidos de manifesto via popup
- Consulta automática no SINIR
- Lançamento de informações de acuracidade
- Upload de fotos das lagoas
- Controle básico de bombonas
- Consulta de histórico por qualquer funcionário autorizado

O foco principal é:

- Agilidade operacional
- Redução de erro humano
- Padronização
- Rastreabilidade
- Automação

---

## 3. STACK TECNOLÓGICA OFICIAL

Framework principal: Nuxt 4  
Linguagem obrigatória: TypeScript  
Renderização: SSR habilitado  
Estilização: TailwindCSS  

Backend interno:  
Utilizar server routes do próprio Nuxt (Nitro)

Banco de Dados:  
PostgreSQL  
UUID como chave primária  
Campos obrigatórios:
- id
- created_at
- updated_at

Storage:  
Armazenamento seguro para imagens enviadas

---

## 4. ARQUITETURA

O projeto deve utilizar apenas a estrutura padrão do Nuxt 4.

Não criar estruturas paralelas ou arquiteturas externas.

Separação obrigatória entre:

- Camada de interface (pages e layouts)
- Camada de lógica (server)
- Comunicação via API interna

Não misturar regra de negócio dentro da interface.

---

## 5. FUNCIONALIDADES OBRIGATÓRIAS

O sistema deve implementar:

- Cadastro de dados operacionais
- Tela de lançamento de manifesto
- Tela para lançamento de acuracidade
- Upload e armazenamento de fotos
- Consulta automatizada no SINIR
- Controle de bombonas
- Tela de consulta de histórico com filtros

Todas as operações devem persistir dados no banco.

---

## 6. SEGURANÇA

- Autenticação obrigatória
- Controle por perfil de usuário
- Sanitização de inputs
- Validação de dados no backend
- Registro de logs das principais ações

---

## 7. PALETA DE CORES OFICIAL

Cores obrigatórias do sistema:

Primária: #01573C  
Secundária: #01C57A  
Branco: #FFFFFF  
Preto: #000000  

Diretrizes:

- Sidebar e áreas institucionais: #01573C
- Botões principais: #01C57A
- Fundo principal: branco
- Textos: preto
- Interface minimalista e corporativa

---

## 8. DIRETRIZES DE INTERFACE

- Interface limpa
- Uso consistente das cores oficiais
- Feedback visual claro em ações
- Responsivo (mobile e desktop)
- Telas objetivas e focadas na operação

---

## 9. PADRÕES DE DADOS

Todas as tabelas devem conter:

- id (uuid)
- created_at
- updated_at

Relacionamentos devem ser explícitos.
Nenhum dado solto sem vínculo.

---

## 10. ORDEM DE EXECUÇÃO DO AGENTE

1. Configurar projeto Nuxt 4
2. Configurar banco de dados
3. Criar autenticação
4. Implementar funcionalidades
5. Implementar validações
6. Ajustar interface com paleta oficial
7. Validar fluxo completo
8. Documentar

---

## 11. CRITÉRIO DE ACEITE

O sistema só será considerado pronto quando:

- Todas as funcionalidades estiverem operacionais
- Consulta SINIR estiver automatizada
- Fotos forem armazenadas corretamente
- Sistema funcionar em mobile
- Não houver dependência de planilhas externas
