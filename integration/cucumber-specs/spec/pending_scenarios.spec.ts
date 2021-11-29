import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, when } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSkipped, FeatureTag, ImplementationPending, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it(`recognises a pending scenario where some steps are marked as 'pending'`, () =>
        cucumber('features/pending_scenarios.feature', 'common.steps.ts', [ '--name', 'A scenario with steps marked as pending', '--no-strict' ])
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(res => {
                // expect(res.exitCode).to.equal(0);

                PickEvent.from(res.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario with steps marked as pending')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given a step that's marked as pending`)))
                    .next(ActivityFinished,    event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                    .next(SceneFinishes,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                    .next(SceneFinished,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                ;
            })
    );

    it(`recognises a pending scenario where some steps have not been implemented yet`, () =>
        cucumber('features/pending_scenarios.feature', 'common.steps.ts', [ '--name', 'A scenario with steps that have not been implemented yet', '--no-strict' ])
            // .then(ifExitCodeIsOtherThan(0, logOutput)).   // cucumber 3 ignores the --no-strict mode
            .then(res => {
                // expect(res.exitCode).to.equal(0);        // cucumber 3 ignores the --no-strict mode

                PickEvent.from(res.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario with steps that have not been implemented yet')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given a step that hasn't been implemented yet`)))
                    .next(ActivityFinished,    event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                    .next(SceneFinishes,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                    .next(SceneFinished,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                ;
            })
    );

    when(cucumberVersion().major() <= 2)
        .it(`recognises a scenario tagged as 'pending' (cucumber <= 2)`, () =>
            cucumber('features/pending_scenarios.feature', [ 'common.steps.ts', 'wip_hook.steps.ts' ], [
                '--name', 'A scenario which tag marks it as pending',
                '--no-strict',  // considered only when steps are explicitly marked as 'pending'
            ])
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(res => {
                    // expect(res.exitCode).to.equal(0);

                    PickEvent.from(res.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario which tag marks it as pending')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given step number one that passes`)))
                        .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`And step number two that is marked as pending`)))
                        .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`And step number three that fails with a generic error`)))
                        .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                        .next(SceneFinished,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                    ;
                })
        );

    when(3 <= cucumberVersion().major() && cucumberVersion().major() <= 6)
        .it(`recognises a scenario tagged as 'pending' (3 <= cucumber <= 6)`, () =>
            cucumber('features/pending_scenarios.feature', [ 'common.steps.ts', 'wip_hook.steps.ts' ], [
                '--name', 'A scenario which tag marks it as pending'
            ])
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(res => {
                    expect(res.exitCode).to.equal(1);

                    PickEvent.from(res.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario which tag marks it as pending')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given step number one that passes`)))
                        .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`And step number two that is marked as pending`)))
                        .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`And step number three that fails with a generic error`)))
                        .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                        .next(SceneFinished,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                    ;
                })
        );

    when(7 <= cucumberVersion().major())
        .it(`recognises a scenario tagged as 'pending' (7 <= cucumber)`, () =>
            cucumber('features/pending_scenarios.feature', [ 'common.steps.ts', 'wip_hook.steps.ts' ], [
                '--name', 'A scenario which tag marks it as pending',
                '--no-strict',  // considered only when steps are explicitly marked as 'pending'
            ])
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(res => {
                    expect(res.exitCode).to.equal(0);

                    PickEvent.from(res.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario which tag marks it as pending')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Before`)))
                        .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ImplementationPending))
                        .next(SceneFinishes,       event => expect(event.outcome).to.be.instanceOf(ImplementationPending))
                        .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ImplementationPending))
                    ;
                })
        );
});
