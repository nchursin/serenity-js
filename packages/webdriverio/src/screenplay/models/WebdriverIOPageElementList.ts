import { LogicError } from '@serenity-js/core';
import { PageElement, PageElementList, PageElementLocation } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIOPageElement } from './WebdriverIOPageElement';

export class WebdriverIOPageElementList implements PageElementList {
    constructor(
        private readonly browser: wdio.Browser<'async'>,
        private readonly elements: wdio.ElementArray,
        private readonly elementLocation: PageElementLocation,
    ) {
    }

    location(): PageElementLocation {
        return this.elementLocation;
    }

    count(): Promise<number> {
        return Promise.resolve(this.elements.length);
    }

    first(): PageElement {
        return this.elementAt(0);
    }

    last(): PageElement {
        return this.elementAt(this.elements.length - 1);
    }

    get(index: number): PageElement {
        return this.elementAt(index);
    }

    private elementAt(index: number): WebdriverIOPageElement {
        if (! this.elements[index]) {
            throw new LogicError(`There's no item at index ${ index } within elements located ${ this.elementLocation } `);
        }

        return new WebdriverIOPageElement(this.browser, this.elements[index], this.elementLocation)
    }

    map<O>(fn: (element: PageElement, index?: number, elements?: PageElementList) => Promise<O> | O): Promise<O[]> {
        return Promise.all(
            this.elements.map((element, index) =>
                // todo: is this.elementLocation reasonable? what does WDIO return in element.selector?
                fn(new WebdriverIOPageElement(this.browser, element, this.elementLocation), index, this)
            )
        );
    }

    filter(fn: (element: PageElement, index?: number) => boolean): WebdriverIOPageElementList {
        const matching = this.elements.filter(
            (element: wdio.Element<'async'>, index: number) => fn(new WebdriverIOPageElement(this.browser, element, this.elementLocation), index)
        ) as wdio.ElementArray;

        matching.selector   = this.elements.selector;
        matching.parent     = this.elements.parent;
        matching.foundWith  = this.elements.foundWith;
        matching.props      = this.elements.props;

        return new WebdriverIOPageElementList(this.browser, matching, this.elementLocation);
    }

    forEach(fn: (element: PageElement, index?: number, elements?: PageElementList) => Promise<void> | void): Promise<void> {
        return this.elements.reduce((previous: Promise<void>, element: wdio.Element<'async'>, index: number) => {
            return previous.then(() => fn(new WebdriverIOPageElement(this.browser, element, this.elementLocation), index, this));
        }, Promise.resolve());
    }
}
