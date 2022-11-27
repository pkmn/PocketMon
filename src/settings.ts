export type Theme = 'system' | 'light' | 'dark';

interface Settings {
  theme: Theme;
}

export const Settings = new class {
  private readonly data!: Settings;

  constructor() {
    this.data = {theme: 'system', ...JSON.parse(localStorage.getItem('settings')!)};
  }

  get(key: keyof Settings): Settings[keyof Settings] {
    return this.data[key];
  }

  set(key: keyof Settings, value: Settings[keyof Settings]): Settings[keyof Settings] {
    this.data[key] = value;
    localStorage.setItem('settings', JSON.stringify(this.data));
    return value;
  }
};
