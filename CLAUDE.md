# CCBot - Project Context

## Overview
CCBot is a Discord bot designed to aid with challenges and manage user engagement. It's built with discord.js and uses SQLite with Sequelize ORM for persistent data storage.

## Technology Stack
- **Runtime**: Node.js
- **Discord Library**: discord.js (v14.16.3)
- **Database**: SQLite3 with Sequelize ORM (v6.37.5)
- **Scheduling**: cron (v3.1.7)
- **Code Quality**: ESLint (v9.13.0) + Prettier (v3.3.3)

## Project Structure
```
src/
├── index.js                    # Main bot entry point
├── deploy-commands.js          # Deploys Discord slash commands
├── core/                       # Core bot infrastructure
│   ├── loaders/
│   │   ├── command-loader.js  # Loads commands dynamically
│   │   └── event-loader.js    # Loads event handlers
│   └── events/
│       ├── message-create.js  # Message creation events
│       ├── guild-scheduled-event-update.js
│       ├── ready-db.js        # Database initialization on ready
│       └── ready-cron.js      # Cron job initialization on ready
└── features/                   # Feature modules
    ├── admin/                  # Admin feature
    │   ├── admin-command.js
    │   └── data/
    │       ├── admindb.js
    │       └── admin-repository.js
    ├── challenge/              # Challenge management feature
    │   ├── challenge-command.js
    │   ├── service/
    │   │   └── challenge-service.js
    │   ├── presentation/
    │   │   └── challenge-presentation.js
    │   └── data/
    │       ├── challengedb.js
    │       └── challenge-repository.js
    ├── shame/                  # User shame/role management feature
    │   ├── shame-command.js
    │   ├── service/
    │   │   └── shame-service.js
    │   ├── presentation/
    │   │   └── shame-presentation.js
    │   └── data/
    │       ├── shameeventsdb.js
    │       └── shame-events-repository.js
    └── wrapped/                # Wrapped/stats feature
        └── wrapped-command.js

config.json                     # Bot configuration (token, IDs)
data/                          # SQLite database files
Dockerfile                     # Docker container configuration
entrypoint.sh                  # Container entrypoint script
```

## Key Features

### Admin Commands
- `allow-bot-shame-replies` - Configure bot shame reply behavior
- `set-challenge-channel` - Set channel for challenge notifications
- `set-shamed-role` - Configure the shamed user role

### Challenge Management
- `add` - Add a challenge for the user
- `remove` - Remove a challenge
- `list-user` - List challenges for a specified user

### Shame System
- `add` - Apply shame role to a user
- `remove` - Remove shame role from a user

### Wrapped Feature
- `show` - Display server wrapped/statistics data

## Development Notes
- **Code Style**: Prettier (auto-formatting) + ESLint (linting)
- **Architecture Pattern**: Feature-based modular design with separation of concerns (commands, services, data layers)
- **Database**: Uses Sequelize models for ORM, SQLite for persistence
- **Command Deployment**: Run `npm run deploy-commands` after adding new commands
- **Event Handling**: Dynamic event loading via event-loader
- **Scheduling**: Cron jobs initialized on bot ready event

## Available Scripts
- `npm test` - Run tests (placeholder, not yet implemented)
- `npm run deploy-commands` - Deploy Discord slash commands (via node src/deploy-commands.js)
