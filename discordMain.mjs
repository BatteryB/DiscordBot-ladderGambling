import { Client, GatewayIntentBits } from 'discord.js';
import sqlite3 from 'sqlite3';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = 'TOKEN';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const db = new sqlite3.Database('DB/toto.db');

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === '가입하기') {
        let e;
        let userId = interaction.user.id
        let setNickName = interaction.options.getString('닉네임');
        let join = await joinCheck(userId);

        if (!join) {
            if (setNickName) {
                await db.run('INSERT INTO user (id, nickName, money) VALUES (?, ?, 10000)', [userId, setNickName], (err) => {
                    if (err) {
                        e = err;
                    }
                })

                if (!e) {
                    await interaction.reply({ content: '사용자 가입 성공\n가입 보너스 10000원 지급', ephemeral: true });
                } else {
                    await interaction.reply({ content: e, ephemeral: true });
                }
            } else {
                await interaction.reply({ content: '게임에 사용될 닉네임을 입력해주세요.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '이미 가입되어있습니다.', ephemeral: true });
        }

    }

    if (interaction.commandName === '내정보') {
        let e;
        let join = await joinCheck(interaction.user.id);
        let user = await getUserInfo(interaction.user.id);

        if (join) {

            let userPrinf = [
                '사용자이름: ' + interaction.user.displayName,
                '닉네임: ' + user.nickName,
                '돈: ' + user.money
            ]

            let userInfoEmbed = new EmbedBuilder()
                .setTitle('빳데리 도@박장')
                .setDescription(userPrinf.join('\n'))
                .setThumbnail(interaction.user.avatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [userInfoEmbed] });
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        }
    }

    if (interaction.commandName === '도박') {
        let join = await joinCheck(interaction.user.id);
        let gameName = interaction.options.getString('게임');
        if (join) {
            if (!gameName) {
                await interaction.reply({ content: '플레이 하실 게임을 입력 해주세요.', ephemeral: true })
            } else if (gameName === 'ladder') {
                let ladderResult = ladder();
                let battingUser = await ladderBattingUser(), prizeUser = [], printPrizeUser = '';
                let prizeEmbed;
                for (let i = 0; i < battingUser.length; i++) {
                    if (battingUser[i].choice === ladderResult.start || battingUser[i].choice === ladderResult.line || battingUser[i].choice === ladderResult.last) {
                        prizeUser.push({ id: battingUser[i].id, name: battingUser[i].nickName, money: (battingUser[i].money * 1.95) });
                        printPrizeUser += (battingUser[i].nickName + ' | ' + (battingUser[i].money * 1.95) + '원\n')
                    }
                }

                for (let i = 0; i < prizeUser.length; i++) {
                    await db.run('update user set money = money + ? where id = ?', [prizeUser[i].money, prizeUser[i].id]);
                }

                await db.run('delete from ladderBatting');

                if (printPrizeUser) {
                    prizeEmbed = new EmbedBuilder()
                        .setTitle('당첨자 목록')
                        .setDescription(printPrizeUser)
                        .setColor('Green')
                        .setTimestamp();
                } else {
                    prizeEmbed = new EmbedBuilder()
                        .setTitle('당첨자가 없습니다.')
                        .setColor('Red')
                        .setTimestamp();
                }

                await interaction.reply({ content: ladderResult.result, embeds: [prizeEmbed] });

            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        }
    }

    if (interaction.commandName === '사다리배팅') {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let completed;
            let user = await getUserInfo(interaction.user.id);
            let battingChoice = interaction.options.getString('선택');
            let battingMoney = interaction.options.getNumber('금액');

            if (battingMoney < 100) {
                await interaction.reply({ content: '최소 배팅 금액은 100원 입니다.', ephemeral: true });
            } else if (user.money >= battingMoney) {
                setTimeout(async () => {
                    await db.run('update user set money = money - ? where id = ?', [battingMoney, interaction.user.id]);
                    await db.run('insert into ladderBatting (id, choice, money) values (?, ?, ?)', [interaction.user.id, battingChoice, battingMoney]);
                    interaction.reply({ content: '"' + battingChoice + '"에 ' + battingMoney + '원을 배팅하였습니다.', ephemeral: true });
                }, 500);
            } else {
                await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        }
    }

});


function joinCheck(id) {
    return new Promise((resolve, reject) => {
        db.get('select * from user where id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

function getUserInfo(id) {
    return new Promise((reslove, reject) => {
        db.get('select * from user where id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                reslove(row);
            }
        });
    });
}

function ladder() {
    let start = ['좌', '우'], line = ['3', '4'], last = '';
    let startDrow = Math.floor(Math.random() * start.length);
    let lineDrow = Math.floor(Math.random() * line.length);
    let result = '';

    if (start[startDrow] === '좌' && line[lineDrow] === '3') {
        result = '▼\n좌              우\n█▃▃▃█\n█▃▃▃█\n█▃▃▃█\n홀              짝';
        last = '짝';
    } else if (start[startDrow] === '좌' && line[lineDrow] === '4') {
        result = '▼\n좌              우\n█▃▃▃█\n█▃▃▃█\n█▃▃▃█\n█▃▃▃█\n홀              짝';
        last = '홀';
    } else if (start[startDrow] === '우' && line[lineDrow] === '3') {
        result = 'ㅤ              ▼\n좌              우\n█▃▃▃█\n█▃▃▃█\n█▃▃▃█\n홀              짝';
        last = '홀';
    } else if (start[startDrow] === '우' && line[lineDrow] === '4') {
        result = 'ㅤ              ▼\n좌              우\n█▃▃▃█\n█▃▃▃█\n█▃▃▃█\n█▃▃▃█\n홀              짝';
        last = '짝';
    }

    return {
        result: result,
        start: start[startDrow],
        line: line[lineDrow],
        last: last
    }
}

function ladderBattingUser() {
    return new Promise((resolve, reject) => {
        db.all('select user.id, user.nickName, ladderBatting.choice, ladderBatting.money from ladderBatting inner join user on ladderBatting.id = user.id', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}
client.login(TOKEN);