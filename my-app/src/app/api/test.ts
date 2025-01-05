// import { llama31, gpt35, Message } from "./models";

// const messages: Message[] = [
//     { role: 'user', content: 'Hello, how are you?', name: 'User' },
// ];
// gpt35(messages).then(console.log);

import { claudeV1, Message, gpt35 } from "./models";

const messages: Message[] = [
    { role: 'user', content: 'Hello, how are you?', name: 'User' },
];

gpt35(messages).then(console.log);