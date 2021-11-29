import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { actorCalled, Answerable, Duration, q, Question, Timestamp } from '@serenity-js/core';
import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { Cookie, CookieMissingError, Navigate } from '@serenity-js/web';
import express = require('express');

describe('Cookie', () => {

    // a tiny express server, setting response cookies
    const cookieCutterApp = express().
        get('/cookie', (request: express.Request & { query: { [key: string]: string }}, response: express.Response) => {

            response.cookie(request.query.name, request.query.value, {
                path:       '/cookie',
                domain:     request.query.domain,
                httpOnly:   !! request.query.httpOnly,
                secure:     !! request.query.secure,
                expires:    request.query.expires && new Date(request.query.expires),
                // https://www.chromestatus.com/feature/5633521622188032
                // sameSite:   !! request.query.secure ? 'None' : undefined,
            }).status(200).send();
        });

    function cookieCutterURLFor(path: Answerable<string>): Question<Promise<string>> {
        return q`${ LocalServer.url() }${ path }`;
    }

    before(() =>
        // Fun fact: Before Cookie Monster ate his first cookie, he believed his name was Sid. You're welcome.
        actorCalled('Sid')
            .whoCan(ManageALocalServer.runningAHttpListener(cookieCutterApp))
            .attemptsTo(StartLocalServer.onRandomPort())
    );

    afterEach(() =>
        actorCalled('Sid').attemptsTo(
            Cookie.deleteAll()
        )
    );

    after(() =>
        actorCalled('Sid').attemptsTo(
            StopLocalServer.ifRunning(),
        )
    );

    describe('over HTTP', () => {

        describe('when working with cookies', () => {
            it('allows the actor to check if a given cookie is set', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=favourite&value=chocolate-chip`)),
                    Ensure.that(Cookie.has('favourite'), isTrue()),
                )
            );

            it('allows the actor to confirm that a given cooke is not set', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=favourite&value=chocolate-chip`)),
                    Ensure.that(Cookie.has('not-so-favourite'), isFalse()),
                )
            );

            it('allows the actor to remove a specific cookie', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=favourite&value=chocolate-chip`)),
                    Ensure.that(Cookie.has('favourite'), isTrue()),
                    Cookie.called('favourite').delete(),
                    Ensure.that(Cookie.has('favourite'), isFalse()),
                )
            );
        });

        describe('when working with the value', () => {

            /** @test {Cookie} */
            /** @test {Cookie#value} */
            it('allows the actor to retrieve it', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=favourite&value=chocolate-chip`)),
                    Ensure.that(Cookie.called('favourite').value(), equals('chocolate-chip')),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#value} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').value(), equals(undefined)),
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').value().toString()).to.equal('<<"favourite" cookie>>.value()');
            });
        });

        describe('when working with the path', () => {

            /** @test {Cookie} */
            /** @test {Cookie#path} */
            it('allows the actor to retrieve it', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('favourite').path(), equals('/cookie')),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#path} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').path(), equals(undefined)),
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').path().toString()).to.equal('<<"favourite" cookie>>.path()');
            });
        });

        describe('when working with the domain', () => {

            /** @test {Cookie} */
            /** @test {Cookie#domain} */
            it('allows the actor to retrieve it', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('favourite').domain(), equals('127.0.0.1')),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#domain} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').domain(), equals(undefined)),
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').domain().toString()).to.equal('<<"favourite" cookie>>.domain()');
            });
        });

        describe('when working with http-only cookies', () => {

            /** @test {Cookie} */
            /** @test {Cookie#isHttpOnly} */
            it('allows the actor to confirm that a cookie is http-only', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('favourite').isHttpOnly(), isFalse()),

                    Navigate.to(cookieCutterURLFor('/cookie?name=second_choice&value=shortbread&httpOnly=true')),
                    Ensure.that(Cookie.called('second_choice').isHttpOnly(), isTrue()),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#isHttpOnly} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').isHttpOnly(), equals(undefined)),
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').isHttpOnly().toString()).to.equal('<<"favourite" cookie>>.isHttpOnly()');
            });
        });

        describe('when working with an expiry date', () => {

            const futureDate = new Timestamp(new Date('3000-01-01T09:00:00.500Z'));

            function tomorrow(): Timestamp {
                const now = new Timestamp();

                return now.plus(Duration.ofDays(1));
            }

            const expectedExpiryDate = tomorrow();

            /** @test {Cookie} */
            /** @test {Cookie#isHttpOnly} */
            it('allows the actor to retrieve it', () =>
                actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor(`/cookie?name=expiring&value=chocolate-chip&expires=${ expectedExpiryDate.toJSON() }`)),
                    Ensure.that(Cookie.called('expiring').expiry().value.getDay(), equals(expectedExpiryDate.value.getDay())),
                )
            );

            /** @test {Cookie} */
            /** @test {Cookie#isHttpOnly} */
            it(`complains it the cookie doesn't exist`, () =>
                expect(actorCalled('Sid').attemptsTo(
                    Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                    Ensure.that(Cookie.called('not-so-favourite').expiry(), equals(undefined)),
                )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
            );

            /** @test {Cookie} */
            it('provides a sensible description of the question being asked', () => {
                expect(Cookie.called('favourite').expiry().toString()).to.equal('<<"favourite" cookie>>.expiry()');
            });
        });
    });

    describe('when working with secure cookies', () => {

        /** @test {Cookie} */
        /** @test {Cookie#isSecure} */
        it('allows the actor to confirm that a cookie is not secure', () =>
            actorCalled('Sid').attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.called('favourite').isSecure(), isFalse()),
            )
        );

        /** @test {Cookie} */
        /** @test {Cookie#isSecure} */
        it('allows the actor to confirm that a cookie is secure', () =>
            actorCalled('Sid').attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip&secure=1')),
                Ensure.that(Cookie.called('favourite').isSecure(), isTrue()),
            )
        );

        /** @test {Cookie} */
        /** @test {Cookie#isSecure} */
        it(`complains it the cookie doesn't exist`, () =>
            expect(actorCalled('Sid').attemptsTo(
                Navigate.to(cookieCutterURLFor('/cookie?name=favourite&value=chocolate-chip')),
                Ensure.that(Cookie.called('not-so-favourite').isSecure(), equals(undefined)),
            )).to.be.rejectedWith(CookieMissingError, `Cookie 'not-so-favourite' not set`)
        );

        /** @test {Cookie} */
        it('provides a sensible description of the question being asked', () => {
            expect(Cookie.called('favourite').isSecure().toString()).to.equal('<<"favourite" cookie>>.isSecure()');
        });
    });
});
