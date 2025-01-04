# CCBot

Discord bot to aid with challenges

## Commands

```text
admin 
    allow-bot-shame-replies - Sets if the bot can reply with snarky gifs to shamed users.
    set-challenge-channel - Sets the channel to use for challenge reminders/notifications.
    show-challenge-channel - Shows which channel is setup for challenge reminders/notifications.
    set-shamed-role - Sets the server role for being shamed.
    show-shamed-role - Shows the server role for the shamed.

challenge
    add - Adds a challenge for the current user.
    remove - Removes a challenge from the current user.
    list-all - Lists all challenges on the server.
    list-user - Lists all challenges for a single user.
    cheat - Marks today as a cheat day.
    pause - NYI

shame
    add - Adds the shamed role to a user.
    remove - Removes the shamed role from a user.
```

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
