import { config } from "dotenv";
import { Client, GatewayIntentBits, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import schedule from "node-schedule";

import JokeCommand from "./commands/joke.js";
import ScheduleCommand from "./commands/schedule.js";
import ActivityStatusCommand from "./commands/activitystatus.js";

config();
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.login(TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.username}!`);
});

client.on("presenceUpdate", (oldPresence, newPresence) => {
  console.log(`Presence update for ${newPresence.member.user.tag}`);
  if (!newPresence || !newPresence.member) return; // Ensure valid data

  const member = newPresence.member;
  const activities = newPresence.activities || []; // Get activities

  console.log(`Activities for ${member.user.tag}:`, activities);

  // Check if user is playing "League of Legends"
  const playingGame = activities.find(
    (activity) => activity.type === 0 && activity.name === "League of Legends"
  );

  if (playingGame) {
    console.log(
      `${member.user.tag} is playing League of Legends - Attempting to kick...`
    );

    if (member.kickable) {
      member
        .kick("Playing League of Legends is forbidden!")
        .then(() => {
          console.log(
            `Kicked ${member.user.tag} for playing League of Legends`
          );
        })
        .catch((err) => {
          console.error(`Failed to kick ${member.user.tag}: ${err.message}`);
        });
    } else {
      console.log(`Cannot kick ${member.user.tag}, missing permissions.`);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    console.log(interaction.commandName);
    if (interaction.commandName === "joke") {
      const type = interaction.options.getString("type");
      const URL = `https://v2.jokeapi.dev/joke/${type}?type=single`;

      const response = await fetch(URL);
      const data = await response.json();

      interaction.reply({ content: data.joke, ephemeral: true });
    }
    if (interaction.commandName === "schedule") {
      const message = interaction.options.getString("message");
      const time = interaction.options.getInteger("time");
      const channel = interaction.options.getChannel("channel");

      const date = new Date(new Date().getTime() + time);
      interaction.reply({
        content: `Your message has been scheduled for ${date.toTimeString()}`,
        ephemeral: true,
      });
      schedule.scheduleJob(date, () => {
        channel.send({ content: message });
      });
    }
    if (interaction.commandName === "activitystatus") {
      await interaction.deferReply();

      const members = interaction.guild.members.cache;
      const activityStatuses = [];

      for (const member of members.values()) {
        console.log(`Checking activities for: ${member.user.tag}`);

        const activities = member.presence?.activities || [];
        console.log(`Activities:`, activities); // Debugging line

        const customStatus = activities.find((activity) => activity.type === 4);
        const gameActivity = activities.find((activity) => activity.type === 0); // Type 0 = Playing a game

        let statusMessage = `**${member.user.tag}** - `;
        if (customStatus && customStatus.state) {
          statusMessage += `Custom Status: ${customStatus.state}`;
        }
        if (gameActivity && gameActivity.name) {
          statusMessage +=
            (customStatus ? " | " : "") + `Playing: ${gameActivity.name}`;
        }

        if (customStatus || gameActivity) {
          activityStatuses.push(statusMessage);
        }
      }

      if (activityStatuses.length === 0) {
        return interaction.editReply(
          "No users in this server have set custom statuses or are playing games."
        );
      }

      const statusMessage = activityStatuses.join("\n");

      if (statusMessage.length > 2000) {
        return interaction.editReply(
          "The list is too long to display. Please try a more specific query."
        );
      }

      await interaction.editReply(statusMessage);
    }
  }
});

async function main() {
  const commands = [JokeCommand, ScheduleCommand, ActivityStatusCommand];

  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    client.login(TOKEN);
  } catch (error) {
    console.error(error);
  }
}

main();
