const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // npm i input

const apiId = 23926521; // This is a public sample ID from gram.js docs, or user needs to provide one
const apiHash = "56012c40c3453715d9727d2c310467c6"; // Public sample hash
const stringSession = new StringSession(""); // fill this later with the value from session.save()

(async () => {
    console.log("Loading interactive example...");
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    await client.start({
        phoneNumber: async () => await input.text("Please enter your number: "),
        password: async () => await input.text("Please enter your password: "),
        phoneCode: async () => await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    console.log("Your SESSION STRING (save this to .env as TELEGRAM_SESSION):");
    console.log("\n" + client.session.save() + "\n"); // Save this string to avoid logging in again
    await client.sendMessage("me", { message: "Hello from PirateSlayer!" });
    process.exit(0);
})();
