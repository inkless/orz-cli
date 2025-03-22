import { Command } from 'commander';

const helloCommand = new Command('hello')
  .description('Say hello to someone')
  .argument('[name]', 'Name to greet', 'World')
  .option('-u, --uppercase', 'Output in uppercase')
  .action((name, options) => {
    let message = `Hello, ${name}!`;

    if (options.uppercase) {
      message = message.toUpperCase();
    }

    console.log(message);
  });

export default helloCommand;
