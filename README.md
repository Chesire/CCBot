# CCBot

Discord bot to aid with challenges

## Commands

### Admin

| Subcommand | Description |
|---|---|
| `allow-bot-shame-replies` | Sets if the bot can reply with snarky gifs to shamed users. |
| `set-challenge-channel` | Sets the channel to use for challenge reminders/notifications. |
| `show-challenge-channel` | Shows which channel is setup for challenge reminders/notifications. |
| `set-shamed-role` | Sets the server role for being shamed. |
| `show-shamed-role` | Shows the server role for the shamed. |

### Challenge

| Subcommand | Description |
|---|---|
| `add` | Adds a challenge for the current user. |
| `remove` | Removes a challenge from the current user. |
| `list-user` | Lists all challenges for a specified user. |

### Shame

| Subcommand | Description |
|---|---|
| `add` | Adds the shamed role to a user. |
| `remove` | Removes the shamed role from a user. |

### Wrapped

| Subcommand | Description |
|---|---|
| `show` | Shows the current wrapped data for the server. |

## Development

When adding a command, add it to the `src/commands/` folder, then run `node deploy-commands.js` to update Discord with the new commands.  
Once the above is done then the server can be re-run and the new commands should be visible on the bot and working.

## Deploying

### Local Deployment

Create a config.json file.

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

### Docker Deployment

Pull the image from GitHub Container Registry:

```bash
docker pull ghcr.io/chesire/ccbot:latest
```

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  ccbot:
    image: ghcr.io/chesire/ccbot:latest
    container_name: ccbot
    volumes:
      - type: bind
        source: ./config.json
        target: /app/config.json
        read_only: true
      - type: bind
        source: ./data
        target: /app/data
    restart: unless-stopped
```

Create a `config.json` file in the same directory with your Discord credentials.

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


Run with:
```bash
docker-compose up -d
```

The `data/` directory will be created automatically and persist your SQLite databases between restarts.
