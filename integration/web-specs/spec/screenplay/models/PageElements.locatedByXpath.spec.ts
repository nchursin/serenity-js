import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { Navigate, PageElements } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';

/** @test {PageElements} */
describe('PageElements', () => {

    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

    describe('when locating elements', () => {

        describe('by XPath', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-elements/by_xpath.html'),
                ));

            it('generates a description for PageElements without a custom description', () => {
                expect(PageElements.locatedByXPath('//ul/li[contains(text(), "Coffee")]').toString())
                    .to.equal(`page elements located by xpath ('//ul/li[contains(text(), "Coffee")]')`)
            });

            it('generates a description for PageElements without a custom description, where the selector and/or text are provided as questions', () => {
                expect(
                    PageElements.locatedByXPath(question('my selector', '//ul/li[contains(text(), "Coffee")]')).toString()
                ).to.equal(`page elements located by xpath (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElements.locatedByXPath('//ul/li[contains(text(), "Coffee")]').describedAs('shopping list items').toString())
                    .to.equal(`shopping list items`)
            });

            it('can locate elements by xpath', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElements.locatedByXPath('//ul/li[contains(text(), "Coffee")]').count(), equals(1)),
                ));

            it('can locate elements by xpath, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElements.locatedByXPath(question('my selector', '//ul/li[contains(text(), "Coffee")]')).count(),
                        equals(1)
                    ),
                ));

            it(`can tell when elements are not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElements.locatedByXPath('//input').count(), equals(0)),
                ));
        });
    });
});
