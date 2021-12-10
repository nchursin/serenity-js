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

        describe('by css', () => {

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-elements/by_css.html'),
                ));

            it('generates a description for PageElements without a custom description', () => {
                expect(PageElements.locatedByCss('ul > li.todo').toString())
                    .to.equal(`page elements located by css ('ul > li.todo')`)
            });

            it('generates a description for PageElements without a custom description, where the selector is provided as question', () => {
                expect(PageElements.locatedByCss(question('my selector', 'ul > li.todo')).toString())
                    .to.equal(`page elements located by css (<<my selector>>)`)
            });

            it('uses a custom description when provided', () => {
                expect(PageElements.locatedByCss('ul > li.todo').describedAs('outstanding shopping list item').toString())
                    .to.equal(`outstanding shopping list item`)
            });

            it('can locate elements by css', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElements.locatedByCss('ul > li.todo').map(element => element.text()),
                        equals(['Coconut milk', 'Coffee'])
                    ),
                ));

            it('can locate elements by css, where the selector is provided as question', () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElements.locatedByCss(question('my selector', 'ul > li.todo')).count(),
                        equals(2)
                    ),
                ));

            it(`can tell when an element is not present`, () =>
                actorCalled('Elle').attemptsTo(
                    Ensure.that(
                        PageElements.locatedByCss('ul > li.invalid').count(),
                        equals(0)
                    ),
                ));
        });
    });
});
