export type AppConfig = {
  environmentName: string;
  frontendDomain?: string;
};

export function loadAppConfig(): AppConfig {
  return {
    environmentName: process.env.ENV_NAME ?? 'dev',
    frontendDomain: process.env.FRONTEND_DOMAIN
  };
}
