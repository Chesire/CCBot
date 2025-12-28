# CCBot - Project Context

## Overview
CCBot is a Discord bot designed to aid with challenges. It's built with discord.js and uses SQLite for data persistence.

## Technology Stack
- **Runtime**: Node.js
- **Discord Library**: discord.js (v14.16.3)
- **Database**: SQLite3 with Sequelize ORM
- **Scheduling**: cron (v3.1.7)
- **Code Quality**: ESLint + Prettier

## Project Structure
- `src/index.js` - Main entry point
- `src/` - Source code directory
- `Dockerfile` - Docker configuration
- `entrypoint.sh` - Container entrypoint script
- `.github/` - GitHub-specific files (workflows, etc)

## Key Scripts
- `npm test` - Run tests (currently not implemented)

## Dependencies
- **Runtime**: discord.js, sequelize, sqlite3, cron
- **Dev**: ESLint, Prettier, eslint-config-prettier, @eslint/js, globals

## Development Notes
- Uses Prettier for code formatting
- Uses ESLint for code linting
- Docker-ready with Dockerfile and .dockerignore
