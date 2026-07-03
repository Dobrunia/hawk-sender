import type { PageIntegrations } from '@/shared/types/integrations'

type WindowLike = Record<string, unknown>

export function hasHawkRelease(windowObj: WindowLike): boolean {
  return 'HAWK_RELEASE' in windowObj && windowObj.HAWK_RELEASE != null
}

export function hasSentry(windowObj: WindowLike): boolean {
  return (
    ('Sentry' in windowObj && windowObj.Sentry != null)
    || ('__SENTRY__' in windowObj && windowObj.__SENTRY__ != null)
  )
}

export function checkIntegrations(windowObj: WindowLike): PageIntegrations {
  return {
    hawk: hasHawkRelease(windowObj),
    sentry: hasSentry(windowObj),
  }
}

/** Runs in page MAIN world — logic must match checkIntegrations */
export function probeIntegrationsInPage(): PageIntegrations {
  const windowObj = window as unknown as WindowLike

  return {
    hawk: 'HAWK_RELEASE' in windowObj && windowObj.HAWK_RELEASE != null,
    sentry:
      ('Sentry' in windowObj && windowObj.Sentry != null)
      || ('__SENTRY__' in windowObj && windowObj.__SENTRY__ != null),
  }
}
