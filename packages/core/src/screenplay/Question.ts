import { inspected } from '../io/inspected';
import { AnswersQuestions, UsesAbilities } from './actor';
import { Adapter, createAdapter } from './model';

/**
 * @desc
 *  Enables the {@link Actor} to query the system under test.
 *
 * @example <caption>A basic Question</caption>
 *  import { Actor, AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 *  import { Ensure, equals } from '@serenity-js/assertions'
 *
 *  const LastItemOf = <T>(list: T[]): Question<T> =>
 *      Question.about('last item from the list', (actor: AnswersQuestions & UsesAbilities) => {
 *          return list[list.length - 1];
 *      });
 *
 *  Actor.named('Quentin').attemptsTo(
 *      Ensure.that(LastItemFrom([1,2,3]), equals(3)),
 *  );
 *
 * @example <caption>A question using the Actor's Ability to do something</caption>
 *  import { AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 *  import { CallAnApi } from '@serenity-js/rest'
 *
 *  const TextOfLastResponseStatus = () =>
 *      Question.about<number>(`the text of the last response status`, actor => {
 *          return CallAnApi.as(actor).mapLastResponse(response => response.statusText);
 *      });
 *
 *  @example <caption>Mapping answers to other questions</caption>
 *  import { Actor, AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 *  import { CallAnApi, LastResponse } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const RequestWasSuccessful = () =>
 *      Question.about<number>(`the text of the last response status`, actor => {
 *          return LastResponse.status().answeredBy(actor) === 200;
 *      });
 *
 *  const actor = Actor.named('Quentin').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(GetRequest.to('/books/0-688-00230-7')),
 *      Ensure.that(RequestWasSuccessful(), isTrue()),
 *  );
 *
 * @see {@link Actor}
 * @see {@link Interaction}
 * @see {@link Ability}
 *
 * @abstract
 */
export abstract class Question<T> {

    /**
     * @desc
     *  Factory method that simplifies the process of defining custom questions.
     *
     * @example
     *  const EnvVariable = (name: string) =>
     *      Question.about(`the ${ name } env variable`, actor => process.env[name])
     *
     * @static
     *
     * @param {string} description
     * @param {function(actor: AnswersQuestions & UsesAbilities): R} body
     *
     * @returns {Question<R>}
     */
    static about<R>(description: string, body: (actor: AnswersQuestions & UsesAbilities) => R): Question<R> & Adapter<Awaited<R>> {
        return createAdapter<R>(new AnonymousQuestion<R>(description, body));
    }

    /**
     * @desc
     *  Checks if the value is a {@link Question}.
     *
     * @static
     *
     * @param {any} maybeQuestion
     *  The value to check
     *
     * @returns {boolean}
     */
    static isAQuestion<T>(maybeQuestion: unknown): maybeQuestion is Question<T> {
        return !! maybeQuestion && !! (maybeQuestion as any).answeredBy;
    }

    /**
     * @desc
     *  Describes the subject of this {@link Question}.
     *
     * @returns {string}
     */
    abstract toString(): string;

    /**
     * @desc
     *  Changes the description of this question's subject.
     *
     * @param {string} subject
     * @returns {Question<T>}
     */
    abstract describedAs(subject: string): this;

    /**
     * @abstract
     * // todo check why api docs are not getting generated for this methods
     */
    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;

    public as<O>(mapping: (answer: Awaited<T>) => Promise<O> | O): Question<Promise<O>> {
        return Question.about<Promise<O>>(`${ this.toString() } as ${ inspected(mapping, { inline: true }) }`, async actor => {
            const answer = (await actor.answer(this)) as Awaited<T>;
            return mapping(answer);
        });
    }
}

/**
 * @package
 */
class AnonymousQuestion<T> extends Question<T> {
    constructor(private subject: string, private body: (actor: AnswersQuestions & UsesAbilities) => T) {
        super();
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): T {
        return this.body(actor);
    }

    /**
     * Changes the description of this question's subject
     * and produces a new instance without mutating the original one.
     *
     * @param {string} subject
     * @returns {Question<T>}
     */
    describedAs(subject: string): this {
        this.subject = subject;

        return this;
    }

    toString(): string {
        return this.subject;
    }
}
