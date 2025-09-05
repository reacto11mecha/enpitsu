import { NativeModule, requireNativeModule } from 'expo';

import { ProctoringModuleEvents } from './ProctoringModule.types';

declare class ProctoringModule extends NativeModule<ProctoringModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ProctoringModule>('ProctoringModule');
