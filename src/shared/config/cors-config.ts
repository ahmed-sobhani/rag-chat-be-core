import { environment } from './environment';

export const corsConfig = () => {
  if (environment.cors.enabled) {
    return {
      origin: environment.cors.origin?.split(','),
      methods: '*',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  }
  return true;
};
