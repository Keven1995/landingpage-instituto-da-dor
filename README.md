# Instituto da Dor — Landing Page

Landing page para a unidade de fisioterapia do Instituto da Dor, no Gama/DF.
O objetivo principal é levar visitantes ao agendamento de avaliação pelo WhatsApp.

## Stack

- **Frontend:** React 19, TypeScript, Vite e CSS responsivo.
- **Backend:** Java 17, Spring Boot 4.1.2, API REST.
- **Conversão:** links `wa.me` com mensagem pré-preenchida e formulário de solicitação de avaliação online, sem armazenamento de dados no site.

## Identidade visual

A página segue a referência enviada da marca **Instituto da Dor — Guilherme Araújo**:

| Cor | Hex |
| --- | --- |
| Verde sálvia | `#A8BAB2` |
| Verde médio | `#65A778` |
| Verde profundo | `#1D503E` |
| Grafite | `#49494A` |

A referência indica as famílias **Anziano Pro Regular** e
**Recta Small Caps**. Como os arquivos de fonte licenciados não foram
fornecidos, o site usa as alternativas abertas Cormorant Garamond (títulos)
e Jost (textos e interface). A marca gráfica vem da imagem de referência
fornecida pela clínica e é exibida por recorte visual no CSS, sem alterar
o arquivo original. Para usar as fontes exatas em produção, envie os
arquivos e confirme a licença web correspondente.

## Rodando localmente

**Requisitos:** Java 17+, Maven 3.9+, Node.js compatível com Vite e npm.

Terminal 1:

```bash
cd backend
mvn spring-boot:run
```

Terminal 2:

```bash
cd frontend
npm ci
npm run dev
```

Acesse `http://127.0.0.1:5173`. O servidor de desenvolvimento escuta
somente em loopback e não deve ser publicado na internet.
O Vite redireciona `/api` para `http://localhost:8080`.
Se o Java estiver desligado, o frontend usa os dados públicos de fallback.

## Endpoints

- `GET /api/v1/clinic` — nome, contato, Instagram e endereço da unidade.
- `GET /api/v1/health` — status básico da API.

Teste do backend:

```bash
cd backend
mvn test
```

Build do frontend:

```bash
cd frontend
npm run build
```

Os arquivos gerados vão para `dist/` na raiz, prontos para hospedagem estática.
Em produção, publique somente o build estático em uma hospedagem configurada
com HTTPS; não use `npm run dev` nem `vite preview` como servidor público.
Source maps de produção estão desativados.

## Como funciona o funil

1. **Atração:** a primeira dobra mostra a proposta de valor e um botão de avaliação.
2. **Identificação:** seções sobre situações que motivam a procura por fisioterapia.
3. **Alternativa remota:** seção de avaliação online por videochamada, sujeita à avaliação de adequação pelo fisioterapeuta.
4. **Confiança:** explicação simples de como é o primeiro contato.
5. **Conversão:** botões em diversos pontos da página abrem o WhatsApp da clínica com mensagem pré-preenchida.

### Solicitação de avaliação online

O visitante preenche **nome, data e horário de preferência** no formulário e
confirma que deseja enviar essas informações à equipe. Ao enviar, abre-se o
WhatsApp com a solicitação pronta para revisão e envio pelo próprio paciente.
O site **não armazena** essas informações, não recebe histórico clínico e não
reserva horários automaticamente. A equipe confirma disponibilidade, valores
e orientações e envia o link da videochamada por WhatsApp após o acerto.

Antes da teleconsulta, a clínica precisa obter consentimento informado,
assegurar confidencialidade e registrar o atendimento em prontuário. O
profissional decide se a avaliação remota é suficiente ou se há necessidade
de atendimento presencial. Referências: [Resolução COFFITO 619/2025](https://www.coffito.gov.br/nsite/?p=34571)
e [Lei 14.510/2022](https://normas.leg.br/?urn=urn%3Alex%3Abr%3Afederal%3Alei%3A2022-12-27%3B14510).

## Publicação na Vercel e no Render

O repositório está preparado para publicar o frontend estático na Vercel e a
API Java no Render:

- `vercel.json` instala as dependências em `frontend`, executa o build do Vite,
  publica `dist/`, redireciona rotas da SPA e configura headers básicos.
- `render.yaml` cria o serviço web Docker usando `backend/Dockerfile` e verifica
  a API por `GET /api/v1/health`.
- O site continua funcionando com dados de fallback se a API não estiver
  configurada ou temporariamente indisponível.

### Passos de publicação

1. Envie o repositório ao GitHub e importe-o na Vercel. Mantenha a raiz do
   projeto como diretório raiz; as instruções de instalação/build e `dist/` já
   estão declaradas em `vercel.json`.
2. Faça o primeiro deploy da Vercel e copie a origem de produção mostrada no
   painel (por exemplo, `https://seu-projeto.vercel.app`). Não inclua caminho
   após o domínio.
3. No Render, crie um **Blueprint** usando este repositório e `render.yaml`.
   Quando solicitado, informe `ALLOWED_ORIGINS` com a origem exata da Vercel.
   Para mais de um domínio oficial, separe as origens por vírgula; não use `*`.
4. Copie a URL pública atribuída pelo Render e, nas variáveis de ambiente da
   Vercel, configure `VITE_API_URL` com essa URL, sem barra no final. Marque-a
   para Production e faça um novo deploy para incorporá-la ao bundle.
5. Se usar domínio próprio, acrescente também sua origem HTTPS exata em
   `ALLOWED_ORIGINS` no Render. O CORS não permite curingas e não inclui
   automaticamente URLs de preview da Vercel.

`VITE_API_URL` é pública e fica incorporada ao JavaScript do site; nunca coloque
tokens ou credenciais em variáveis `VITE_*`. O arquivo
`frontend/.env.example` serve apenas como modelo local. O Vite usa o proxy local
para `/api` durante desenvolvimento; em produção o frontend chama a URL Render.
O formulário de avaliação continua abrindo o WhatsApp e não envia dados pessoais
à API.

### Build e testes locais (Windows PowerShell)

```powershell
cd frontend
npm ci
npm test
npm run build
npm audit --audit-level=high

cd ..\backend
mvn test
```

No Vercel, valide o site e os headers depois do deploy. A CSP deve ser criada
como `Content-Security-Policy-Report-Only` somente após confirmar as origens
reais usadas pelo frontend e pela API; HSTS deve ser considerado após verificar
HTTPS e o redirecionamento no domínio publicado.

### Dados que precisam de validação antes da publicação pública

- Endereço da unidade e sala.
- Horários, valores e convênios (por isso não foram anunciados como fatos).
- Fotos **reais e autorizadas** do consultório, marca e profissionais.
- Credenciais profissionais para eventuais seções de equipe.

Não foram usados depoimentos fictícios, resultados garantidos ou imagens
simuladas de pacientes/consultório. As composições visuais são abstratas.

## Origem do projeto

Inspirado na iniciativa original
[`Desafio-LandingPage`](https://github.com/Keven1995/Desafio-LandingPage),
mas com arquitetura, implementação e objetivo de conversão novos.

## Dados de referência

Unidade: Instituto da Dor, Gama/DF · Instagram:
[@institutodorgama](https://www.instagram.com/institutodorgama/) ·
WhatsApp: (61) 99444-3807.
