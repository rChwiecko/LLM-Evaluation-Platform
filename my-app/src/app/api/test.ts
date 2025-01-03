import { llama31, Message } from "./models";

const messages: Message[] = [
    { role: 'user', content: 'Hello, how are you?', name: 'User' },
];
llama31(messages).then(console.log);