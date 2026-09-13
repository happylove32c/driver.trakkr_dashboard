import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ng.trakkr.driver',
  appName: 'TRAKKR Driver',
  webDir: 'out',
  server: {
    url: 'https://driver.trakkr.ng',
    cleartext: true,
  },
}

export default config
