import { Adapter, Expectation, ExpectationMet, ExpectationOutcome, LogicError, Question } from '@serenity-js/core';
import { URL } from 'url';

import { BrowseTheWeb } from '../abilities';

export abstract class Page {
    static current(): Question<Promise<Page>> & Adapter<Page> {
        return Question.about<Promise<Page>>('current page', actor => {
            return BrowseTheWeb.as(actor).currentPage();
        });
    }

    static whichName(expectation: Expectation<any, string>): Question<Promise<Page>> & Adapter<Page> {
        return Question.about(`page which name does ${ expectation }`, async actor => {
            const pages     = await BrowseTheWeb.as(actor).allPages();
            const matcher   = await actor.answer(expectation);

            return Page.findMatchingPage(
                `name does ${ expectation }`,
                pages,
                page => page.name().then(matcher)
            );
        });
    }

    static whichTitle(expectation: Expectation<any, string>): Question<Promise<Page>> & Adapter<Page> {
        return Question.about(`page which title does ${ expectation }`, async actor => {
            const pages     = await BrowseTheWeb.as(actor).allPages();
            const matcher   = await actor.answer(expectation);

            return Page.findMatchingPage(
                `title does ${ expectation }`,
                pages,
                page => page.title().then(title => {
                    return matcher(title);
                })
            );
        });
    }

    static whichUrl(expectation: Expectation<any, string>): Question<Promise<Page>> & Adapter<Page> {
        return Question.about(`page which URL does ${ expectation }`, async actor => {
            const pages     = await BrowseTheWeb.as(actor).allPages();
            const matcher   = await actor.answer(expectation);

            return Page.findMatchingPage(
                `url does ${ expectation }`,
                pages,
                page => page.url().then(url => matcher(url.toString()))
            );
        });
    }

    private static async findMatchingPage(expectationDescription: string, pages: Page[], matcher: (page: Page) => Promise<ExpectationOutcome<any, any>>): Promise<Page> {
        for (const page of pages) {
            const outcome  = await matcher(page);

            if (outcome instanceof ExpectationMet) {
                return page;
            }
        }

        throw new LogicError(`Couldn't find a page which ${ expectationDescription }`);
    }

    constructor(
        protected readonly handle: string,
    ) {
    }

    /**
     * @desc
     *  Retrieves the document title of the current top-level browsing context, equivalent to calling `document.title`.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title
     *
     * @returns {Promise<string>}
     */
    abstract title(): Promise<string>;

    /**
     * @desc
     *  Retrieves the URL of the current top-level browsing context.
     *
     * @returns {Promise<URL>}
     */
    abstract url(): Promise<URL>;

    /**
     * @desc
     *  Retrieves the name of the current top-level browsing context.
     *
     * @returns {Promise<string>}
     */
    abstract name(): Promise<string>;

    /**
     * @desc
     *  Checks if a given window / tab / page is open and can be switched to.
     *
     * @returns {Promise<string>}
     */
    abstract isPresent(): Promise<boolean>;

    /**
     * @desc
     *  Returns the actual viewport size available for the given page,
     *  excluding any scrollbars.
     *
     * @returns {Promise<{ width: number, height: number }>}
     */
    abstract viewportSize(): Promise<{ width: number, height: number }>;

    /**
     *
     * @param size
     */
    abstract setViewportSize(size: { width: number, height: number }): Promise<void>;

    /**
     * @desc
     *  Switches the current top-level browsing context to the given page
     *
     * @returns {Promise<void>}
     */
    abstract switchTo(): Promise<void>;

    /**
     * @desc
     *  Closes the given page.
     *
     * @returns {Promise<void>}
     */
    abstract close(): Promise<void>;

    /**
     * @desc
     *  Closes any open pages, except for this one.
     *
     * @returns {Promise<void>}
     */
    abstract closeOthers(): Promise<void>;

    toString(): string {
        return `page (handle=${ this.handle })`;
    }
}
