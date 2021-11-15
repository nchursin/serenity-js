import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { chromium, Page } from 'playwright';

import { BrowseTheWeb, Clear, Close, Value } from '../../../src';
import { by, Target } from '../../../src';

const { $ } = Target;

describe("'Clear' interaction", () => {
    const actor = actorCalled('Clara').whoCan(BrowseTheWeb.using(chromium));

    beforeEach(async () => {
        const page: Page = await (actor.abilityTo(BrowseTheWeb) as any).page();
        page.setContent(`
        <html lang="">
            <input type="text" name="example" id="example" value="random text" />
        </html>`);
    });

    afterEach(() => {
        actor.attemptsTo(Close.browser());
        serenity.announce(new TestRunFinishes());
    });

    it('clears value in input', async () => {
        await actor.attemptsTo(
            Ensure.that(Value.of($(by.id('example'))), equals('random text')),
            Clear.theValueOf($(by.id('example'))),
            Ensure.that(Value.of($(by.id('example'))), equals(''))
        );
    })
});
