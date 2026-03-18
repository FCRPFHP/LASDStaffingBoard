require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const divisions = {
  santa: [],
  palmdale: [],
  west: [],
  compton: []
};

function canJoin(division) {
  const counts = Object.values(divisions).map(d => d.length);
  const min = Math.min(...counts);
  return divisions[division].length === min;
}

function generateBoard() {
  return `
🚔 LASD Staffing Board

Santa Clarita: ${divisions.santa.join(", ") || "—"}
Palmdale: ${divisions.palmdale.join(", ") || "—"}
West Hollywood: ${divisions.west.join(", ") || "—"}
Compton: ${divisions.compton.join(", ") || "—"}
`;
}

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId('santa').setLabel('Santa Clarita').setStyle(ButtonStyle.Success),
  new ButtonBuilder().setCustomId('palmdale').setLabel('Palmdale').setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setCustomId('west').setLabel('West Hollywood').setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId('compton').setLabel('Compton').setStyle(ButtonStyle.Danger)
);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const division = interaction.customId;
  const user = interaction.user.username;

  for (let key in divisions) {
    divisions[key] = divisions[key].filter(u => u !== user);
  }

  if (!canJoin(division)) {
    return interaction.reply({
      content: "❌ You cannot join this division yet.",
      ephemeral: true
    });
  }

  divisions[division].push(user);

  await interaction.update({
    content: generateBoard(),
    components: [row]
  });
});

client.login(process.env.DISCORD_TOKEN);