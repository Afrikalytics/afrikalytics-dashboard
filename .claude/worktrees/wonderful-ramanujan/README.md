# 🎯 Afrikalytics Dashboard

Dashboard privé pour les utilisateurs Premium d'Afrikalytics AI.

## 📁 Structure

```
afrikalytics-dashboard/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Redirection vers login
│   ├── globals.css         # Styles Tailwind
│   ├── login/
│   │   └── page.tsx        # Page de connexion
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard principal
│   └── profile/
│       └── page.tsx        # Page profil utilisateur
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## 🔗 Connexion à l'API

Le dashboard se connecte à l'API Afrikalytics :
- **API URL:** https://web-production-ef657.up.railway.app
- **Login:** POST /api/auth/login
- **User Info:** GET /api/users/me

## 📱 Pages

- `/login` - Page de connexion
- `/dashboard` - Dashboard principal avec études
- `/profile` - Profil utilisateur et abonnement

## 🚀 Déploiement (Vercel)

1. Push sur GitHub
2. Connecter à Vercel
3. Déployer automatiquement

## 👥 Équipe

- **Email:** software@hcexecutive.net
- **Localisation:** Dakar, Sénégal

---

© 2024 Afrikalytics AI. Tous droits réservés.
