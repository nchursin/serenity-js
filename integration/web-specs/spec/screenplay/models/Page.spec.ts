import 'mocha';

import { actorCalled, LogicError, Note, TakeNote } from '@serenity-js/core';
import { Click, Navigate, Page, PageElement, Text, Wait } from '@serenity-js/web';
import { expect } from '@integration/testing-tools';
import { endsWith, Ensure, equals, includes, isTrue, not, startsWith } from '@serenity-js/assertions';
import { URL } from 'url';

/** @test {Page} */
describe('Page', () => {

    describe('when managing the browsing context', () => {

        const MainPage = {
            title:          'Main page title',
            heading:        Text.of(PageElement.locatedByCss('h1').describedAs('heading')),
            newTabLink:     PageElement.locatedById('new-tab-link').describedAs('new tab link'),
            newPopUpLink:   PageElement.locatedById('new-popup-link').describedAs('new pop-up link'),
        };

        const NewTab = {
            expectedTitle:  'New tab title',
            heading:        Text.of(PageElement.locatedByCss('h1').describedAs('heading')),
        };

        const Popup = {
            expectedName:   'popup-window',         // defined in main_page.html
            heading:        Text.of(PageElement.locatedByCss('h1').describedAs('heading')),
        };

        beforeEach(() =>
            actorCalled('Bernie').attemptsTo(
                Navigate.to('/screenplay/models/page/main_page.html'),
            ));

        afterEach(() =>
            actorCalled('Bernie').attemptsTo(
                Page.whichUrl(includes(`/screenplay/models/page/main_page.html`)).switchTo(),
                Page.current().closeOthers()
            ));

        /** @test {Page.current()} */
        describe('current()', () => {

            describe('title()', () => {

                /** @test {Page#title()} */
                it('returns the value of the <title /> tag of the current page', async () => {
                    const page  = await Page.current().answeredBy(actorCalled('Bernie'));
                    const title = await page.title();

                    expect(title).to.equal('Main page title');
                });

                /** @test {Page#title()} */
                it('is accessible via an Adapter', async () =>
                    actorCalled('Bernie').attemptsTo(
                        Ensure.that(Page.current().title(), equals(`Main page title`)),
                    ));
            });

            describe('url()', () => {

                /** @test {Page#title()} */
                it('returns the URL of the current page', async () => {
                    const page      = await Page.current().answeredBy(actorCalled('Bernie'));
                    const url: URL  = await page.url();

                    expect(url.pathname).to.equal('/screenplay/models/page/main_page.html');
                });

                /** @test {Page#url()} */
                it('is accessible via an Adapter', async () =>
                    actorCalled('Bernie').attemptsTo(
                        Ensure.that(Page.current().url().pathname, equals(`/screenplay/models/page/main_page.html`)),
                    ));

                /**
                 * @test {Page#url()}
                 * @see https://github.com/serenity-js/serenity-js/issues/273
                 */
                it(`correctly represents URLs containing special characters`, () =>
                    actorCalled('Bernie').attemptsTo(
                        Navigate.to(`/screenplay/models/page/main_page.html#example`),

                        Ensure.that(Page.current().url().hash, equals(`#example`)),
                    ));
            });
        });

        describe('whichName(expectation)', () => {

            beforeEach(() =>
                actorCalled('Bernie').attemptsTo(
                    Navigate.to('/screenplay/models/page/main_page.html'),
                    Click.on(MainPage.newPopUpLink),
                    Wait.until(Page.whichName(equals(Popup.expectedName)).isPresent(), isTrue()),
                    Page.whichTitle(equals(MainPage.title)).switchTo(),
                ));

            it('provides access to another browsing context identified by name', () =>
                actorCalled('Bernie').attemptsTo(
                    Ensure.that(Page.whichName(startsWith('popup')).name(), equals(Popup.expectedName)),
                ));

            it('automatically switches back to the original context when the action is finished', () =>
                actorCalled('Bernie').attemptsTo(
                    Ensure.that(Page.whichName(startsWith('popup')).name(), equals(Popup.expectedName)),
                    Ensure.that(MainPage.heading, equals('Main page')),
                ));

            it('complains if the page the actor wants to switch todoes not exist', async () =>
                expect(actorCalled('Bernie').attemptsTo(
                    Ensure.that(Page.whichName(startsWith('invalid')).title(), equals(`this won't pass`)),
                )).to.be.rejectedWith(LogicError, `Couldn't find a page which name does start with 'invalid'`),
            );
        });

    });

    describe('when managing the viewport size', () => {

        describe('current()', () => {

            describe('viewport', () => {

                const RenderedViewportSize = {
                    width:  Text.of(PageElement.locatedById('viewport-width').describedAs('viewport width')).as(Number),
                    height: Text.of(PageElement.locatedById('viewport-height').describedAs('viewport height')).as(Number),
                };

                const viewportSize = {
                    small:  { width: 640, height: 480 },
                    medium: { width: 667, height: 375 },    // iPhone 8, something in the middle, but still representative of what people might use
                    large:  { width: 800, height: 600 },
                }

                before(() =>
                    actorCalled('Bernie').attemptsTo(
                        Navigate.to('/screenplay/models/page/viewport_size.html'),
                        TakeNote.of(Page.current().viewportSize()).as('original viewport size')
                    ));

                beforeEach(() =>
                    actorCalled('Bernie').attemptsTo(
                        Page.current().setViewportSize(Note.of('original viewport size')),
                    ));

                after(() =>
                    actorCalled('Bernie').attemptsTo(
                        Page.current().setViewportSize(Note.of('original viewport size')),
                    ));

                describe('setViewportSize()', () => {

                    /** @test {Page.current()} */
                    /** @test {Page#viewportSize()} */
                    /** @test {Page#setViewportSize()} */
                    it('allows the actor to set the size of the viewport', () =>
                        actorCalled('Bernie').attemptsTo(
                            Page.current().setViewportSize(viewportSize.small)
                                .describedAs(`#actor resizes viewport to ${ viewportSize.small.width }x${ viewportSize.small.height }`),

                            Ensure.that(RenderedViewportSize.height, equals(viewportSize.small.height)),
                            Ensure.that(RenderedViewportSize.width,  equals(viewportSize.small.width)),
                        )
                    );

                    /** @test {Page.current()} */
                    /** @test {Page#viewportSize()} */
                    /** @test {Page#setViewportSize()} */
                    it('allows the actor to increase the size of the viewport', () =>
                        actorCalled('Bernie').attemptsTo(
                            Page.current().setViewportSize(viewportSize.small)
                                .describedAs(`#actor resizes viewport to ${ viewportSize.small.width }x${ viewportSize.small.height }`),

                            Ensure.that(RenderedViewportSize.height, equals(viewportSize.small.height)),
                            Ensure.that(RenderedViewportSize.width,  equals(viewportSize.small.width)),

                            Page.current().setViewportSize(viewportSize.medium)
                                .describedAs(`#actor resizes viewport to ${ viewportSize.medium.width }x${ viewportSize.medium.height }`),

                            Ensure.that(RenderedViewportSize.height, equals(viewportSize.medium.height)),
                            Ensure.that(RenderedViewportSize.width,  equals(viewportSize.medium.width)),
                        )
                    );

                    /** @test {Page.current()} */
                    /** @test {Page#viewportSize()} */
                    /** @test {Page#setViewportSize()} */
                    it('allows the actor to decrease the size of the viewport', () =>
                        actorCalled('Bernie').attemptsTo(
                            Page.current().setViewportSize(viewportSize.large)
                                .describedAs(`#actor resizes viewport to ${ viewportSize.large.width }x${ viewportSize.large.height }`),

                            Ensure.that(RenderedViewportSize.height, equals(viewportSize.large.height)),
                            Ensure.that(RenderedViewportSize.width,  equals(viewportSize.large.width)),

                            Page.current().setViewportSize(viewportSize.medium)
                                .describedAs(`#actor resizes viewport to ${ viewportSize.medium.width }x${ viewportSize.medium.height }`),

                            Ensure.that(RenderedViewportSize.height, equals(viewportSize.medium.height)),
                            Ensure.that(RenderedViewportSize.width,  equals(viewportSize.medium.width)),
                        )
                    );
                });

                describe('viewportSize()', () => {

                    it('returns the real size of the viewport', () =>
                        actorCalled('Bernie').attemptsTo(
                            Ensure.that(Page.current().viewportSize(), not(equals(viewportSize.medium))),

                            Page.current().setViewportSize(viewportSize.medium)
                                .describedAs(`#actor resizes viewport to ${ viewportSize.medium.width }x${ viewportSize.medium.height }`),

                            Ensure.that(Page.current().viewportSize(), equals(viewportSize.medium)),
                        )
                    );
                });
            });
        });
    });

    describe('when describing the browsing context', () => {

        describe('current().toString()', () => {

            /** @test {Page.current()} */
            /** @test {Page#toString()} */
            it('returns a human-readable description of the page', () => {
                const description = Page.current().toString();

                expect(description).to.equal('current page');
            });
        });

        describe('whichName(expectation).toString()', () => {

            /** @test {Page.whichName()} */
            /** @test {Page#toString()} */
            it('returns a human-readable description of the page', () => {
                const description = Page.whichName(equals('pop-up')).toString();

                expect(description).to.equal(`page which name does equal 'pop-up'`);
            });
        });

        describe('whichTitle(expectation).toString()', () => {

            /** @test {Page.whichTitle()} */
            /** @test {Page#toString()} */
            it('returns a human-readable description of the page', () => {
                const description = Page.whichTitle(equals('Serenity/JS Website')).toString();

                expect(description).to.equal(`page which title does equal 'Serenity/JS Website'`);
            });
        });

        describe('whichUrl(expectation).toString()', () => {

            /** @test {Page.whichUrl()} */
            /** @test {Page#toString()} */
            it('returns a human-readable description of the page', () => {
                const description = Page.whichUrl(endsWith('/articles/example.html')).toString();

                expect(description).to.equal(`page which URL does end with '/articles/example.html'`);
            });
        });
    });

    // todo: frames
});
