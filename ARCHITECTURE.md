# Arquitetura de Sistema Multiagente – calculadora-alavanca

Se a sua IA interna é para o VS Code ou para o seu próprio SaaS, você pode implementar essa "inteligência em camadas" sem precisar treinar um modelo do zero.

## Arquitetura recomendada

```
Usuário
   ↓
Orquestrador
   ↓
─────────────────────────
│ Agente de Entendimento │
─────────────────────────
   ↓
─────────────────────
│ Agente Investigador │
─────────────────────
   ↓
───────────────────
│ Agente Planejador │
───────────────────
   ↓
─────────────────
│ Agente Executor │
─────────────────
   ↓
────────────────
│ Agente Revisor │
────────────────
   ↓
Resposta Final
```

---

## 1. Orquestrador

Ele coordena tudo.

```typescript
interface TaskContext {
  prompt: string;
  files: string[];
  projectTree: string;
  memory: Record<string, unknown>;
}
```

---

## 2. Agente de Entendimento

Exemplo:

```typescript
async function understand(context: TaskContext) {
  return {
    objective: "Corrigir erro de build",
    technologies: [
      "Next.js",
      "TypeScript",
      "Supabase"
    ],
    probableCauses: [
      "Import duplicado",
      "Cache",
      "Arquivos duplicados"
    ]
  };
}
```

---

## 3. Investigador

Lê o projeto inteiro.

```typescript
import fs from "fs";
import path from "path";

function scan(dir: string): string[] {
  const result: string[] = [];

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);

    if (fs.statSync(full).isDirectory()) {
      result.push(...scan(full));
    } else {
      result.push(full);
    }
  }

  return result;
}
```

---

## 4. Memória do Projeto

Salve informações importantes.

```json
{
  "projectType": "saas",
  "framework": "nextjs",
  "database": "supabase",
  "router": "app-router",
  "port": 3001
}
```

---

## 5. Planejador

```typescript
async function plan(problem: string) {
  return [
    "Ler package.json",
    "Ler route.ts",
    "Procurar imports duplicados",
    "Verificar cache",
    "Executar build"
  ];
}
```

---

## 6. Executor

```typescript
async function execute(plan: string[]) {
  for (const step of plan) {
    console.log(`Executando: ${step}`);
  }
}
```

---

## 7. Revisor

```typescript
function review(answer: string) {
  return {
    confidence: 0.85,
    risks: [],
    response: answer
  };
}
```

---

## Como fazer a IA "pensar"

Em vez de:

```
Usuário → Modelo → Resposta
```

Faça:

```
Usuário
 ↓
Entender
 ↓
Ler Projeto
 ↓
Criar Hipóteses
 ↓
Executar Verificações
 ↓
Revisar
 ↓
Responder
```

---

## Prompt do Orquestrador

```
Você é um sistema multiagente de desenvolvimento.

Regras:
1. Nunca responda imediatamente.
2. Leia o contexto completo.
3. Analise todos os arquivos relacionados.
4. Gere hipóteses.
5. Monte um plano.
6. Execute verificações.
7. Revise sua conclusão.
8. Só então produza a resposta final.
9. Se a confiança for menor que 80%, peça mais informações.
```

---

## Para ficar ainda mais inteligente

### Índice de código (RAG)

- Funções
- Classes
- Rotas
- Imports
- Dependências
- Banco de dados
- Variáveis de ambiente

---

### Ferramentas

```typescript
readFile()
searchCode()
listFiles()
runTests()
runBuild()
```

---

### Memória

```
Projeto: SaaS
Stack: Next.js + Supabase
Porta: 3001
Padrão: App Router
```

---

### Autoavaliação

```json
{
  "confidence": 0.92,
  "evidence": [
    "route.ts analisado",
    "package.json analisado",
    "build executado"
  ]
}
```

---

## Implementação para o calculadora-alavanca

Para um SaaS em Next.js e Supabase, a arquitetura seria:

```
VS Code
      ↓
Extensão própria
      ↓
Orquestrador
      ↓
RAG do projeto
      ↓
Agentes especializados
      ↓
Modelo de IA
      ↓
Ações automáticas no código
```

---

## Stack atual do projeto

- **Framework**: Next.js 16 (App Router)
- **React**: 19
- **TypeScript**: Strict
- **Database**: Supabase (planejado)
- **Port**: 3002 (desenvolvimento), 3000 (padrão)
- **Padrão**: App Router

---

## Próximos passos

1. Implementar Orquestrador em `lib/orchestrator.ts`
2. Criar agentes em `lib/agents/`
3. Configurar memória do projeto em `.project-memory.json`
4. Integrar com a IA existente
5. Validar confiança antes de cada resposta
