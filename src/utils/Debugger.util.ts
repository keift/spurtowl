import Dayjs from 'dayjs';

export class Debugger {
  private readonly name?: string;

  public constructor(name?: string) {
    this.name = name;
  }

  public info(message: string) {
    console.log(`${this.name !== undefined ? `\x1b[36m${this.name} \x1b[34m» ` : ''}\x1b[90m[${Dayjs().format('YYYY-MM-DD HH:mm:ss')} \x1b[32mINF\x1b[90m] \x1b[32m${message}`, '\x1b[0m');
  }

  public warn(message: string) {
    console.log(`${this.name !== undefined ? `\x1b[36m${this.name} \x1b[34m» ` : ''}\x1b[90m[${Dayjs().format('YYYY-MM-DD HH:mm:ss')} \x1b[33mWRN\x1b[90m] \x1b[32m${message}`, '\x1b[0m');
  }

  public error(message: string) {
    console.error(`${this.name !== undefined ? `\x1b[36m${this.name} \x1b[34m» ` : ''}\x1b[90m[${Dayjs().format('YYYY-MM-DD HH:mm:ss')} \x1b[31mERR\x1b[90m] \x1b[31m${message}`, '\x1b[0m');
  }
}
