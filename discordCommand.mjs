import { REST, Routes, SlashCommandBuilder } from 'discord.js';
const TOKEN = 'TOKEN';
const CLIENT_ID = 'CLIENT_ID';



const commands = [
    {
        name: '가입하기',
        description: '도박 게임에 가입합니다.',
        options: [
            {
                name: '닉네임',
                description: '게임에 사용될 자신의 닉네임을 정해주세요!',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: '내정보',
        description: '자신의 도박 정보를 확인합니다.'
    },
    {
        name: '도박',
        description: "게임중 하나를 시작합니다.",
        options: [
            {
                name: '게임',
                description: "게임 종류를 선택하세요!",
                type: 3,
                required: true,
                choices: [
                    {
                        name: '사다리',
                        value: 'ladder'
                    }
                ]
            }
        ]
    },
    {
        name: '사다리배팅',
        description: "사다리의 다음회차에 배팅을 합니다. 배팅 후에는 '/도박 게임:사다리' 명령어로 결과를 볼 수 있습니다.",
        options: [
            {
                name: '선택',
                description: '배당율은 1.95배 입니다.',
                type: 3,
                required: true,
                choices: [
                    {
                        name: '좌',
                        value: '좌'
                    },
                    {
                        name: '우',
                        value: '우'
                    },
                    {
                        name: '3',
                        value: '3'
                    },
                    {
                        name: '4',
                        value: '4'
                    },
                    {
                        name: '홀',
                        value: '홀'
                    },
                    {
                        name: '짝',
                        value: '짝'
                    },
                ]
            },
            {
                name: '금액',
                description: '배팅할 금액을 선택합니다.',
                type: 10,
                required: true
            }
        ]
    },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}
