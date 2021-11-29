import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneTagged } from '@serenity-js/core/lib/events';
import { CapabilityTag, FeatureTag } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises directories features are grouped in as capabilities', () =>
        cucumber('features/example_capability/example.feature', 'common.steps.ts')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(res => {
                expect(res.exitCode).to.equal(0);

                PickEvent.from(res.events)
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('example_capability')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises capabilities')))
                ;
            })
    );
});
