import 'mocha';

import { expect } from '@integration/testing-tools';
import { endsWith, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Duration, q, TestCompromisedError } from '@serenity-js/core';
import { CreatePage, DeletePage } from '../../pages';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { ChangeApiConfig } from '@serenity-js/rest';
import { by, Navigate, Target, Text } from '../../../src';

/** @test {Navigate} */
describe('Navigate', () => {

    before(() =>
        actorCalled('Wendy').attemptsTo(
            StartLocalServer.onRandomPort(),
            ChangeApiConfig.setUrlTo(LocalServer.url()),
        ));

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            CreatePage('hello_world', `
                    <html>
                        <body>
                            <h1>Hello World</h1>
                        </body>
                    </html>
                `)
        ));

    afterEach(() =>
        actorCalled('Wendy').attemptsTo(
            DeletePage('hello_world')
        ));

    after(() =>
        actorCalled('Wendy').attemptsTo(
            StopLocalServer.ifRunning(),
        ));

    describe('to(url)', () => {

        /** @test {Navigate.to} */
        it('allows the actor to navigate to a desired destination', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to(q `${ LocalServer.url() }/pages/hello_world`),

                Ensure.that(Text.of(Target.the('heading').located(by.css('h1'))), equals('Hello World')),
            ));

        /** @test {Navigate.to} */
        it(`marks the test as compromised if the desired destination can't be reached`, () =>
            expect(actorCalled('Bernie').attemptsTo(
                Navigate.to('invalid-destination'),
            )).
            to.be.rejectedWith(TestCompromisedError, `Couldn't navigate to invalid-destination`).
            then((error: TestCompromisedError) => {
                expect(error.cause).to.be.instanceOf(Error)
                expect(error.cause.message).to.include('net::ERR_NAME_NOT_RESOLVED at http://invalid-destination/')
            })
        );

        /** @test {Navigate.to} */
        /** @test {Navigate#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Navigate.to(`https://serenity-js.org`).toString())
                .to.equal(`#actor navigates to 'https://serenity-js.org'`);
        });
    });

    // describe('back', () => {
    //
    //     /** @test {Navigate.back} */
    //     it('allows the actor to navigate back in the browser history', () => actorCalled('Bernie').attemptsTo(
    //         Navigate.to(`chrome://version/`),
    //         Navigate.to(`chrome://accessibility/`),
    //
    //         Navigate.back(),
    //
    //         Ensure.that(Website.url(), endsWith('version/')),
    //     ));
    //
    //     /** @test {Navigate.back} */
    //     /** @test {Navigate#toString} */
    //     it('provides a sensible description of the interaction being performed', () => {
    //         expect(Navigate.back().toString())
    //             .to.equal(`#actor navigates back in the browser history`);
    //     });
    // });
    //
    // describe('forward', () => {
    //
    //     /** @test {Navigate.forward} */
    //     it('allows the actor to navigate forward in the browser history', () => actorCalled('Bernie').attemptsTo(
    //         Navigate.to(`chrome://version/`),
    //         Navigate.to(`chrome://accessibility/`),
    //
    //         Navigate.back(),
    //         Navigate.forward(),
    //
    //         Ensure.that(Website.url(), endsWith('accessibility/')),
    //     ));
    //
    //     /** @test {Navigate.forward} */
    //     /** @test {Navigate#toString} */
    //     it('provides a sensible description of the interaction being performed', () => {
    //         expect(Navigate.forward().toString())
    //             .to.equal(`#actor navigates forward in the browser history`);
    //     });
    // });
    //
    // describe('reloadPage', () => {
    //
    //     /** @test {Navigate.reloadPage} */
    //     it('allows the actor to navigate to a desired destination', () => actorCalled('Bernie').attemptsTo(
    //         Navigate.to(pageFromTemplate(`
    //             <html>
    //                 <body>
    //                     <h1 id="h">Hello!</h1>
    //                 </body>
    //                 <script>
    //                     if(window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
    //                         document.getElementById('h').textContent = 'Reloaded'
    //                     }
    //                 </script>
    //             </html>
    //         `)),
    //
    //         Navigate.reloadPage(),
    //
    //         Ensure.that(Text.of(Target.the('heading').located(by.id('h'))), equals('Reloaded')),
    //     ));
    //
    //     /** @test {Navigate.reloadPage} */
    //     /** @test {Navigate#toString} */
    //     it('provides a sensible description of the interaction being performed', () => {
    //         expect(Navigate.reloadPage().toString())
    //             .to.equal(`#actor reloads the page`);
    //     });
    // });
});
