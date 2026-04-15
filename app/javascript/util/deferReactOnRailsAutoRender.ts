/******************************************************************************
 * Workaround to prevent react_on_rails' clientStartup from scheduling an
 * automatic setTimeout(renderInit) when the module first loads.  We will call
 * ReactOnRails.reactOnRailsPageLoaded() ourselves once translations have been
 * loaded and components have been registered.
 *
 * Source code:
 * https://github.com/shakacode/react_on_rails/blob/de5b53a274ebe32106f0bade844e584d4c555285/packages/react-on-rails/src/clientStartup.ts
 *
 * This module MUST be imported before "react-on-rails" so that the
 * flag is already set when clientStartup checks it.
 *
 * Why we need to do this:
 * There is a race condition between our async loadTranslations().then(...)
 * and react_on_rails' renderInit(). Before the upgrade to shakapacker v9,
 * our load translation and register component processes would beat
 * renderInit(). After upgrading to v9, renderInit() happens before component
 * registration, so a blank page is shown.
 * Ideally we would move component registration out of the "then" callback
 * so that registration happens synchronously. But then translations would
 * not get loaded in time for rendering. Therefore we must resort to manually
 * deferring react_on_rails' render process.
 *****************************************************************************/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).__REACT_ON_RAILS_EVENT_HANDLERS_RAN_ONCE__ = true
