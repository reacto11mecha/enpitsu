// Reexport the native module. On web, it will be resolved to ProctoringModule.web.ts
// and on native platforms to ProctoringModule.ts
export { default } from './ProctoringModule';
export { default as ProctoringModuleView } from './ProctoringModuleView';
export * from  './ProctoringModule.types';
