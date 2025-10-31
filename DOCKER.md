# Docker Setup for CCBot

## Quick Start

### 1. Create a directory for CCBot:
```bash
mkdir ccbot-config
cd ccbot-config
```

### 2. Create a `docker-compose.yml` file:
```yaml
version: '3.8'

services:
  ccbot:
    image: ghcr.io/chesire/ccbot:latest
    container_name: ccbot
    volumes:
      - ./config.json:/app/config.json:ro
      - ./data:/app/data
    restart: unless-stopped
```

### 3. Create a `config.json` file in the same directory:
```json
{
  "token": "YOUR_BOT_TOKEN",
  "clientId": "YOUR_CLIENT_ID",
  "guildId": "YOUR_GUILD_ID"
}
```

Get these values from the [Discord Developer Portal](https://discord.com/developers/applications):
- **token**: Bot token from the "Token" section
- **clientId**: Application ID from the "General Information" section
- **guildId**: Your Discord server ID (right-click server → Copy Server ID)

### 4. Run the bot:
```bash
docker-compose up -d
```

### 5. View logs:
```bash
docker-compose logs -f ccbot
```

### 6. Stop the bot:
```bash
docker-compose down
```

## Directory Structure
```
ccbot-config/
├── docker-compose.yml
├── config.json
└── data/               # Created automatically, contains sqlite databases
    ├── admindb.sqlite
    ├── challengedb.sqlite
    ├── shameeventsdb.sqlite
    └── wrappeddb.sqlite
```

## Notes

- The `data/` directory is created automatically and persists your databases
- Only `config.json` needs to exist; databases are created by the bot on first run
- The `config.json` file is mounted as read-only to prevent accidental modifications
- Logs can be viewed with `docker-compose logs -f ccbot`

## Integration with Existing docker-compose

If you have other services running in docker-compose, add the CCBot service to your existing `docker-compose.yml`:

```yaml
  ccbot:
    image: ghcr.io/chesire/ccbot:latest
    container_name: ccbot
    volumes:
      - ./ccbot.config.json:/app/config.json:ro
      - ./ccbot-data:/app/data
    restart: unless-stopped
```

Then create `ccbot.config.json` in the same directory as your `docker-compose.yml` with your bot credentials.
