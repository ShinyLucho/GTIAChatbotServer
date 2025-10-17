
---

# 🚀 Guide de survie : créer un modèle fine-tuné avec OpenAI (GPT-3.5 Turbo)

> **Objectif** : entraîner un petit modèle de conversation personnalisé (ex. qui répond toujours “COUCOU”)
> **Durée** : ~15 min
> **Public** : enseignant·e / chercheur·e / bidouilleur·e sans expérience API préalable

---

## 🧩 1. Installer l’environnement

### 1.1. Installer Python (≥ 3.9)

Vérifie :

```bash
python --version
```

Si non installé :

* **Windows** → [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)
* **Mac/Linux** → déjà présent ou via `brew install python3`

---

### 1.2. Créer un dossier de travail

```bash
mkdir fine_tune_coucou
cd fine_tune_coucou
```

---

### 1.3. Créer un environnement virtuel (recommandé)

```bash
python -m venv .venv
```

Active-le :

* **Windows PowerShell**

  ```powershell
  .venv\Scripts\Activate
  ```
* **Mac/Linux**

  ```bash
  source .venv/bin/activate
  ```

---

### 1.4. Installer le client OpenAI officiel

```bash
pip install --upgrade openai
```

Vérifie :

```bash
python -m openai --help
```

Si tu obtiens une aide de commande → c’est bon ✅

---

## 🔑 2. Définir la clé d’API OpenAI

Récupère ta clé sur :
👉 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

Puis configure-la dans ton terminal :

* **Mac/Linux :**

  ```bash
  export OPENAI_API_KEY="sk-…"
  ```
* **Windows PowerShell :**

  ```powershell
  setx OPENAI_API_KEY "sk-…"
  ```

> 💡 La clé est enregistrée dans ton environnement. Tu peux vérifier :
>
> ```bash
> echo $env:OPENAI_API_KEY   # (PowerShell)
> echo $OPENAI_API_KEY       # (Linux/Mac)
> ```

---

## 🧠 3. Créer ton dataset d’entraînement

### 3.1. Format obligatoire : JSONL

Un fichier `.jsonl` contient **une conversation par ligne** au format :

```json
{"messages": [
  {"role": "user", "content": "Bonjour"},
  {"role": "assistant", "content": "COUCOU"}
]}
```

Crée un fichier nommé `dataset.jsonl` :

```jsonl
{"messages":[{"role":"user","content":"Bonjour"},{"role":"assistant","content":"COUCOU"}]}
{"messages":[{"role":"user","content":"Explique-moi Pythagore"},{"role":"assistant","content":"COUCOU"}]}
{"messages":[{"role":"user","content":"Dis-moi une blague"},{"role":"assistant","content":"COUCOU"}]}
```

✅ Vérifie :

* UTF-8 sans BOM
* 1 JSON par ligne
* paires `user` / `assistant` bien formées

---

## 📤 4. Envoyer ton dataset vers OpenAI

Commande à exécuter dans le dossier contenant `dataset.jsonl` :

```bash
python -m openai api files.create -p fine-tune -f dataset.jsonl
```

➡️ La commande renvoie un identifiant du type :

```
"id": "file-TnF5r7UzXQPoMYaaJsdzM5"
```

**Garde-le précieusement** : c’est ton fichier hébergé chez OpenAI.

---

## ⚙️ 5. Lancer le fine-tuning

Commande :

```bash
python -m openai api fine_tuning.jobs.create \
  --training-file file-TnF5r7UzXQPoMYaaJsdzM5 \
  --model gpt-3.5-turbo-0125 \
  --suffix coucou
```

* `--training-file` → l’ID de ton fichier
* `--model` → le modèle de base
* `--suffix` → nom lisible à la fin (facultatif mais pratique)

Résultat :

```json
{
  "id": "ftjob-thYHT8XZAM6ZlTW88eXlmFlN",
  "status": "running"
}
```

---

## 🕒 6. Suivre la progression du job

Tu peux surveiller ton job :

```bash
python -m openai api fine_tuning.jobs.retrieve -i ftjob-thYHT8XZAM6ZlTW88eXlmFlN
```

Statuts possibles :

| Statut             | Signification                |
| ------------------ | ---------------------------- |
| `validating_files` | Vérification du dataset      |
| `queued`           | En attente de ressources     |
| `running`          | Entraînement en cours        |
| `succeeded`        | ✅ Terminé                    |
| `failed`           | ⚠️ Erreur (vérifie les logs) |

Quand terminé :

```json
"fine_tuned_model": "ft:gpt-3.5-turbo-0125:personal:coucou:CR2exqnX"
```

➡️ **C’est ton modèle final.**

---

## 🧪 7. Tester ton modèle fine-tuné

Commande de test :

```bash
python -m openai api chat.completions.create \
  -m ft:gpt-3.5-turbo-0125:personal:coucou:CR2exqnX \
  -j '{
    "messages": [{"role": "user", "content": "Bonjour"}],
    "temperature": 0
  }'
```

Résultat attendu :

```json
{
  "choices": [
    { "message": { "role": "assistant", "content": "COUCOU" } }
  ]
}
```

✅ Si tu obtiens “COUCOU”, ton modèle fonctionne.

---

## 💻 8. (Optionnel) L’utiliser dans une page web

**Important** : ne jamais mettre la clé API dans le code front-end.
Deux solutions :

1. Utiliser localement pour tester (clé visible → réservé au dev)
2. Créer un petit **proxy Node.js** hébergé sur Render/Vercel (clé cachée)

---

## 🔁 9. Refaire l’expérience pour un autre modèle

À chaque nouveau projet :

| Étape                        | Commande                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| (1) Upload du dataset        | `python -m openai api files.create -p fine-tune -f mon_dataset.jsonl`                                           |
| (2) Lancer fine-tune         | `python -m openai api fine_tuning.jobs.create --training-file file-XXX --model gpt-3.5-turbo-0125 --suffix nom` |
| (3) Suivre le job            | `python -m openai api fine_tuning.jobs.list`                                                                    |
| (4) Récupérer l’ID du modèle | `python -m openai api fine_tuning.jobs.retrieve -i ftjob-XXX`                                                   |
| (5) Tester                   | `python -m openai api chat.completions.create -m ft:XXX -j '{...}'`                                             |

---

## ⚠️ 10. Erreurs courantes et solutions

| Message                                   | Cause                         | Solution                                          |
| ----------------------------------------- | ----------------------------- | ------------------------------------------------- |
| `invalid training_file`                   | Mauvais format JSONL          | Vérifier chaque ligne JSON, pas de virgule finale |
| `invalid choice: chat_completions.create` | Mauvaise syntaxe CLI          | Utiliser `chat.completions.create`                |
| `exceeded_quota`                          | Clé API sans crédits          | Ajouter un moyen de paiement                      |
| `invalid_request_error`                   | Fichier supprimé / mauvais ID | Recrée un `file-…`                                |
| `ENOENT: package.json` (Render)           | Fichier manquant dans repo    | Pousser `server.js` et `package.json`             |

---

## ✅ En résumé

| Étape | Action                    | Résultat                    |
| ----- | ------------------------- | --------------------------- |
| 1     | Installer OpenAI client   | CLI opérationnelle          |
| 2     | Créer dataset.jsonl       | Jeu de dialogues            |
| 3     | `files.create`            | Upload vers OpenAI          |
| 4     | `fine_tuning.jobs.create` | Lancement de l’entraînement |
| 5     | `jobs.retrieve`           | Suivi du statut             |
| 6     | `chat.completions.create` | Test du modèle fine-tuné    |

---

> 💡 Astuce : garde ce fichier sous le nom `GUIDE_FINE_TUNE.md` dans ton repo GitHub.
> Dans 6 mois, tu pourras rejouer chaque commande sans réfléchir — c’est un flux complet et éprouvé.

---

Souhaites-tu que je t’ajoute à la fin un **bloc “Bonus : héberger le proxy Render proprement”**, pour que ton collègue puisse aussi faire le déploiement clé sécurisée → front GitHub Pages ?
