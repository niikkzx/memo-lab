# Memo Lab

Aplicativo de treino da memorização para BLD, em português.

Inclui reconhecimento de letras, pares ordenados, associações, sequências,
sprint, revisão de erros, cubo 3D, dicionário e estatísticas.
Tema preto e azul-marinho, cores vívidas e interface adaptada ao celular.


## Novos treinos

- Selecione letras ou pares exatos, como `AQ QA AB`, e inclua os inversos com um toque.
- Percorra uma rodada completa em ordem embaralhada, sem repetir; também há ordem de letras e ordem adaptativa.
- Treine **Letras → cores**, com uma letra ou um par. Após responder, confira as cores e as peças em 3D.
- Treine **Cores da peça**: as duas letras pertencem à mesma aresta e você escolhe a cor da primeira entre as duas cores dela. `AQ → branco`, `QA → azul`, `VO → amarelo`, `OV → vermelho` no Speffz padrão. São 12 peças e 24 orientações, com peça 3D após responder e seleção própria de pares.
- Revise somente erros e acertos acima da meta ao terminar. A revisão inteligente considera as últimas três tentativas por item.
- Veja precisão e tempo separados para letras, pares visuais e cores. As seleções e o histórico permanecem no navegador e nos backups.

## Publicar no GitHub Pages pelo navegador

1. Extraia este ZIP no computador.
2. Crie um repositório chamado `memo-lab` no GitHub. Para usar Pages com
   GitHub Free, escolha **Public**. Assim, o código e o site serão públicos.
   Marque a opção de adicionar um README para iniciar a branch `main`.
3. No repositório, use **Add file > Upload files**. Envie os arquivos extraídos
   para a raiz. O `index.html` deve aparecer na página principal do repositório,
   ao lado de `app.js` e `style.css`. Confirme com **Commit changes**.
4. Abra **Settings > Pages**. Em **Source**, escolha **Deploy from a branch**.
5. Selecione a branch `main`, pasta `/(root)`, e clique em **Save**.
6. Aguarde a publicação. O link aparece nessa mesma página e normalmente será
   `https://SEU-USUARIO.github.io/memo-lab/`.

Todos os arquivos do aplicativo são código-fonte editável. Não é necessário
instalar dependências nem executar uma compilação. O aplicativo usa módulos
JavaScript e deve ser aberto por um servidor web, como o GitHub Pages.

Documentação oficial:
- https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/pt/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

## Preservar o progresso

O progresso fica no navegador, separado por endereço do site. Antes de mudar
para o GitHub Pages, abra as configurações do site antigo e exporte o backup.
No novo endereço, importe esse arquivo. O backup contém seu histórico,
dicionário e preferências. Ele não precisa ser enviado ao repositório.

## Arquivos

- `index.html`: entrada do site.
- `app.js`: interface e treinos.
- `model.js`: peças, letras, pontuação e persistência.
- `cube.js`: renderização 3D.
- `training.js`: seleção de itens, pares da mesma peça e ordem dos treinos.
- `ui.js`: ícones e utilitários de interface.
- `style.css`: aparência e layouts responsivos.
- `favicon.svg`: ícone do site.

Esta cópia contém a versão com a correção do cubo, o tema preto/azul-marinho,
a paleta vívida e as adaptações para celular. Os treinos de sequência são
exercícios sintéticos de memorização, sem simulação de rastreamento de scramble.
