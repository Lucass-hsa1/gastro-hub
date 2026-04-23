# GastroHub Delivery

Plataforma completa para gerenciamento de restaurantes, entregas e PDV (Ponto de Venda).

## 🎯 MVP Features

### Dashboard
- Visão geral de pedidos em andamento
- Entregas ativas
- Receita total
- Entregas completadas

### Comanda
- Criação de novos pedidos
- Seleção de itens do menu
- Mudança de status dos pedidos (Pendente → Preparando → Pronto → Entregue)
- Visualização de todos os pedidos

### PDV (Ponto de Venda)
- Interface intuitiva para vendas rápidas
- Categorias de produtos
- Carrinho com controle de quantidade
- Opção para entregas com dados do cliente
- Finalização de venda com persistência

### Gerenciador de Entregas
- Listagem de entregas em andamento
- Rastreamento de status
- Informações do cliente (nome, endereço, telefone)
- Criação de novas entregas manualmente
- Mudança de status (Pendente → Em Trânsito → Entregue)

### Configurações
- Gestão de dados do restaurante
- Horário de funcionamento
- Contato (telefone, email)
- Endereço do estabelecimento

## 💾 Persistência

Todos os dados são salvos automaticamente no **localStorage** do navegador:
- Não há reset ao fechar a aba/navegador
- Dados persistem entre atualizações
- Perfeito para demonstração ao investidor sem risco de perder dados

## 🚀 Como Rodar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Build para Produção
```bash
npm run build
npm start
```

## 🎨 Design

- **Cores**: Teal (#0B7B8C) e Laranja (#FF7A00) — baseadas no logo
- **Framework**: Next.js 14 + React 19
- **Styling**: Tailwind CSS
- **Ícones**: Lucide React

## 📱 Responsividade

Totalmente responsivo para:
- Desktop
- Tablet
- Mobile

## 📂 Estrutura do Projeto

```
app/
├── page.tsx          # Dashboard
├── order/page.tsx    # Comanda
├── pdv/page.tsx      # Ponto de Venda
├── delivery/page.tsx # Entregas
├── restaurant/page.tsx # Configurações
└── layout.tsx        # Layout principal

lib/
└── storage.ts        # Lógica de persistência (localStorage)

components/
├── Navigation.tsx    # Barra de navegação
├── StatCard.tsx      # Componente de estatísticas
└── OrderCard.tsx     # Card de pedidos

Gastrohub logo.png   # Logo do aplicativo
```

## 🎭 Demo

O aplicativo vem com dados de demonstração pré-carregados:
- 2 pedidos na comanda
- 2 entregas em andamento
- Menu completo com vários itens
- Dados do restaurante configurados

## 🛠 Tecnologias

- **Next.js 14** - React framework
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **localStorage** - Persistência de dados

## 📝 Notas

- Este é um MVP focado em frontend para demonstração
- A lógica de backend será implementada em futuras versões
- Todos os dados são fictícios e para fins de demonstração

---

**GastroHub** - Seu restaurante, simplificado. 🍽️
