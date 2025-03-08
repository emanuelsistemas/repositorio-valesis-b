# Repositório de Arquivos - Documentação Técnica

## Visão Geral
O Repositório de Arquivos é uma aplicação web desenvolvida em React com TypeScript que permite aos usuários gerenciar arquivos através de uma estrutura hierárquica de grupos e subgrupos. A aplicação utiliza Supabase como backend para autenticação e armazenamento de dados.

## Tecnologias Utilizadas

- **Frontend:**
  - React 18.3.1
  - TypeScript
  - Tailwind CSS
  - Lucide React (ícones)
  - React Hot Toast (notificações)

- **Backend:**
  - Supabase (Backend as a Service)
  - PostgreSQL (banco de dados)

## Estrutura do Banco de Dados

### Tabelas

#### 1. groups
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. subgroups
```sql
CREATE TABLE subgroups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. files
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  subgroup_id UUID NOT NULL REFERENCES subgroups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Políticas de Segurança (RLS)

Cada tabela possui políticas de Row Level Security (RLS) que garantem que os usuários só possam acessar seus próprios dados:

#### groups
```sql
CREATE POLICY "Users can manage their own groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### subgroups
```sql
CREATE POLICY "Users can manage their own subgroups"
  ON subgroups
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### files
```sql
CREATE POLICY "Users can manage their own files"
  ON files
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Estrutura do Projeto

### Componentes Principais

#### 1. App.tsx
- Componente raiz da aplicação
- Gerencia o estado de autenticação
- Renderiza Login ou Dashboard baseado no estado de autenticação
- Configura o Toaster para notificações

#### 2. Dashboard.tsx
- Interface principal pós-login
- Gerencia grupos, subgrupos e arquivos
- Implementa operações CRUD para todas as entidades
- Monitora o estado da conexão com o Supabase
- Implementa logout automático em casos específicos

#### 3. Login.tsx
- Formulário de login
- Gerencia estado de carregamento e erros
- Interface minimalista e responsiva

#### 4. DeleteConfirmationModal.tsx
- Modal de confirmação para exclusões
- Reutilizável para grupos, subgrupos e arquivos
- Feedback visual claro para o usuário

#### 5. EditModal.tsx
- Modal para edição de nomes
- Reutilizável para grupos, subgrupos e arquivos
- Validação de entrada

### Utilitários

#### 1. supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

export const checkConnection = async () => {
  try {
    const { error } = await supabase
      .from('groups')
      .select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    return false;
  }
};
```

### Types

#### database.ts
```typescript
export interface Group {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Subgroup {
  id: string;
  name: string;
  group_id: string;
  user_id: string;
  created_at: string;
}

export interface File {
  id: string;
  name: string;
  link: string;
  subgroup_id: string;
  user_id: string;
  created_at: string;
}
```

## Funcionalidades Principais

### 1. Autenticação
- Login com email e senha
- Sessão persistente
- Logout automático ao fechar a aba ou navegador
- Logout automático em caso de perda de conexão

### 2. Gerenciamento de Grupos
- Criação de grupos
- Edição de nomes
- Exclusão (cascata)
- Expansão/contração da visualização

### 3. Gerenciamento de Subgrupos
- Criação dentro de grupos
- Edição de nomes
- Exclusão (cascata)
- Expansão/contração da visualização

### 4. Gerenciamento de Arquivos
- Adição de arquivos com nome e link
- Edição de nomes
- Exclusão
- Cópia de link para clipboard
- Acesso direto ao arquivo

### 5. Feedback ao Usuário
- Notificações toast para todas as operações
- Indicadores de carregamento
- Mensagens de erro claras
- Confirmação para ações destrutivas

### 6. Tratamento de Conectividade
- Monitoramento contínuo da conexão com Supabase
- Feedback visual do estado da conexão
- Desativação de funcionalidades quando offline
- Reconexão automática

## Segurança

### 1. Autenticação
- Gerenciada pelo Supabase Auth
- Tokens JWT para sessões
- Refresh tokens automático

### 2. Autorização
- Row Level Security (RLS) no banco de dados
- Políticas por tabela
- Separação de dados por usuário

### 3. Proteção de Dados
- Validação de entrada em todos os formulários
- Sanitização de dados
- Confirmação para operações destrutivas

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## Considerações de Performance

1. **Otimizações de Renderização**
   - Uso de `useCallback` para funções
   - Memoização de estados complexos
   - Lazy loading de modais

2. **Gerenciamento de Estado**
   - Estados locais para UI
   - Estados globais para autenticação
   - Cache de dados do Supabase

3. **Tratamento de Erros**
   - Captura e log de erros
   - Feedback visual para o usuário
   - Fallbacks para estados de erro

## Manutenção e Extensão

### Adicionando Novas Funcionalidades

1. **Novas Tabelas**
   - Criar tabela no Supabase
   - Adicionar políticas RLS
   - Criar tipos TypeScript
   - Implementar componentes React

2. **Modificando Existentes**
   - Atualizar schema no Supabase
   - Atualizar tipos TypeScript
   - Adaptar componentes afetados

### Debugging

1. **Logs do Cliente**
   - Verificar console do navegador
   - Monitorar estados React
   - Verificar network requests

2. **Logs do Servidor**
   - Acessar logs do Supabase
   - Verificar políticas RLS
   - Monitorar queries lentas

## Conclusão

Este sistema foi projetado para ser seguro, escalável e fácil de manter. A combinação de React com Supabase oferece uma solução robusta para gerenciamento de arquivos com autenticação e autorização integradas. A documentação acima deve fornecer todas as informações necessárias para entender, manter e estender o sistema conforme necessário.