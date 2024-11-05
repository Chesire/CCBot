# CCBot

Discord bot to aid with challenges

## Development

When adding a command, add it in the required folder `commands/`, then run `node deploy-commands.js` to update Discord with the new commands.  
Once the above is done then the server can be re-run and the new commands should be visible on the bot and working.

## Deploying

When ready to deploy to correct server, change the `guildId` in `config.json`.

```javascript
config.json
{
    // This is the token for the bot itself, from discord.
    "token": "",
    // The bots clientId or applicationId, from discord.
    "clientId": "",
    // Id of the guild this will attach to.
    "guildId": ""
}
```
