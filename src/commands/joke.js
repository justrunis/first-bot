import { SlashCommandBuilder } from "@discordjs/builders";

const jokeCommand = new SlashCommandBuilder()
  .setName("joke")
  .setDescription("tells a joke")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("type of joke")
      .setRequired(true)
      .addChoices(
        { name: "Dark", value: "Dark" },
        { name: "Programming", value: "Programming" },
        { name: "Miscellaneous", value: "Misc" },
        { name: "Pun", value: "Pun" }
      )
  );

export default jokeCommand.toJSON();
