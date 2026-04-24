import { Capacitor } from '@capacitor/core';
import { trackEvent } from '../telemetry/analytics';

export type AdOutcome = 'granted' | 'dismissed' | 'error';

export interface AdConsentState {
  readonly personalized: boolean;
  readonly childDirected: boolean;
  readonly underAgeOfConsent: boolean;
}

export interface AdProvider {
  readonly init: (consent: AdConsentState) => Promise<void>;
  readonly showRewardedAd: (placement: string) => Promise<AdOutcome>;
  readonly preloadRewarded: () => Promise<void>;
  readonly setConsent: (consent: AdConsentState) => Promise<void>;
}

const DEV_GRANT_DELAY_MS = 400;

class DevStubAdProvider implements AdProvider {
  async init(_consent: AdConsentState): Promise<void> {
    // no-op
  }

  async showRewardedAd(placement: string): Promise<AdOutcome> {
    await new Promise<void>(resolve => setTimeout(resolve, DEV_GRANT_DELAY_MS));
    trackEvent({ kind: 'ad_shown', placement, outcome: 'granted' });
    return 'granted';
  }

  async preloadRewarded(): Promise<void> {
    // no-op
  }

  async setConsent(_consent: AdConsentState): Promise<void> {
    // no-op
  }
}

// -----------------------------------------------------------------------------
// To ship real rewarded ads:
//   npm install @capacitor-community/admob
//   npx cap sync
// Then implement an AdMobAdProvider and branch on Capacitor.isNativePlatform()
// in selectProvider() below.
// -----------------------------------------------------------------------------

function selectProvider(): AdProvider {
  void Capacitor.isNativePlatform();
  return new DevStubAdProvider();
}

export const adProvider: AdProvider = selectProvider();

export const defaultKidsConsent: AdConsentState = {
  personalized: false,
  childDirected: true,
  underAgeOfConsent: true,
};
