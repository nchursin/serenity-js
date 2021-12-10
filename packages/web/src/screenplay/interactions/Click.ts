import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { PageElement } from '../models';
import { PageElementInteraction } from './PageElementInteraction';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  [click](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event) on a given Web element.
 *
 * @example <caption>Example widget</caption>
 *  <form>
 *    <input type="text" name="example" id="example" />
 *  </form>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { by, Target } from '@serenity-js/webdriverio';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .located(by.id('example'));
 *  }
 *
 * @example <caption>Clicking on an element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Click, isSelected } from '@serenity-js/webdriverio';
 *  import { Ensure } from '@serenity-js/assertions';
 *
 *  actorCalled('Chloé')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Click.on(Form.exampleInput),
 *          Ensure.that(Form.exampleInput, isSelected()),
 *      );
 *
 * @see {@link BrowseTheWeb}
 * @see {@link Target}
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link isSelected}
 *
 * @extends {ElementInteraction}
 */
export class Click extends PageElementInteraction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Answerable<PageElement>} pageElement
     *  The element to be clicked on
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static on(pageElement: Answerable<PageElement>): Interaction {
        return new Click(pageElement);
    }

    /**
     * @param {Answerable<PageElement>} element
     *  The element to be clicked on
     */
    constructor(private readonly element: Answerable<PageElement>) {
        super(formatted `#actor clicks on ${ element }`);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     *  An {@link @serenity-js/core/lib/screenplay/actor~Actor} to perform this {@link @serenity-js/core/lib/screenplay~Interaction}
     *
     * @returns {PromiseLike<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const element = await this.resolve(actor, this.element);
        await element.scrollIntoView();
        return element.click();
    }
}
