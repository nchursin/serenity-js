import 'mocha';

import { Ensure, isFalse, isTrue } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { Navigate, PageElement } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';

/** @test {PageElement} */
describe('PageElement', () => {

    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

    describe('when locating an element', () => {

        describe('by tag name', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_tag_name.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.locatedByTagName('button').toString())
                    .to.equal(`page element located by tag name ('button')`)
            });

            it('generates a description for a PageElement without a custom description, where the selector is provided as question', () => {
                expect(PageElement.locatedByTagName(question('my selector', 'button')).toString())
                    .to.equal(`page element located by tag name (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.locatedByTagName('button').describedAs('button').toString())
                    .to.equal(`button`)
            });

            it('can locate an element by css', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.locatedByTagName('button').isPresent(), isTrue()),
                ));

            it('can locate an element by css, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.locatedByTagName(question('my selector', 'button')).isPresent(), isTrue()),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(PageElement.locatedByTagName('input').isPresent(), isFalse()),
                ));
        });
    });
});
