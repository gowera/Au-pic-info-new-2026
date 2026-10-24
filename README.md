# Aupic Redux

clone le site https://aupicinfo.com exactement comme il est avec la couleur rouge comme couleur principale. Les articles doivent provenir du meme lien api rest (meme site), ajoutons la radio en ligne dont voici le lien de streaming : https://stream.zeno.fm/wnawq794tk8uv les articles doivent afficher le contenu en cliquant sur le lien (page de lecture). comme les articles sont nombreux, le site doit etre bien optimiser au chargement des articles et paginé,... le nouveau site doit etre responsive, avec une signature en bas de page : fierement conçu par Oredy TECHNOLOGIES, avec Oredy TECHNOLOGIES qui porte le lien : https://oredytech.com

## Développement

L’application est une SPA React et TypeScript construite avec Vite. Les articles et catégories sont chargés directement depuis l’API REST WordPress d’Aupic Info.

```sh
npm install
npm run dev
```

Commandes disponibles : `npm run build` pour produire le site statique, `npm run preview` pour le prévisualiser et `npm test` pour exécuter les tests.

En production, configurez l’hébergement pour servir `index.html` comme repli des routes inconnues afin que les liens directs vers les articles et catégories fonctionnent.
"# Au-pic-info-new-2026" 
