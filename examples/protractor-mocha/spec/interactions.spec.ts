import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, actorInTheSpotlight, Check, engage, Interaction } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { UseAngular } from '@serenity-js/protractor';
import { Navigate, Website } from '@serenity-js/web';
import { Actors } from './support/Actors';

/**
 * This example demonstrates retrying a failed scenario,
 * with the number of retries configured in protractor.conf.js.
 */
describe('Interaction flow', () => {

    beforeEach(() => engage(new Actors()));

    let counter = 1;

    const FailTheTest = () =>
        Interaction.where(`#actor deliberately fails the test`, actor => {
            throw new Error('Test failed');
        });

    it('enables the actor to interact with the website', function () {
        return actorCalled('Mocha').attemptsTo(
            StartLocalServer.onRandomPort(),
            UseAngular.disableSynchronisation(),
            Navigate.to(LocalServer.url()),
            Check.whether(counter++, equals(3))
                .andIfSo(Ensure.that(Website.title(), equals('Test Website')))
                .otherwise(FailTheTest()),
        );
    });

    afterEach(() => actorInTheSpotlight().attemptsTo(
        StopLocalServer.ifRunning(),
    ));
});
