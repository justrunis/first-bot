import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord.js";

const scheduleCommand = new SlashCommandBuilder()
  .setName("schedule")
  .setDescription("Schedules a message")
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("The message to be scheduled")
      .setMinLength(10)
      .setMaxLength(2000)
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("time")
      .setDescription("When to schedule the message")
      .setChoices(
        { name: "30 seconds", value: 15000 },
        { name: "1 Minute", value: 60000 },
        { name: "15 Minutes", value: 900000 },
        { name: "30 Minutes", value: 1800000 },
        { name: "1 hour", value: 3600000 }
      )
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("The channel the message should be sent to")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  );

export default scheduleCommand.toJSON();
