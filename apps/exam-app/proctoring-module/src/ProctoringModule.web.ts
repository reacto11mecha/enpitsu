import { registerWebModule, NativeModule } from 'expo';

import { ProctoringModuleEvents } from './ProctoringModule.types';

class ProctoringModule extends NativeModule<ProctoringModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ProctoringModule, 'ProctoringModule');
