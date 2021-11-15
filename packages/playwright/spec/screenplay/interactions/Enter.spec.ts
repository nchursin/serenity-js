import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, serenity } from '@serenity-js/core';
import { TestRunFinishes } from '@serenity-js/core/lib/events';
import { chromium, Page } from 'playwright';

import { BrowseTheWeb, Close, Enter, Value } from '../../../src';
import { by, Target } from '../../../src';

const { $ } = Target;

describe("'Enter' interaction", () => {
    const actor = actorCalled('Phil').whoCan(BrowseTheWeb.using(chromium));

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

    it('enters value', async () => {
        const theInput = $(by.id('example'));
        await actor.attemptsTo(
            Ensure.that(Value.of($(by.id('example'))), equals('random text')),
            Enter.theValue('Hi!').into(theInput),
            Ensure.that(Value.of(theInput), equals('Hi!')),
            Enter.theValue('').into(theInput),
            Ensure.that(Value.of(theInput), equals(''))
        );
    })
});
