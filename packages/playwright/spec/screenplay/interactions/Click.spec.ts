import 'mocha';

import { Ensure, not } from '@serenity-js/assertions';
import { actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { chromium, Page } from 'playwright';

import { isVisible } from '../../../src';
import { BrowseTheWeb, by, Click, Close, Target } from '../../../src';

describe("'Click' interaction", () => {
    const actor = actorCalled('Mike').whoCan(BrowseTheWeb.using(chromium));

    beforeEach(async () => {
        const page: Page = await (actor.abilityTo(BrowseTheWeb) as any).page();
        page.setContent(`
        <html lang="">
            <button
                    id="to-hide"
                    onclick="
                            document.getElementById('to-hide').style.display = 'none';"
            >
                Click me!
            </button>
        </html>`);
    });

    afterEach(() => {
        actor.attemptsTo(Close.browser());
        serenity.announce(new TestRunFinishes());
    });

    it('clicks element', async () => {
        const theButton = Target.$(by.id('to-hide'));
        await actor.attemptsTo(
            Ensure.that(theButton, isVisible()),
            Click.on(theButton),
            Ensure.that(theButton, not(isVisible())),
        )
    });
});

