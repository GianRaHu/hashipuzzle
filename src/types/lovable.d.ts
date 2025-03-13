declare global {
  interface Window {
    gptengineer?: {
      save: (key: string, value: any) => Promise<void>;
      load: (key: string) => Promise<any>;
      ready: () => Promise<void>;
    };
  }
}

export {};
