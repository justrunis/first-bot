import { SlashCommandBuilder } from "@discordjs/builders";

const activityStatusCommand = new SlashCommandBuilder()
  .setName("activitystatus")
  .setDescription("Shows all users in the server and their activity statuses.");

export default activityStatusCommand.toJSON();
