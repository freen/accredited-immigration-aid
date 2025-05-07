import NodeEnvironment from 'jest-environment-node';
import { TextEncoder } from 'util';

export default class CustomTestEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    if (typeof this.global.TextEncoder === 'undefined') {
      this.global.TextEncoder = TextEncoder;
    }
  }
}
