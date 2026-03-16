const config = require("../config.js");
const { ActivityType } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

module.exports = async (client) => {
    const rest = new REST({ version: "10" }).setToken(config.TOKEN || process.env.TOKEN);

    try {
        // Đảm bảo client.commands được await đúng cách trước khi sử dụng
        const commands = await client.commands;
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands,
        });
        console.log("✅ Commands Loaded Successfully");
    } catch (err) {
        console.error("❌ Failed to load commands:", err.message);
    }

    const defaultActivity = {
        name: config.activityName,
        type: ActivityType.Listening
    };

    async function updateStatus() {
        try {
            // Kiểm tra nếu client.riffy và client.riffy.players tồn tại trước khi truy cập
            if (client.riffy && client.riffy.players) {
                const activePlayers = Array.from(client.riffy.players.values()).filter(player => player.playing);

                if (!activePlayers.length) {
                    //console.log("⏹️ No song is currently playing. Setting default status.");
                    client.user.setActivity(defaultActivity);
                    return;
                }

                const player = activePlayers[0];

                // Kiểm tra sự tồn tại của các thuộc tính lồng nhau
                if (player && player.current && player.current.info && player.current.info.title) {
                    const trackName = player.current.info.title;
                    //console.log(`🎵 Now Playing: ${trackName}`);
                    client.user.setActivity({
                        name: `🎶 ${trackName}`,
                        type: ActivityType.Listening
                    });
                } else {
                    //console.log("⚠️ Current track info is missing or player is undefined. Setting default status.");
                    client.user.setActivity(defaultActivity);
                }
            } else {
                console.warn("⚠️ client.riffy hoặc client.riffy.players chưa được khởi tạo. Đặt trạng thái mặc định.");
                client.user.setActivity(defaultActivity);
            }
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật trạng thái:", error);
            // Tùy chọn: Đặt trạng thái mặc định khi có lỗi
            client.user.setActivity(defaultActivity);
        }
    }

    setInterval(updateStatus, 5000);

    client.errorLog = config.errorLog;
};
