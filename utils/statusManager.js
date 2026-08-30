const { ActivityType } = require('discord.js');

class StatusManager {
    constructor(client) {
        this.client = client;
        this.currentInterval = null;
        this.isPlaying = false;
    }

    getPlayerInfo(guildId) {
        const player = this.client.riffy?.players?.get(guildId);
        if (!player) return null;
        
        return {
            playing: player.playing,
            title: player.current?.info?.title || null
        };
    }

    async updateStatusAndVoice(guildId) {
        try {
            const playerInfo = this.getPlayerInfo(guildId);
            
            if (playerInfo && playerInfo.playing && playerInfo.title) {
                await this.setPlayingStatus(playerInfo.title);
            } else {
                await this.setDefaultStatus();
            }
        } catch (error) {
            console.error('❌ Error updating status:', error);
        }
    }

    async setPlayingStatus(trackTitle) {
        this.stopCurrentStatus();
        this.isPlaying = true;
        
        const activity = `🎵 ${trackTitle}`;
     
        await this.client.user.setPresence({
            activities: [{
                name: activity,
                type: ActivityType.Listening
            }],
            status: 'online'
        });
        
        this.currentInterval = setInterval(async () => {
            if (this.isPlaying) {
                await this.client.user.setPresence({
                    activities: [{
                        name: activity,
                        type: ActivityType.Listening
                    }],
                    status: 'online'
                });
            }
        }, 30000);
    }

    async setDefaultStatus() {
        this.stopCurrentStatus();
        this.isPlaying = false;
        
        const config = require('../config');
        const defaultActivity = {
            name: config.activityName || '🎵 Ready for music!',
            type: ActivityType[config.activityType?.toUpperCase()] || ActivityType.Watching
        };
        
        await this.client.user.setPresence({
            activities: [defaultActivity],
            status: 'online'
        });
    }
  
    stopCurrentStatus() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }
    }

    async onTrackStart(guildId) {
        await this.updateStatusAndVoice(guildId);
    }
 
    async onTrackEnd(guildId) {
        setTimeout(async () => {
            await this.updateStatusAndVoice(guildId);
        }, 1000);
    }

    async onPlayerDisconnect(guildId = null) {
        await this.setDefaultStatus();
    }
}

module.exports = StatusManager;
